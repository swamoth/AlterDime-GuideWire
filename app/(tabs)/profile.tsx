// Profile Screen
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  async function handleSignOut() {
    await AsyncStorage.multiRemove(['gigshield_user', 'gigshield_email']);
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <Text style={styles.name}>Ravi Kumar</Text>
        <Text style={styles.sub}>Zomato & Swiggy Partner · Bangalore, KA</Text>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Policy Active</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Member Since</Text>
          <Text style={styles.statValue}>Jan 2026</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>NCD Bonus</Text>
          <Text style={[styles.statValue, { color: Colors.dark.lime }]}>15%</Text>
        </View>
      </View>

      {/* Menu items */}
      <Text style={styles.sectionLabel}>Account</Text>
      {[
        { icon: '📍', title: 'Delivery Zones', sub: 'Koramangala, Indiranagar, HSR' },
        { icon: '💳', title: 'Payment History', sub: 'Premiums & payout statements' },
        { icon: '🪪', title: 'KYC Documents', sub: 'Aadhaar & Platform ID verified' },
        { icon: '💬', title: 'WhatsApp Alerts', sub: 'Claim & payout notifications' },
        { icon: '🌐', title: 'Language', sub: 'English · हिंदी · ಕನ್ನಡ' },
        { icon: '🎧', title: 'Help & Support', sub: '24/7 chat support' },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem}>
          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>GigShield AI v1.0 · Guidewire DEVTrails 2026</Text>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.dark.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#0D0D0D' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.dark.textPrimary },
  sub: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52,199,89,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.green },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.dark.green },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.border },
  statLabel: { fontSize: 11, color: Colors.dark.textTertiary, fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.dark.textPrimary, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.card, borderRadius: Radius.sm, padding: 14, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 8 },
  menuTitle: { fontSize: 14, fontWeight: '600', color: Colors.dark.textPrimary },
  menuSub: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 2 },
  chevron: { fontSize: 20, color: Colors.dark.textTertiary },
  signOutBtn: { backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' },
  signOutText: { fontSize: 14, fontWeight: '700', color: Colors.dark.red },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.dark.textTertiary, marginTop: 20 },
});
