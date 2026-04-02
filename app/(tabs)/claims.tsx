// Claims Management Screen — History + All 5 Trigger Demo + Photo Evidence
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import { getMockClaimHistory, createClaimEvent, ClaimEvent, ClaimStatus } from '../../services/claimEngine';
import { CloudRain, Flame, Wind, Ban, Waves, AlertTriangle, Gamepad2, Camera, ChevronRight, RefreshCw, ScrollText, Settings, Trash2, Check, CheckCircle2 } from 'lucide-react-native';
import { TRIGGERS } from '../../constants/triggers';

type TriggerKey = keyof typeof TRIGGERS;

import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, SlideInUp, ZoomIn, Layout, useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedCounter } from '../../components/AnimatedCounter';

export default function ClaimsScreen() {
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimEvent[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [currentClaim, setCurrentClaim] = useState<ClaimEvent | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const isCleared = await AsyncStorage.getItem('gigshield_claims_cleared');
    if (isCleared !== 'true') {
      setClaims(getMockClaimHistory());
    } else {
      setClaims([]);
    }
  }

  async function clearHistory() {
    triggerHaptic('heavy');
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete all claim history and logs?")) {
        await AsyncStorage.setItem('gigshield_claims_cleared', 'true');
        setClaims([]);
      }
      return;
    }

    Alert.alert(
      "Clear Claim History",
      "Are you sure you want to delete all claim history and logs?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.setItem('gigshield_claims_cleared', 'true');
            setClaims([]);
          }
        }
      ]
    );
  }

  function triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
    if (Platform.OS !== 'web') {
      if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (style === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (style === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  async function simulateClaim(triggerKey: TriggerKey) {
    triggerHaptic('medium');
    setSimulating(true);
    const claim = createClaimEvent(triggerKey, 'Bangalore', 2);
    setCurrentClaim(claim);

    // Simulate the pipeline with photo evidence step
    for (let i = 0; i < claim.verificationSteps.length; i++) {
      await new Promise((r) => setTimeout(r, claim.verificationSteps[i].duration));
      setCurrentClaim((prev) => {
        if (!prev) return prev;
        const steps = [...prev.verificationSteps];
        steps[i] = { ...steps[i], status: 'passed' };
        triggerHaptic('success');
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

  const totalPayout = claims.reduce((a, c) => a + c.payoutAmount, 0);
  const allTriggerKeys: TriggerKey[] = ['heavyRain', 'extremeHeat', 'aqiSpike', 'flooding', 'curfew'];

  return (
    <Animated.ScrollView entering={FadeIn.duration(400)} style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={styles.title}>Claims &{'\n'}Payouts</Text>
          <Text style={styles.subtitle}>Automated claim history & zero-touch trigger demo</Text>
        </View>
        <TouchableOpacity 
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' }}
          onPress={clearHistory}
        >
          <Trash2 size={20} color={Colors.dark.red} />
        </TouchableOpacity>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsRow}>
        <View style={styles.statBox}>
          <AnimatedCounter value={claims.length} style={styles.statValue} duration={800} />
          <Text style={styles.statLabel}>Total Claims</Text>
        </View>
        <View style={styles.statBox}>
          <AnimatedCounter value={totalPayout} prefix="₹" style={[styles.statValue, { color: Colors.dark.lime }]} duration={1200} />
          <Text style={styles.statLabel}>Total Payouts</Text>
        </View>
        <View style={styles.statBox}>
          <AnimatedCounter value={claims.filter(c => c.status === 'paid').length} style={[styles.statValue, { color: Colors.dark.green }]} duration={1000} />
          <Text style={styles.statLabel}>Auto-Paid</Text>
        </View>
      </Animated.View>

      {/* Demo Section — All 5 Triggers */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Gamepad2 size={16} color={Colors.dark.textSecondary} />
          <Text style={styles.sectionLabel}>Trigger Demo — All 5 Parametric Triggers</Text>
        </View>
        <Text style={styles.sectionSub}>Simulate any trigger to see the AI pipeline in action</Text>
      </Animated.View>
      <View style={styles.demoGrid}>
        {allTriggerKeys.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => simulateClaim(key)}
            disabled={simulating}
            style={[styles.demoBtn, simulating && styles.demoBtnDisabled]}
          >
            <View style={{ marginBottom: 4 }}>
              {getTriggerIcon(TRIGGERS[key].id, 24)}
            </View>
            <Text style={styles.demoBtnLabel}>{TRIGGERS[key].name}</Text>
            <Text style={styles.demoBtnSource}>{TRIGGERS[key].source}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Camera Evidence Button */}
      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() => {
            triggerHaptic('light');
            router.push('/camera');
          }}
        >
          <Camera size={28} color={Colors.dark.textPrimary} />
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.cameraBtnTitle}>Capture Photo Evidence</Text>
            <Text style={styles.cameraBtnSub}>Take a photo with GPS metadata for claim validation</Text>
          </View>
          <ChevronRight size={20} color={Colors.dark.lime} />
        </TouchableOpacity>
      </Animated.View>


      {/* Simulation Display */}
      {currentClaim && (
        <View style={styles.simulationCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <RefreshCw size={16} color={Colors.dark.lime} />
            <Text style={styles.simTitle}>Simulating: {currentClaim.triggerName}</Text>
          </View>
          <Text style={styles.simId}>ID: {currentClaim.id}</Text>

          <View style={styles.pipeline}>
            {currentClaim.verificationSteps.map((step, i) => (
              <Animated.View key={i} layout={Layout.springify()} style={styles.pipelineStep}>
                <View style={[
                  styles.pipelineDot,
                  step.status === 'passed' && styles.pipelineDotPass,
                ]}>
                    {step.status === 'passed' ? (
                      <Animated.View entering={ZoomIn}>
                        <Check size={12} color="#fff" />
                      </Animated.View>
                    ) : <Text style={styles.pipelineDotText}>{i + 1}</Text>}
                </View>
                {i < currentClaim.verificationSteps.length - 1 && (
                  <View style={[
                    styles.pipelineLine,
                    step.status === 'passed' && styles.pipelineLinePass,
                  ]} />
                )}
                <View style={styles.pipelineContent}>
                  <Text style={[
                    styles.pipelineLabel,
                    step.status === 'passed' && styles.pipelineLabelPass,
                  ]}>{step.label}</Text>
                  <Text style={styles.pipelineDetail}>{step.detail}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {currentClaim.verificationSteps.every(s => s.status === 'passed') && (
            <Animated.View entering={SlideInUp.springify()} style={styles.successBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={18} color={Colors.dark.green} />
                <Text style={styles.successText}>
                  Claim Approved! ₹{currentClaim.payoutAmount} sent via UPI
                </Text>
              </View>
              <Text style={styles.successSub}>
                Confidence: {currentClaim.confidenceScore}% • Fraud Score: {currentClaim.fraudScore}
              </Text>
            </Animated.View>
          )}
        </View>
      )}

      {/* History */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, marginTop: 12 }}>
        <ScrollText size={16} color={Colors.dark.textSecondary} />
        <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Claim History</Text>
      </View>
      {claims.map((claim) => (
        <View key={claim.id} style={styles.claimCard}>
          <View style={styles.claimHeader}>
            <View style={{ marginRight: 10 }}>
              {getTriggerIcon(claim.triggerId)}
            </View>
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

      {/* Pipeline Info */}
      <View style={styles.pipelineInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Settings size={14} color={Colors.dark.textSecondary} />
          <Text style={styles.pipelineInfoTitle}>Claim Pipeline</Text>
        </View>
        <Text style={styles.pipelineInfoText}>
          DISRUPTION → AI VALIDATES → AUTO CLAIM → FRAUD CHECK → INSTANT PAYOUT
        </Text>
        <Text style={styles.pipelineInfoSub}>
          4-layer fraud detection: Parametric → Location → AI Anomaly → Duplicate Check
        </Text>
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

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.dark.textPrimary },
  statLabel: { fontSize: 10, color: Colors.dark.textSecondary, marginTop: 4 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 0.5, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: Colors.dark.textTertiary, marginBottom: 12 },

  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  demoBtn: { width: '31%', backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  demoBtnDisabled: { opacity: 0.5 },
  demoBtnIcon: { fontSize: 24, marginBottom: 4 },
  demoBtnLabel: { fontSize: 11, fontWeight: '600', color: Colors.dark.textPrimary, textAlign: 'center' },
  demoBtnSource: { fontSize: 9, color: Colors.dark.textTertiary, marginTop: 2, textAlign: 'center' },

  // Camera button
  cameraBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, borderWidth: 1, borderColor: Colors.dark.borderLime, marginBottom: 20, gap: 12 },
  cameraBtnIcon: { fontSize: 28 },
  cameraBtnTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark.textPrimary },
  cameraBtnSub: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
  cameraBtnArrow: { fontSize: 18, color: Colors.dark.lime, fontWeight: '700' },

  simulationCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.dark.lime },
  simTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.lime },
  simId: { fontSize: 12, color: Colors.dark.textTertiary, marginBottom: 16 },
  pipeline: { gap: 0 },
  pipelineStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  pipelineDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.dark.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pipelineDotPass: { backgroundColor: Colors.dark.green },
  pipelineDotText: { fontSize: 11, fontWeight: '700', color: Colors.dark.textPrimary },
  pipelineLine: { position: 'absolute', left: 12, top: 26, width: 2, height: 14, backgroundColor: Colors.dark.elevated },
  pipelineLinePass: { backgroundColor: Colors.dark.green },
  pipelineContent: { flex: 1 },
  pipelineLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark.textPrimary },
  pipelineLabelPass: { color: Colors.dark.green },
  pipelineDetail: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
  successBox: { backgroundColor: 'rgba(52,199,89,0.15)', borderRadius: Radius.md, padding: 14, marginTop: 16, alignItems: 'center' },
  successText: { fontSize: 14, fontWeight: '700', color: Colors.dark.green },
  successSub: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 4 },

  claimCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.dark.border },
  claimHeader: { flexDirection: 'row', alignItems: 'center' },
  claimIcon: { fontSize: 28, marginRight: 10 },
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

  pipelineInfo: { backgroundColor: Colors.dark.elevated, borderRadius: Radius.md, padding: 16, marginTop: 8 },
  pipelineInfoTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark.textSecondary },
  pipelineInfoText: { fontSize: 11, color: Colors.dark.lime, marginTop: 6, fontWeight: '600' },
  pipelineInfoSub: { fontSize: 10, color: Colors.dark.textTertiary, marginTop: 4 },
});
