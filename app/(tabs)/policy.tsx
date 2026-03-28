// Policy Management Screen — Active policy card & management
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { PLANS } from '../../constants/triggers';

export default function PolicyScreen() {
  const activePlan = PLANS[1]; // Smart Shield

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Policy{'\n'}Management</Text>
      <Text style={styles.subtitle}>View and manage your insurance coverage</Text>

      {/* Active Policy Card */}
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <View style={styles.policyBadge}>
            <Text style={styles.policyBadgeText}>ACTIVE</Text>
          </View>
          <Text style={styles.policyId}>Policy #GSA-2026-78432</Text>
        </View>

        <Text style={styles.planName}>{activePlan.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{activePlan.price}</Text>
          <Text style={styles.period}>/week</Text>
        </View>

        <View style={styles.coverageBox}>
          <Text style={styles.coverageLabel}>Coverage Includes:</Text>
          {activePlan.coverage.map((c, i) => (
            <Text key={i} style={styles.coverageItem}>✓ {c}</Text>
          ))}
        </View>

        <View style={styles.payoutRow}>
          <View>
            <Text style={styles.payoutLabel}>Max Weekly Payout</Text>
            <Text style={styles.payoutValue}>₹{activePlan.maxPayout.toLocaleString()}</Text>
          </View>
          <View style={styles.renewalBox}>
            <Text style={styles.renewalLabel}>Auto-Renewal</Text>
            <Text style={styles.renewalValue}>On</Text>
          </View>
        </View>

        <View style={styles.validityRow}>
          <Text style={styles.validityLabel}>Valid until</Text>
          <Text style={styles.validityValue}>31 Dec 2026</Text>
        </View>
      </View>

      {/* Features */}
      <Text style={styles.sectionLabel}>Your Features</Text>
      <View style={styles.featuresList}>
        {activePlan.features.map((feature, i) => (
          <View key={i} style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Premium Breakdown */}
      <Text style={styles.sectionLabel}>Premium Breakdown</Text>
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Base Premium (Smart Shield)</Text>
          <Text style={styles.breakdownValue}>₹49.00</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Zone Risk (Bangalore)</Text>
          <Text style={styles.breakdownValue}>×1.0</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Season (Monsoon)</Text>
          <Text style={styles.breakdownValue}>×1.4</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Claims History (No-Claim Bonus)</Text>
          <Text style={styles.breakdownValue}>×0.85</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>AI Forecast Adjustment</Text>
          <Text style={styles.breakdownValue}>+10%</Text>
        </View>
        <View style={[styles.breakdownRow, styles.breakdownTotal]}>
          <Text style={styles.breakdownTotalLabel}>Total (This Week)</Text>
          <Text style={styles.breakdownTotalValue}>₹58</Text>
        </View>
      </View>

      {/* Actions */}
      <Text style={styles.sectionLabel}>Manage Policy</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>⬆️</Text>
          <Text style={styles.actionLabel}>Upgrade Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>⬇️</Text>
          <Text style={styles.actionLabel}>Downgrade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionLabel}>Renew Manually</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}>
          <Text style={styles.actionIcon}>🚫</Text>
          <Text style={styles.actionLabel}>Cancel Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Trust Score */}
      <Text style={styles.sectionLabel}>Trust Score</Text>
      <View style={styles.trustCard}>
        <View style={styles.trustHeader}>
          <Text style={styles.trustLabel}>Your Trust Score</Text>
          <Text style={styles.trustValue}>A+</Text>
        </View>
        <Text style={styles.trustDesc}>Based on 5 successful claims with 0 fraud flags. You're in the top 15% of policyholders!</Text>
        <View style={styles.trustBenefits}>
          <Text style={styles.trustBenefit}>• 15% No-Claim Bonus applied</Text>
          <Text style={styles.trustBenefit}>• Priority claim processing</Text>
          <Text style={styles.trustBenefit}>• Lower premium adjustments</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, marginBottom: 24 },
  policyCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 24, borderWidth: 1, borderColor: Colors.dark.lime, marginBottom: 24 },
  policyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  policyBadge: { backgroundColor: Colors.dark.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  policyBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.dark.textPrimary },
  policyId: { fontSize: 11, color: Colors.dark.textTertiary },
  planName: { fontSize: 24, fontWeight: '800', color: Colors.dark.textPrimary },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4, marginBottom: 16 },
  price: { fontSize: 36, fontWeight: '800', color: Colors.dark.lime },
  period: { fontSize: 14, color: Colors.dark.textSecondary, marginLeft: 4 },
  coverageBox: { backgroundColor: Colors.dark.elevated, borderRadius: Radius.md, padding: 14, marginBottom: 16 },
  coverageLabel: { fontSize: 11, color: Colors.dark.textTertiary, marginBottom: 8 },
  coverageItem: { fontSize: 13, color: Colors.dark.textPrimary, marginBottom: 4 },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  payoutLabel: { fontSize: 11, color: Colors.dark.textTertiary },
  payoutValue: { fontSize: 22, fontWeight: '800', color: Colors.dark.textPrimary },
  renewalBox: { alignItems: 'flex-end' },
  renewalLabel: { fontSize: 11, color: Colors.dark.textTertiary },
  renewalValue: { fontSize: 14, fontWeight: '700', color: Colors.dark.green },
  validityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  validityLabel: { fontSize: 12, color: Colors.dark.textSecondary },
  validityValue: { fontSize: 13, fontWeight: '600', color: Colors.dark.textPrimary },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  featuresList: { marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { fontSize: 14, color: Colors.dark.lime, marginRight: 10 },
  featureText: { fontSize: 14, color: Colors.dark.textPrimary },
  breakdownCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, marginBottom: 20 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  breakdownLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  breakdownValue: { fontSize: 13, fontWeight: '600', color: Colors.dark.textPrimary },
  breakdownTotal: { borderTopWidth: 1, borderTopColor: Colors.dark.border, marginTop: 8, paddingTop: 12 },
  breakdownTotalLabel: { fontSize: 14, fontWeight: '700', color: Colors.dark.textPrimary },
  breakdownTotalValue: { fontSize: 18, fontWeight: '800', color: Colors.dark.lime },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionBtn: { width: '47%', backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  actionBtnDanger: { borderColor: Colors.dark.red + '40' },
  actionIcon: { fontSize: 20, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.dark.textPrimary },
  trustCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.lime },
  trustHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trustLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  trustValue: { fontSize: 28, fontWeight: '800', color: Colors.dark.lime },
  trustDesc: { fontSize: 12, color: Colors.dark.textSecondary, marginTop: 8, lineHeight: 18 },
  trustBenefits: { marginTop: 12 },
  trustBenefit: { fontSize: 12, color: Colors.dark.green, marginBottom: 4 },
});
