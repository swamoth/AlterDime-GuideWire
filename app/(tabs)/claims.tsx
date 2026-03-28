// Claims Management Screen — History + Trigger Demo
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { getMockClaimHistory, createClaimEvent, ClaimEvent, ClaimStatus } from '../../services/claimEngine';
import { TRIGGERS } from '../../constants/triggers';

type TriggerKey = keyof typeof TRIGGERS;

export default function ClaimsScreen() {
  const [claims, setClaims] = useState<ClaimEvent[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [currentClaim, setCurrentClaim] = useState<ClaimEvent | null>(null);

  useEffect(() => {
    setClaims(getMockClaimHistory());
  }, []);

  async function simulateClaim(triggerKey: TriggerKey) {
    setSimulating(true);
    const claim = createClaimEvent(triggerKey, 'Bangalore', 2);
    setCurrentClaim(claim);

    // Simulate the pipeline
    for (let i = 0; i < claim.verificationSteps.length; i++) {
      await new Promise((r) => setTimeout(r, claim.verificationSteps[i].duration));
      setCurrentClaim((prev) => {
        if (!prev) return prev;
        const steps = [...prev.verificationSteps];
        steps[i] = { ...steps[i], status: 'passed' };
        return { ...prev, verificationSteps: steps, status: steps[i + 1]?.status === 'passed' ? 'paid' : 'validating' as ClaimStatus };
      });
    }

    setSimulating(false);
    setClaims((prev) => [claim, ...prev]);
  }

  function getStatusColor(status: ClaimStatus) {
    switch (status) {
      case 'paid': return Colors.dark.green;
      case 'approved': return Colors.dark.lime;
      case 'validating':
      case 'location_check':
      case 'fraud_check': return Colors.dark.orange;
      case 'rejected': return Colors.dark.red;
      default: return Colors.dark.textSecondary;
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Claims &{'\n'}Payouts</Text>
      <Text style={styles.subtitle}>Automated claim history & zero-touch trigger demo</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{claims.length}</Text>
          <Text style={styles.statLabel}>Total Claims</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.dark.lime }]}>
            ₹{claims.reduce((a, c) => a + c.payoutAmount, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Payouts</Text>
        </View>
      </View>

      {/* Demo Section */}
      <Text style={styles.sectionLabel}>🎮 Trigger Demo</Text>
      <Text style={styles.sectionSub}>Simulate a claim trigger to see the AI pipeline in action</Text>
      <View style={styles.demoGrid}>
        {(['heavyRain', 'extremeHeat', 'aqiSpike', 'curfew'] as TriggerKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => simulateClaim(key)}
            disabled={simulating}
            style={[styles.demoBtn, simulating && styles.demoBtnDisabled]}
          >
            <Text style={styles.demoBtnIcon}>
              {key === 'heavyRain' ? '🌧️' : key === 'extremeHeat' ? '🔥' : key === 'aqiSpike' ? '💨' : '🚫'}
            </Text>
            <Text style={styles.demoBtnLabel}>{TRIGGERS[key].name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Simulation Display */}
      {currentClaim && (
        <View style={styles.simulationCard}>
          <Text style={styles.simTitle}>🔄 Simulating: {currentClaim.triggerName}</Text>
          <Text style={styles.simId}>ID: {currentClaim.id}</Text>
          
          <View style={styles.pipeline}>
            {currentClaim.verificationSteps.map((step, i) => (
              <View key={i} style={styles.pipelineStep}>
                <View style={[
                  styles.pipelineDot,
                  step.status === 'passed' && styles.pipelineDotPass,
                  step.status === 'pending' && styles.pipelineDotPending,
                ]}>
                  {step.status === 'passed' ? '✓' : i + 1}
                </View>
                <View style={styles.pipelineContent}>
                  <Text style={[
                    styles.pipelineLabel,
                    step.status === 'passed' && styles.pipelineLabelPass,
                  ]}>{step.label}</Text>
                  <Text style={styles.pipelineDetail}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          {currentClaim.verificationSteps.every(s => s.status === 'passed') && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                ✅ Claim Approved! ₹{currentClaim.payoutAmount} sent via UPI
              </Text>
            </View>
          )}
        </View>
      )}

      {/* History */}
      <Text style={styles.sectionLabel}>📜 Claim History</Text>
      {claims.map((claim) => (
        <View key={claim.id} style={styles.claimCard}>
          <View style={styles.claimHeader}>
            <Text style={styles.claimIcon}>
              {claim.triggerId === 'heavy_rain' ? '🌧️' :
               claim.triggerId === 'extreme_heat' ? '🔥' :
               claim.triggerId === 'aqi_spike' ? '💨' :
               claim.triggerId === 'curfew' ? '🚫' : '🌊'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.claimTitle}>{claim.triggerName}</Text>
              <Text style={styles.claimMeta}>{claim.city} • {claim.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(claim.status) }]}>
                {claim.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.claimFooter}>
            <View>
              <Text style={styles.claimDays}>{claim.daysAffected} days affected</Text>
              <Text style={styles.claimSources}>
                Sources: {claim.dataSources.join(', ')}
              </Text>
            </View>
            <Text style={styles.claimAmount}>+₹{claim.payoutAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confidence Score</Text>
            <Text style={styles.confidenceValue}>{claim.confidenceScore}%</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: 20, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.dark.textPrimary },
  statLabel: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  sectionSub: { fontSize: 12, color: Colors.dark.textTertiary, marginBottom: 12 },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  demoBtn: { width: '47%', backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  demoBtnDisabled: { opacity: 0.5 },
  demoBtnIcon: { fontSize: 24, marginBottom: 6 },
  demoBtnLabel: { fontSize: 12, fontWeight: '600', color: Colors.dark.textPrimary },
  simulationCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.dark.lime },
  simTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.lime },
  simId: { fontSize: 12, color: Colors.dark.textTertiary, marginBottom: 16 },
  pipeline: { gap: 0 },
  pipelineStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  pipelineDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.dark.elevated, alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: '700', color: Colors.dark.textSecondary, marginRight: 12 },
  pipelineDotPass: { backgroundColor: Colors.dark.green, color: Colors.dark.textPrimary },
  pipelineDotPending: { backgroundColor: Colors.dark.orange, color: Colors.dark.textPrimary },
  pipelineContent: { flex: 1 },
  pipelineLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark.textPrimary },
  pipelineLabelPass: { color: Colors.dark.green },
  pipelineDetail: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
  successBox: { backgroundColor: 'rgba(52,199,89,0.15)', borderRadius: Radius.md, padding: 14, marginTop: 16, alignItems: 'center' },
  successText: { fontSize: 14, fontWeight: '700', color: Colors.dark.green },
  claimCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.dark.border },
  claimHeader: { flexDirection: 'row', alignItems: 'center' },
  claimIcon: { fontSize: 28 },
  claimTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark.textPrimary },
  claimMeta: { fontSize: 11, color: Colors.dark.textTertiary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  claimFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  claimDays: { fontSize: 12, color: Colors.dark.textSecondary },
  claimSources: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 2 },
  claimAmount: { fontSize: 20, fontWeight: '800', color: Colors.dark.lime },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  confidenceLabel: { fontSize: 11, color: Colors.dark.textTertiary },
  confidenceValue: { fontSize: 12, fontWeight: '700', color: Colors.dark.green },
});
