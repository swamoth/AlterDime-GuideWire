import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius } from '../../constants/theme';
import { MapPin, CreditCard, IdCard, MessageCircle, Globe, Headphones, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Hackathon Judge');

  useEffect(() => {
    async function loadUser() {
      const name = await AsyncStorage.getItem('gigshield_user');
      if (name) setUserName(name);
    }
    loadUser();
  }, []);

  async function handleSignOut() {
    await AsyncStorage.multiRemove(['gigshield_user', 'gigshield_email']);
    router.replace('/(auth)/login');
  }

  return (
    <Animated.ScrollView entering={FadeIn.duration(400)} style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.sub}>Judge Account · Demo Network</Text>
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
        { icon: <MapPin size={20} color={Colors.dark.lime} />, title: 'Delivery Zones', sub: 'Koramangala, Indiranagar, HSR' },
        { icon: <CreditCard size={20} color={Colors.dark.textSecondary} />, title: 'Payment History', sub: 'Premiums & payout statements' },
        { icon: <IdCard size={20} color={Colors.dark.textSecondary} />, title: 'KYC Documents', sub: 'Aadhaar & Platform ID verified' },
        { icon: <MessageCircle size={20} color={Colors.dark.green} />, title: 'WhatsApp Alerts', sub: 'Claim & payout notifications' },
        { icon: <Globe size={20} color={Colors.dark.textSecondary} />, title: 'Language', sub: 'English · हिंदी · ಕನ್ನಡ' },
        { icon: <Headphones size={20} color={Colors.dark.textSecondary} />, title: 'Help & Support', sub: '24/7 chat support' },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem}>
          <View style={styles.menuIconBox}>{item.icon}</View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSub}>{item.sub}</Text>
          </View>
          <ChevronRight size={18} color={Colors.dark.textTertiary} />
        </TouchableOpacity>
      ))}

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>GigShield AI v1.0 · Guidewire DEVTrails 2026</Text>
      <View style={{ height: 24 }} />
    </Animated.ScrollView>
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
  menuIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.dark.elevated, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 14, fontWeight: '600', color: Colors.dark.textPrimary },
  menuSub: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 2 },
  signOutBtn: { backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' },
  signOutText: { fontSize: 14, fontWeight: '700', color: Colors.dark.red },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.dark.textTertiary, marginTop: 20 },
});
