// Live Monitor Screen — Real-time weather, AQI, and all 5 parametric triggers
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { evaluateAllTriggers, AllTriggersResult, TriggerResult } from '../../services/triggerApis';
import { AlertTriangle, Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, Droplet, Wind, Zap, ShieldCheck, Link2, Camera, Flame, Waves, Ban, Newspaper, Wallet, Activity } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const CITIES = ['bangalore', 'mumbai', 'delhi', 'chennai', 'pune', 'kolkata'];

export default function MonitorScreen() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('mumbai');
  const [data, setData] = useState<AllTriggersResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Pulsing dot animation for live triggers
  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.3, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  function triggerHaptic() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const result = await evaluateAllTriggers(selectedCity);
      setData(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function getAQIColor(aqi: number) {
    if (aqi <= 1) return Colors.dark.green;
    if (aqi <= 2) return Colors.dark.lime;
    if (aqi <= 3) return Colors.dark.yellow;
    return Colors.dark.red;
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return Colors.dark.red;
      case 'warning': return Colors.dark.orange;
      default: return Colors.dark.green;
    }
  }

  function getTriggerIcon(triggerId: string, size = 28) {
    switch (triggerId) {
      case 'heavy_rain': return <CloudRain size={size} color={Colors.dark.textPrimary} />;
      case 'extreme_heat': return <Flame size={size} color={Colors.dark.orange} />;
      case 'aqi_spike': return <Wind size={size} color={Colors.dark.textSecondary} />;
      case 'curfew': return <Ban size={size} color={Colors.dark.red} />;
      case 'flooding': return <Waves size={size} color={Colors.dark.blue} />;
      default: return <AlertTriangle size={size} color={Colors.dark.orange} />;
    }
  }

  function getSeverityBg(severity: string) {
    switch (severity) {
      case 'critical': return 'rgba(255,59,48,0.12)';
      case 'warning': return 'rgba(255,149,0,0.12)';
      default: return 'rgba(52,199,89,0.08)';
    }
  }

  const activeTriggers = data?.triggers.filter(t => t.isActive) || [];
  const warningTriggers = data?.triggers.filter(t => t.severity === 'warning') || [];
  const safeTriggers = data?.triggers.filter(t => t.severity === 'none') || [];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <Animated.ScrollView entering={FadeIn.duration(400)} style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Live{'\n'}Monitor</Text>
        <Text style={styles.subtitle}>
          Real-time disruption tracking • {data ? `Updated ${data.lastUpdated}` : 'Loading...'}
        </Text>

        {/* City Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={styles.cityRow}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => {
                  triggerHaptic();
                  setSelectedCity(city);
                }}
                style={[
                  styles.cityChip,
                  selectedCity === city && styles.cityChipActive,
                ]}
              >
                <Text style={[
                  styles.cityChipText,
                  selectedCity === city && styles.cityChipTextActive,
                ]}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.dark.lime} size="large" />
            <Text style={styles.loadingText}>Fetching live data from 5 sources...</Text>
          </View>
        ) : data ? (
          <>
            {/* Active Trigger Alert */}
            {activeTriggers.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.alertBanner}>
                <Animated.View style={pulseStyle}>
                  <AlertTriangle size={28} color={Colors.dark.red} />
                </Animated.View>
                <View style={{ flex: 1, paddingLeft: 6 }}>
                  <Text style={styles.alertTitle}>
                    {activeTriggers.length} Active Trigger{activeTriggers.length > 1 ? 's' : ''} Detected
                  </Text>
                  <Text style={styles.alertSub}>
                    Auto-claim pipeline ready • 2+ sources validated
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Weather Card */}
            {data.weather && (
              <View style={styles.weatherCard}>
                <View style={styles.weatherHeader}>
                  {data.weather.icon?.includes('01') ? <Sun color="#FFD60A" size={48} /> :
                    data.weather.icon?.includes('02') ? <CloudSun color="#FF9500" size={48} /> :
                      data.weather.icon?.includes('03') ? <Cloud color="#8E8E93" size={48} /> :
                        data.weather.icon?.includes('09') || data.weather.icon?.includes('10') ? <CloudRain color="#0A84FF" size={48} /> :
                          data.weather.icon?.includes('11') ? <CloudLightning color="#FF375F" size={48} /> :
                            data.weather.icon?.includes('13') ? <Snowflake color="#64D2FF" size={48} /> :
                              <CloudSun color="#CBFF00" size={48} />}
                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.temp}>{data.weather.temp}°C</Text>
                    <Text style={styles.feelsLike}>Feels like {data.weather.feelsLike}°C</Text>
                  </View>
                </View>
                <Text style={styles.weatherDesc}>{data.weather.description}</Text>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Droplet size={14} color="#64D2FF" />
                      <Text style={styles.detailLabel}>Humidity</Text>
                    </View>
                    <Text style={styles.detailValue}>{data.weather.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Wind size={14} color="#8E8E93" />
                      <Text style={styles.detailLabel}>Wind</Text>
                    </View>
                    <Text style={styles.detailValue}>{data.weather.windSpeed} km/h</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <CloudRain size={14} color="#0A84FF" />
                      <Text style={styles.detailLabel}>Rain</Text>
                    </View>
                    <Text style={styles.detailValue}>{data.weather.rain1h} mm</Text>
                  </View>
                </View>
              </View>
            )}

            {/* AQI Card */}
            {data.aqi && (
              <View style={[styles.aqiCard, { borderColor: getAQIColor(data.aqi.aqi) }]}>
                <View style={styles.aqiHeader}>
                  <Text style={styles.aqiLabel}>Air Quality Index</Text>
                  <View style={[styles.aqiBadge, { backgroundColor: getAQIColor(data.aqi.aqi) }]}>
                    <Text style={styles.aqiBadgeText}>{data.aqi.status}</Text>
                  </View>
                </View>
                <View style={styles.aqiRow}>
                  <Text style={[styles.aqiValue, { color: getAQIColor(data.aqi.aqi) }]}>
                    {data.aqi.aqiValue}
                  </Text>
                  <Text style={styles.aqiMax}>/500</Text>
                </View>
                <View style={styles.aqiBar}>
                  <View style={[styles.aqiProgress, {
                    width: `${((data.aqi.aqiValue || 0) / 500) * 100}%`,
                    backgroundColor: getAQIColor(data.aqi.aqi)
                  }]} />
                </View>
                <Text style={styles.aqiSource}>Source: CPCB • OpenWeatherMap Air Pollution API</Text>
              </View>
            )}

            {/* ─── All 5 Trigger Status Cards ─── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Zap size={18} color={Colors.dark.lime} />
              <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Parametric Triggers ({data.triggers.length})</Text>
            </View>
            <Text style={styles.sectionSub}>
              {activeTriggers.length} active • {warningTriggers.length} warning • {safeTriggers.length} clear
            </Text>

            {data.triggers.map((trigger, i) => (
              <View
                key={trigger.triggerId}
                style={[
                  styles.triggerCard,
                  { borderColor: getSeverityColor(trigger.severity), backgroundColor: getSeverityBg(trigger.severity) },
                  trigger.isActive && styles.triggerCardActive
                ]}
              >
                <View style={styles.triggerHeader}>
                  <View style={{ marginRight: 12 }}>
                    {getTriggerIcon(trigger.triggerId, 28)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.triggerName}>{trigger.triggerName}</Text>
                    <Text style={styles.triggerThreshold}>
                      Threshold: {trigger.threshold}
                    </Text>
                  </View>
                  <View style={[
                    styles.triggerBadge,
                    { backgroundColor: getSeverityColor(trigger.severity) },
                  ]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {trigger.isActive && (
                        <Animated.View style={[pulseStyle, { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.dark.background }]} />
                      )}
                      <Text style={styles.triggerBadgeText}>
                        {trigger.isActive ? 'LIVE RECORDING' : trigger.severity === 'warning' ? 'WARNING' : 'CLEAR'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Current Value */}
                <View style={styles.triggerValueRow}>
                  <Text style={styles.triggerValueLabel}>
                    Current: <Text style={[styles.triggerValueText, { color: getSeverityColor(trigger.severity) }]}>
                      {trigger.currentValue}
                    </Text>
                  </Text>
                </View>

                {/* Sources & Confidence */}
                <View style={styles.triggerFooter}>
                  <View style={styles.sourceRow}>
                    {trigger.sources.map((src, j) => (
                      <View key={j} style={styles.sourceTag}>
                        <Text style={styles.sourceText}>{src}</Text>
                      </View>
                    ))}
                  </View>
                  {trigger.isActive && (
                    <View style={styles.confidenceTag}>
                      <Text style={styles.confidenceText}>
                        {trigger.confidence}% confidence
                      </Text>
                    </View>
                  )}
                </View>

                {/* Payout info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                  {trigger.isActive && <Wallet size={12} color={Colors.dark.lime} />}
                  <Text style={[styles.triggerPayout, { marginTop: 0 }]}>
                    Payout: {trigger.payoutRange}
                    {trigger.isActive ? ' • Auto-claim ready' : ''}
                  </Text>
                </View>

                <Text style={styles.triggerTime}>Last checked: {trigger.lastChecked}</Text>
              </View>
            ))}

            {/* Validation Info */}
            <View style={styles.validationCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <ShieldCheck size={16} color={Colors.dark.lime} />
                <Text style={styles.validationTitle}>Multi-Source Validation</Text>
              </View>
              <Text style={styles.validationText}>
                Every trigger requires confirmation from 2+ independent data sources before claim activation.
                Cross-validated against: OpenWeatherMap, IMD, CPCB, NDMA, Govt Advisories.
              </Text>
            </View>
          </>
        ) : null}

        {/* Live Disruption Feed */}
        {data && data.news && data.news.length > 0 && (
          <View style={{ marginTop: 24, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Newspaper size={20} color={Colors.dark.lime} />
              <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.dark.textPrimary, letterSpacing: -0.5 }}>Live Disruption Feed</Text>
            </View>
            <View style={styles.newsContainer}>
              {data.news.map((n, i) => (
                <View key={i} style={styles.newsCard}>
                  <Text style={styles.newsTitle}>{n.title}</Text>
                  <Text style={styles.newsDesc} numberOfLines={2}>{n.description}</Text>
                  <View style={styles.newsFooter}>
                    <Text style={styles.newsSource}>{n.source.name}</Text>
                    <Text style={styles.newsDate}>{new Date(n.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* API Info */}
        <View style={styles.apiInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Link2 size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.apiInfoText}>Connected APIs</Text>
          </View>
          <Text style={styles.apiInfoSub}>OpenWeatherMap • CPCB AQI • IMD • NDMA • Govt Advisory</Text>
          <Text style={styles.apiInfoSub}>3 Real APIs + 2 Mock APIs = 5 Parametric Triggers</Text>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Camera FAB */}
      <TouchableOpacity
        style={styles.cameraFab}
        onPress={() => router.push('/camera')}
        activeOpacity={0.8}
      >
        <Camera size={24} color={Colors.dark.background} />
        <Text style={styles.cameraFabLabel}>Evidence</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, marginBottom: 16 },
  cityRow: { flexDirection: 'row', gap: 8 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border },
  cityChipActive: { backgroundColor: Colors.dark.lime, borderColor: Colors.dark.lime },
  cityChipText: { fontSize: 13, fontWeight: '600', color: Colors.dark.textSecondary },
  cityChipTextActive: { color: Colors.dark.background },
  loadingBox: { padding: 60, alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.dark.textSecondary, fontSize: 13 },

  // Alert banner
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.12)', borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.red, marginBottom: 16, gap: 12 },
  alertIcon: { fontSize: 28 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.red },
  alertSub: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2 },

  // Weather card
  weatherCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 20, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 16 },
  weatherHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  weatherIcon: { fontSize: 48 },
  temp: { fontSize: 42, fontWeight: '800', color: Colors.dark.textPrimary },
  feelsLike: { fontSize: 13, color: Colors.dark.textSecondary },
  weatherDesc: { fontSize: 16, color: Colors.dark.textSecondary, textTransform: 'capitalize', marginTop: 4, marginBottom: 16 },
  weatherDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  weatherDetail: { alignItems: 'center' },
  detailLabel: { fontSize: 11, color: Colors.dark.textTertiary },
  detailValue: { fontSize: 15, fontWeight: '700', color: Colors.dark.textPrimary, marginTop: 4 },

  // AQI card
  aqiCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 20, borderWidth: 1, marginBottom: 20 },
  aqiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aqiLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark.textSecondary },
  aqiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  aqiBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.dark.background },
  aqiRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  aqiValue: { fontSize: 56, fontWeight: '800' },
  aqiMax: { fontSize: 20, color: Colors.dark.textTertiary },
  aqiBar: { height: 8, backgroundColor: Colors.dark.elevated, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  aqiProgress: { height: '100%', borderRadius: 4 },
  aqiSource: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 12 },

  // Section
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.dark.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: Colors.dark.textSecondary, marginBottom: 12 },

  // Trigger cards
  triggerCard: { borderRadius: Radius.md, padding: 16, borderWidth: 1, marginBottom: 12 },
  triggerCardActive: {
    shadowColor: Colors.dark.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    // Removed Android `elevation: 5` which freezes dynamic bound measurements
  },
  triggerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  triggerIcon: { fontSize: 28 },
  triggerName: { fontSize: 16, fontWeight: '700', color: Colors.dark.textPrimary },
  triggerThreshold: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 2 },
  triggerBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  triggerBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  triggerValueRow: { marginTop: 10 },
  triggerValueLabel: { fontSize: 12, color: Colors.dark.textTertiary, lineHeight: 18 },
  triggerValueText: { fontSize: 12, fontWeight: '600' },

  triggerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  sourceRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  sourceTag: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sourceText: { fontSize: 10, fontWeight: '600', color: Colors.dark.textSecondary },
  confidenceTag: { backgroundColor: 'rgba(52,199,89,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  confidenceText: { fontSize: 10, fontWeight: '700', color: Colors.dark.green },

  triggerPayout: { fontSize: 12, color: Colors.dark.lime, marginTop: 8, fontWeight: '600' },
  triggerTime: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 4 },

  // Validation
  validationCard: { backgroundColor: 'rgba(203,255,0,0.06)', borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.borderLime, marginTop: 8 },
  validationTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark.lime, marginBottom: 6 },
  validationText: { fontSize: 12, color: Colors.dark.textSecondary, lineHeight: 18 },

  // News UI
  newsContainer: { gap: 12 },
  newsCard: { backgroundColor: Colors.dark.elevated, padding: 16, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.dark.border },
  newsTitle: { color: Colors.dark.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 6, lineHeight: 20 },
  newsDesc: { color: Colors.dark.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newsSource: { color: Colors.dark.lime, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  newsDate: { color: Colors.dark.textTertiary, fontSize: 10 },

  // API info
  apiInfo: { marginTop: 16, padding: 16, backgroundColor: Colors.dark.elevated, borderRadius: Radius.md },
  apiInfoText: { fontSize: 13, color: Colors.dark.textSecondary, fontWeight: '700' },
  apiInfoSub: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 4 },

  // Camera FAB
  cameraFab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: Colors.dark.lime,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraFabIcon: { fontSize: 22 },
  cameraFabLabel: { fontSize: 9, fontWeight: '700', color: Colors.dark.background, marginTop: 1 },
});
