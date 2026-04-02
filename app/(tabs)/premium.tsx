// Premium Calculator Screen — AI-powered dynamic pricing
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { PLANS, ZONES, SEASONS, CLAIMS_HISTORY } from '../../constants/triggers';
import { calculatePremium, PremiumBreakdown } from '../../services/premiumEngine';
import { Shield, Zap, Flame, Bot, Wallet } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id);
  const [selectedCity, setSelectedCity] = useState('bangalore');
  const [selectedSeason, setSelectedSeason] = useState('monsoon');
  const [selectedClaims, setSelectedClaims] = useState('0');
  const [result, setResult] = useState<PremiumBreakdown | null>(null);

  function compute() {
    triggerHaptic();
    const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
    const breakdown = calculatePremium(
      plan.price,
      plan.name,
      selectedCity,
      selectedSeason,
      selectedClaims
    );
    setResult(breakdown);
  }

  function triggerHaptic() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  const currentPlan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];

  return (
    <Animated.ScrollView entering={FadeIn.duration(400)} style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Calculate{'\n'}Premium</Text>
      <Text style={styles.subtitle}>AI-powered dynamic weekly pricing</Text>

      {/* Plan Selection */}
      <Text style={styles.sectionLabel}>Select Plan</Text>
      <View style={styles.planGrid}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => setSelectedPlan(plan.id)}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
            ]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            <View style={styles.planIcon}>
              {plan.id === 'basic' ? <Shield size={22} color={Colors.dark.textSecondary} /> : plan.id === 'smart' ? <Zap size={22} color={Colors.dark.lime} /> : <Flame size={22} color={Colors.dark.orange} />}
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              ₹{plan.price}<Text style={styles.planPeriod}>/wk</Text>
            </Text>
            <Text style={styles.planMaxPayout}>Max ₹{plan.maxPayout}/week</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* City Selection */}
      <Text style={styles.sectionLabel}>Your City</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={styles.cityRow}>
          {Object.entries(ZONES).map(([key, zone]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCity(key)}
              style={[
                styles.cityChip,
                selectedCity === key && styles.cityChipActive,
              ]}
            >
              <Text style={[
                styles.cityChipText,
                selectedCity === key && styles.cityChipTextActive,
              ]}>{zone.name}</Text>
              <Text style={[
                styles.cityChipRisk,
                selectedCity === key && styles.cityChipTextActive,
              ]}>Risk: {zone.level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Season Selection */}
      <Text style={styles.sectionLabel}>Current Season</Text>
      <View style={styles.seasonRow}>
        {Object.entries(SEASONS).map(([key, season]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSelectedSeason(key)}
            style={[
              styles.seasonChip,
              selectedSeason === key && styles.seasonChipActive,
            ]}
          >
            <Text style={[
              styles.seasonChipText,
              selectedSeason === key && styles.seasonChipTextActive,
            ]}>{season.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Claims History */}
      <Text style={styles.sectionLabel}>Claims History</Text>
      <View style={styles.claimsRow}>
        {Object.entries(CLAIMS_HISTORY).map(([key, claim]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setSelectedClaims(key)}
            style={[
              styles.claimsChip,
              selectedClaims === key && styles.claimsChipActive,
            ]}
          >
            <Text style={[
              styles.claimsChipText,
              selectedClaims === key && styles.claimsChipTextActive,
            ]}>{key === '0' ? '0 Claims' : key === '1-2' ? '1-2 Claims' : '3+ Claims'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calculate Button */}
      <TouchableOpacity style={styles.calculateBtn} onPress={compute}>
        <Text style={styles.calculateBtnText}>Calculate Premium</Text>
      </TouchableOpacity>

      {/* Result */}
      {result && (
        <Animated.View entering={SlideInUp.duration(500).springify()} style={styles.resultCard}>
          <Text style={styles.resultTitle}>Your Weekly Premium</Text>
          <AnimatedCounter 
            value={result.finalPremium} 
            prefix="₹" 
            duration={1500}
            style={styles.resultPrice} 
          />
          <Text style={styles.resultSub}>per week</Text>

          <View style={styles.breakdownBox}>
            {result.steps.map((step, i) => (
              <Animated.View entering={FadeInDown.delay(100 * (i + 1)).duration(400)} key={i} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>{step.label}</Text>
                  {step.model && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Bot size={10} color={Colors.dark.textTertiary} />
                      <Text style={styles.breakdownModel}>{step.model}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.breakdownValue}>{step.value}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.savingsBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Wallet size={14} color={Colors.dark.green} />
              <Text style={styles.savingsText}>
                No-Claim Bonus: {CLAIMS_HISTORY[selectedClaims as keyof typeof CLAIMS_HISTORY].label}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* AI Models Info */}
      <Text style={styles.sectionLabel}>AI Pricing Models</Text>
      <View style={styles.modelsCard}>
        {[
          { name: 'XGBoost', role: 'Zone Risk Scoring', desc: 'Historical weather + disruption frequency analysis' },
          { name: 'Prophet', role: 'Seasonal Forecasting', desc: 'Time-series forecasting for seasonal risk patterns' },
          { name: 'LSTM', role: 'Predictive Adjustment', desc: '7-day weather forecast → premium adjustment (±15%)' },
        ].map((model, i) => (
          <View key={i} style={styles.modelRow}>
            <View style={styles.modelIconBox}>
              <Bot size={18} color={Colors.dark.lime} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modelName}>{model.name}</Text>
              <Text style={styles.modelRole}>{model.role}</Text>
              <Text style={styles.modelDesc}>{model.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  planGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  planCard: { flex: 1, backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  planCardSelected: { borderColor: Colors.dark.lime, backgroundColor: 'rgba(203,255,0,0.05)' },
  popularBadge: { position: 'absolute', top: -8, backgroundColor: Colors.dark.lime, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  popularText: { fontSize: 9, fontWeight: '800', color: Colors.dark.background },
  planIcon: { marginBottom: 6, alignItems: 'center' },
  planName: { fontSize: 13, fontWeight: '700', color: Colors.dark.textPrimary },
  planPrice: { fontSize: 20, fontWeight: '800', color: Colors.dark.lime, marginTop: 4 },
  planPeriod: { fontSize: 12, fontWeight: '400', color: Colors.dark.textSecondary },
  planMaxPayout: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 4 },
  cityRow: { flexDirection: 'row', gap: 8 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, alignItems: 'center' },
  cityChipActive: { backgroundColor: Colors.dark.lime, borderColor: Colors.dark.lime },
  cityChipText: { fontSize: 13, fontWeight: '600', color: Colors.dark.textPrimary },
  cityChipTextActive: { color: Colors.dark.background },
  cityChipRisk: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 2 },
  seasonRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  seasonChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border },
  seasonChipActive: { backgroundColor: Colors.dark.blue, borderColor: Colors.dark.blue },
  seasonChipText: { fontSize: 13, fontWeight: '600', color: Colors.dark.textPrimary },
  seasonChipTextActive: { color: Colors.dark.textPrimary },
  claimsRow: { flexDirection: 'row', gap: 8 },
  claimsChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.dark.card, borderWidth: 1, borderColor: Colors.dark.border, alignItems: 'center' },
  claimsChipActive: { backgroundColor: Colors.dark.green, borderColor: Colors.dark.green },
  claimsChipText: { fontSize: 12, fontWeight: '600', color: Colors.dark.textPrimary },
  claimsChipTextActive: { color: Colors.dark.textPrimary },
  calculateBtn: { backgroundColor: Colors.dark.lime, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 24 },
  calculateBtnText: { fontSize: 16, fontWeight: '800', color: Colors.dark.background },
  resultCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 24, borderWidth: 1, borderColor: Colors.dark.lime, marginBottom: 20 },
  resultTitle: { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center' },
  resultPrice: { fontSize: 48, fontWeight: '800', color: Colors.dark.lime, textAlign: 'center' },
  resultSub: { fontSize: 13, color: Colors.dark.textTertiary, textAlign: 'center', marginBottom: 20 },
  breakdownBox: { backgroundColor: Colors.dark.elevated, borderRadius: Radius.md, padding: 14 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  breakdownLeft: { flex: 1 },
  breakdownLabel: { fontSize: 13, color: Colors.dark.textPrimary },
  breakdownModel: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 2 },
  breakdownValue: { fontSize: 13, fontWeight: '700', color: Colors.dark.textSecondary },
  savingsBox: { marginTop: 12, padding: 12, backgroundColor: 'rgba(52,199,89,0.1)', borderRadius: Radius.sm },
  savingsText: { fontSize: 12, color: Colors.dark.green, textAlign: 'center' },
  modelsCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16 },
  modelRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  modelIconBox: { width: 32, alignItems: 'center', marginRight: 12 },
  modelName: { fontSize: 14, fontWeight: '700', color: Colors.dark.textPrimary },
  modelRole: { fontSize: 12, color: Colors.dark.lime, marginTop: 2 },
  modelDesc: { fontSize: 11, color: Colors.dark.textTertiary, marginTop: 4 },
});
