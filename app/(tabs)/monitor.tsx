// Live Monitor Screen — Real-time weather & AQI
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { fetchWeather, fetchAQI, WeatherData, AQIData } from '../../services/weatherApi';
import { TRIGGERS } from '../../constants/triggers';

const CITIES = ['bangalore', 'mumbai', 'delhi', 'chennai', 'pune', 'kolkata'];

export default function MonitorScreen() {
  const [selectedCity, setSelectedCity] = useState('bangalore');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedCity]);

  async function loadData() {
    setLoading(true);
    try {
      const [w, a] = await Promise.all([
        fetchWeather(selectedCity),
        fetchAQI(selectedCity),
      ]);
      setWeather(w);
      setAqi(a);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
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

  function getTriggerStatus() {
    if (!weather || !aqi) return [];
    const triggers = [];
    
    if (weather.rain1h > 64.5) {
      triggers.push({ ...TRIGGERS.heavyRain, status: 'active', value: `${weather.rain1h}mm/h` });
    }
    if (weather.temp > 45) {
      triggers.push({ ...TRIGGERS.extremeHeat, status: 'active', value: `${weather.temp}°C` });
    }
    if (aqi.aqi >= 4) {
      triggers.push({ ...TRIGGERS.aqiSpike, status: 'active', value: `AQI ${aqi.aqiValue}` });
    }
    
    return triggers;
  }

  const activeTriggers = getTriggerStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Live{'\n'}Monitor</Text>
      <Text style={styles.subtitle}>Real-time disruption tracking • Updated {lastUpdated}</Text>

      {/* City Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={styles.cityRow}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setSelectedCity(city)}
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
          <Text style={styles.loadingText}>Fetching live data...</Text>
        </View>
      ) : (
        <>
          {/* Weather Card */}
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <Text style={styles.weatherIcon}>
                {weather?.icon?.includes('01') ? '☀️' : 
                 weather?.icon?.includes('02') ? '⛅' :
                 weather?.icon?.includes('03') ? '☁️' :
                 weather?.icon?.includes('09') || weather?.icon?.includes('10') ? '🌧️' :
                 weather?.icon?.includes('11') ? '⚡' :
                 weather?.icon?.includes('13') ? '❄️' : '🌤️'}
              </Text>
              <View>
                <Text style={styles.temp}>{weather?.temp}°C</Text>
                <Text style={styles.feelsLike}>Feels like {weather?.feelsLike}°C</Text>
              </View>
            </View>
            <Text style={styles.weatherDesc}>{weather?.description}</Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Text style={styles.detailLabel}>💧 Humidity</Text>
                <Text style={styles.detailValue}>{weather?.humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.detailLabel}>🌬️ Wind</Text>
                <Text style={styles.detailValue}>{weather?.windSpeed} km/h</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.detailLabel}>🌧️ Rain</Text>
                <Text style={styles.detailValue}>{weather?.rain1h} mm</Text>
              </View>
            </View>
          </View>

          {/* AQI Card */}
          <View style={[styles.aqiCard, { borderColor: getAQIColor(aqi?.aqi || 1) }]}>
            <View style={styles.aqiHeader}>
              <Text style={styles.aqiLabel}>Air Quality Index</Text>
              <View style={[styles.aqiBadge, { backgroundColor: getAQIColor(aqi?.aqi || 1) }]}>
                <Text style={styles.aqiBadgeText}>{aqi?.status}</Text>
              </View>
            </View>
            <View style={styles.aqiRow}>
              <Text style={[styles.aqiValue, { color: getAQIColor(aqi?.aqi || 1) }]}>
                {aqi?.aqiValue}
              </Text>
              <Text style={styles.aqiMax}>/500</Text>
            </View>
            <View style={styles.aqiBar}>
              <View style={[styles.aqiProgress, { 
                width: `${((aqi?.aqiValue || 0) / 500) * 100}%`,
                backgroundColor: getAQIColor(aqi?.aqi || 1)
              }]} />
            </View>
            <Text style={styles.aqiSource}>Source: CPCB • OpenWeatherMap</Text>
          </View>

          {/* Trigger Status */}
          <Text style={styles.sectionLabel}>Trigger Status</Text>
          {activeTriggers.length > 0 ? (
            activeTriggers.map((trigger, i) => (
              <View key={i} style={[styles.triggerCard, { borderColor: Colors.dark.red }]}>
                <View style={styles.triggerHeader}>
                  <Text style={styles.triggerIcon}>
                    {trigger.id === 'heavy_rain' ? '🌧️' :
                     trigger.id === 'extreme_heat' ? '🔥' :
                     trigger.id === 'aqi_spike' ? '💨' : '⚠️'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.triggerName}>{trigger.name}</Text>
                    <Text style={styles.triggerValue}>{trigger.value}</Text>
                  </View>
                  <View style={styles.triggerBadge}>
                    <Text style={styles.triggerBadgeText}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.triggerPayout}>
                  Potential payout: {trigger.payoutRange}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.safeCard}>
              <Text style={styles.safeIcon}>✅</Text>
              <Text style={styles.safeText}>All clear! No active triggers in your zone.</Text>
              <Text style={styles.safeSub}>Conditions are normal. Keep delivering safely!</Text>
            </View>
          )}
        </>
      )}

      {/* API Info */}
      <View style={styles.apiInfo}>
        <Text style={styles.apiInfoText}>🔗 Connected: OpenWeatherMap • CPCB • IMD</Text>
        <Text style={styles.apiInfoSub}>Multi-source validation for claim triggers</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, marginBottom: 16 },
  cityRow: { flexDirection: 'row', gap: 8 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border },
  cityChipActive: { backgroundColor: Colors.dark.lime, borderColor: Colors.dark.lime },
  cityChipText: { fontSize: 13, fontWeight: '600', color: Colors.dark.textSecondary },
  cityChipTextActive: { color: Colors.dark.background },
  loadingBox: { padding: 60, alignItems: 'center' },
  loadingText: { marginTop: 12, color: Colors.dark.textSecondary },
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
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  triggerCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, marginBottom: 12 },
  triggerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  triggerIcon: { fontSize: 28 },
  triggerName: { fontSize: 16, fontWeight: '700', color: Colors.dark.textPrimary },
  triggerValue: { fontSize: 13, color: Colors.dark.textSecondary },
  triggerBadge: { backgroundColor: Colors.dark.red, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  triggerBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.dark.textPrimary },
  triggerPayout: { fontSize: 12, color: Colors.dark.lime, marginTop: 10 },
  safeCard: { backgroundColor: 'rgba(52,199,89,0.08)', borderRadius: Radius.md, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.green },
  safeIcon: { fontSize: 32, marginBottom: 8 },
  safeText: { fontSize: 15, fontWeight: '600', color: Colors.dark.green, textAlign: 'center' },
  safeSub: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 4 },
  apiInfo: { marginTop: 20, padding: 16, backgroundColor: Colors.dark.elevated, borderRadius: Radius.md },
  apiInfoText: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600' },
  apiInfoSub: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 4 },
});
