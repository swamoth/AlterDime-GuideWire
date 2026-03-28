// Home Dashboard Screen
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Ravi Kumar');

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const name = await AsyncStorage.getItem('gigshield_user');
    if (name) setUserName(name);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.welcome}>Welcome back</Text>
      <Text style={styles.name}>{userName}</Text>
      <Text style={styles.sub}>Zomato & Swiggy Partner · Bangalore</Text>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Savings from Claims</Text>
        <Text style={styles.balanceAmount}>₹4,650</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceMeta}>Plan: <Text style={{ fontWeight: '700' }}>Smart Shield</Text></Text>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>Active</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionGrid}>
        {[
          { icon: '💰', label: 'Premium', route: '/(tabs)/premium' },
          { icon: '⚡', label: 'Claims', route: '/(tabs)/claims' },
          { icon: '📡', label: 'Monitor', route: '/(tabs)/monitor' },
          { icon: '📋', label: 'Policy', route: '/(tabs)/policy' },
        ].map((action) => (
          <TouchableOpacity key={action.label} style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Text style={{ fontSize: 22 }}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <Text style={styles.sectionLabel}>Stats</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Claims Paid</Text>
          <Text style={[styles.statValue, { color: Colors.dark.lime }]}>5</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Max Payout</Text>
          <Text style={[styles.statValue, { color: Colors.dark.green }]}>₹2,500</Text>
        </View>
      </View>

      {/* AI Insight */}
      <Text style={styles.sectionLabel}>AI Prediction</Text>
      <View style={styles.insightCard}>
        <Text style={styles.insightHeader}>🤖 Smart Alert</Text>
        <Text style={styles.insightText}>
          Heavy rain predicted in your zone next week. Premium may increase by <Text style={{ fontWeight: '700' }}>~10%</Text>. Expected disruption: <Text style={{ fontWeight: '700' }}>2-3 days</Text>.
        </Text>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionLabel}>Recent Activity</Text>
      {[
        { icon: '🌧️', title: 'Heavy Rainfall — Mumbai', date: '12 Mar · Auto-triggered', amount: '+₹1,300', status: 'Paid' },
        { icon: '🔥', title: 'Heat Wave — Delhi', date: '5 Mar · Auto-triggered', amount: '+₹1,040', status: 'Paid' },
        { icon: '💨', title: 'AQI Spike — Delhi NCR', date: '18 Feb · Auto-triggered', amount: '+₹300', status: 'Paid' },
      ].map((item, i) => (
        <View key={i} style={styles.listItem}>
          <Text style={{ fontSize: 24 }}>{item.icon}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listSub}>{item.date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.listAmount}>{item.amount}</Text>
            <View style={styles.tagPaid}>
              <Text style={styles.tagText}>{item.status}</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  welcome: { fontSize: 13, color: Colors.dark.textSecondary },
  name: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: Colors.dark.textTertiary, marginBottom: 20 },
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
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.dark.textSecondary },
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
