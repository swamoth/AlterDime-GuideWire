// Home Dashboard Screen — with real data, animated counters, notification preview
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { ShieldCheck, Zap, Radio, Camera, AlertTriangle, CloudRain, Flame, Wind, Waves, Ban, Bot, Bell, X } from 'lucide-react-native';
import { getMockClaimHistory } from '../../services/claimEngine';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import Animated, { FadeIn, FadeInDown, FadeInRight, SlideInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Ravi Kumar');
  const [showNotification, setShowNotification] = useState(true);

  // Compute real data from claim history
  const claims = getMockClaimHistory();
  const totalSavings = claims.reduce((sum, c) => sum + c.payoutAmount, 0);
  const paidCount = claims.filter(c => c.status === 'paid').length;
  const maxPayout = Math.max(...claims.map(c => c.payoutAmount));

  // Notification dismiss timer
  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // Pulsing dot animation for notification
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

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const name = await AsyncStorage.getItem('gigshield_user');
    if (name) setUserName(name);
  }

  function triggerHaptic() {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }

  return (
    <Animated.ScrollView 
      entering={FadeIn.duration(400)} 
      style={styles.container} 
      contentContainerStyle={styles.content}
    >
      {/* Notification Preview */}
      {showNotification && (
        <Animated.View entering={SlideInUp.duration(500).springify()} style={styles.notifCard}>
          <View style={styles.notifIconBox}>
            <Animated.View style={pulseStyle}>
              <Bell size={18} color={Colors.dark.lime} />
            </Animated.View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitle}>GigShield Alert</Text>
            <Text style={styles.notifBody}>Heavy Rain triggered in Mumbai. Your claim of ₹1,300 is being processed.</Text>
            <Text style={styles.notifTime}>Just now</Text>
          </View>
          <TouchableOpacity onPress={() => setShowNotification(false)} style={styles.notifClose}>
            <X size={16} color={Colors.dark.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.sub}>Zomato & Swiggy Partner · Bangalore</Text>
      </Animated.View>

      {/* Balance Card */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Savings from Claims</Text>
        <AnimatedCounter
          value={totalSavings}
          prefix="₹"
          duration={1500}
          style={styles.balanceAmount}
        />
        <View style={styles.balanceRow}>
          <Text style={styles.balanceMeta}>Plan: <Text style={{ fontWeight: '700' }}>Smart Shield</Text></Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>Active</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions — with Camera */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actionGrid}>
        {[
          { icon: <ShieldCheck size={24} color={Colors.dark.textSecondary} />, iconActive: <ShieldCheck size={24} color={Colors.dark.lime} />, label: 'Premium', route: '/(tabs)/premium' },
          { icon: <Zap size={24} color={Colors.dark.textSecondary} />, iconActive: <Zap size={24} color={Colors.dark.lime} />, label: 'Claims', route: '/(tabs)/claims' },
          { icon: <Radio size={24} color={Colors.dark.textSecondary} />, iconActive: <Radio size={24} color={Colors.dark.lime} />, label: 'Monitor', route: '/(tabs)/monitor' },
          { icon: <Camera size={24} color={Colors.dark.textSecondary} />, iconActive: <Camera size={24} color={Colors.dark.lime} />, label: 'Evidence', route: '/camera' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionItem}
            onPress={() => {
              triggerHaptic();
              router.push(action.route as any);
            }}
          >
            <View style={[
              styles.actionIcon,
              action.label === 'Evidence' && styles.actionIconHighlight,
            ]}>
              {action.label === 'Evidence' ? action.iconActive : action.icon}
            </View>
            <Text style={[
              styles.actionLabel,
              action.label === 'Evidence' && styles.actionLabelHighlight,
            ]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Active Triggers Alert */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.triggerAlert}>
        <View style={styles.triggerAlertHeader}>
          <AlertTriangle size={24} color={Colors.dark.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.triggerAlertTitle}>5 Triggers Monitored</Text>
            <Text style={styles.triggerAlertSub}>Rain · Heat · AQI · Flooding · Curfew</Text>
          </View>
          <TouchableOpacity
            style={styles.triggerAlertBtn}
            onPress={() => {
              triggerHaptic();
              router.push('/(tabs)/monitor' as any);
            }}
          >
            <Text style={styles.triggerAlertBtnText}>View</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.triggerPills}>
          {[
            { icon: <CloudRain size={14} color={Colors.dark.textPrimary} />, name: 'Rain', api: 'Real' },
            { icon: <Flame size={14} color={Colors.dark.textPrimary} />, name: 'Heat', api: 'Real' },
            { icon: <Wind size={14} color={Colors.dark.textPrimary} />, name: 'AQI', api: 'Real' },
            { icon: <Waves size={14} color={Colors.dark.textPrimary} />, name: 'Flood', api: 'Mock' },
            { icon: <Ban size={14} color={Colors.dark.textPrimary} />, name: 'Curfew', api: 'Mock' },
          ].map((t, i) => (
            <Animated.View key={i} entering={FadeInRight.delay(500 + i * 80).duration(300)} style={styles.triggerPill}>
              {t.icon}
              <Text style={styles.triggerPillText}>{t.name}</Text>
              <View style={[styles.apiTag, t.api === 'Real' ? styles.apiTagReal : styles.apiTagMock]}>
                <Text style={styles.apiTagText}>{t.api}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Stats */}
      <Text style={styles.sectionLabel}>Stats</Text>
      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Claims Paid</Text>
          <AnimatedCounter
            value={paidCount}
            duration={1000}
            style={[styles.statValue, { color: Colors.dark.lime }]}
          />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Max Payout</Text>
          <AnimatedCounter
            value={maxPayout}
            prefix="₹"
            duration={1200}
            style={[styles.statValue, { color: Colors.dark.green }]}
          />
        </View>
      </Animated.View>

      {/* AI Insight */}
      <Text style={styles.sectionLabel}>AI Prediction</Text>
      <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.insightCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Bot size={16} color={Colors.dark.lime} />
          <Text style={styles.insightHeader}>Smart Alert</Text>
        </View>
        <Text style={styles.insightText}>
          Heavy rain predicted in your zone next week. Premium may increase by <Text style={{ fontWeight: '700' }}>~10%</Text>. Expected disruption: <Text style={{ fontWeight: '700' }}>2-3 days</Text>.
        </Text>
      </Animated.View>

      {/* Recent Activity — from real claim data */}
      <Text style={styles.sectionLabel}>Recent Activity</Text>
      {claims.map((claim, i) => (
        <Animated.View
          key={claim.id}
          entering={FadeInDown.delay(700 + i * 80).duration(400)}
          style={styles.listItem}
        >
          <View style={{ width: 32, alignItems: 'center' }}>
            {claim.triggerId === 'heavy_rain' ? <CloudRain size={24} color={Colors.dark.blue} /> :
             claim.triggerId === 'extreme_heat' ? <Flame size={24} color={Colors.dark.orange} /> :
             claim.triggerId === 'aqi_spike' ? <Wind size={24} color={Colors.dark.textSecondary} /> :
             claim.triggerId === 'curfew' ? <Ban size={24} color={Colors.dark.red} /> :
             <Waves size={24} color={Colors.dark.blue} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.listTitle}>{claim.triggerName} — {claim.city}</Text>
            <Text style={styles.listSub}>{claim.date} · Auto-triggered</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.listAmount}>+₹{claim.payoutAmount.toLocaleString()}</Text>
            <View style={styles.tagPaid}>
              <Text style={styles.tagText}>{claim.status === 'paid' ? 'Paid' : claim.status}</Text>
            </View>
          </View>
        </Animated.View>
      ))}

      <View style={{ height: 24 }} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  welcome: { fontSize: 13, color: Colors.dark.textSecondary },
  name: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: Colors.dark.textTertiary, marginBottom: 20 },

  // Notification
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(164,227,103,0.08)',
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.borderLime,
    gap: 12,
  },
  notifIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(164,227,103,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark.lime },
  notifBody: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 4 },
  notifClose: { padding: 4 },

  balanceCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.borderLime,
    marginBottom: 20,
  },
  balanceLabel: { fontSize: 12, color: Colors.dark.textSecondary, fontWeight: '600' },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: Colors.dark.textPrimary, marginVertical: 4 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceMeta: { fontSize: 13, color: Colors.dark.textSecondary },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52,199,89,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.green },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.dark.green },
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionItem: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.dark.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  actionIconHighlight: { borderColor: Colors.dark.lime, backgroundColor: 'rgba(203,255,0,0.08)' },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.dark.textSecondary },
  actionLabelHighlight: { color: Colors.dark.lime },

  // Trigger alert
  triggerAlert: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 16 },
  triggerAlertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  triggerAlertTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark.textPrimary },
  triggerAlertSub: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
  triggerAlertBtn: { backgroundColor: Colors.dark.lime, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  triggerAlertBtnText: { fontSize: 12, fontWeight: '700', color: Colors.dark.background },
  triggerPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  triggerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.dark.elevated, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  triggerPillText: { fontSize: 11, fontWeight: '600', color: Colors.dark.textPrimary },
  apiTag: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  apiTagReal: { backgroundColor: 'rgba(52,199,89,0.2)' },
  apiTagMock: { backgroundColor: 'rgba(255,149,0,0.2)' },
  apiTagText: { fontSize: 8, fontWeight: '700', color: Colors.dark.textSecondary },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.border },
  statLabel: { fontSize: 11, color: Colors.dark.textTertiary, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  insightCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.borderLime, marginBottom: 16 },
  insightHeader: { fontSize: 13, fontWeight: '700', color: Colors.dark.lime, marginBottom: 6 },
  insightText: { fontSize: 13, color: Colors.dark.textSecondary, lineHeight: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 8 },
  listTitle: { fontSize: 14, fontWeight: '600', color: Colors.dark.textPrimary },
  listSub: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 2 },
  listAmount: { fontSize: 15, fontWeight: '800', color: Colors.dark.lime },
  tagPaid: { backgroundColor: 'rgba(52,199,89,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  tagText: { fontSize: 10, fontWeight: '700', color: Colors.dark.green },
});
