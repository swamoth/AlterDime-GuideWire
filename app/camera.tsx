// Camera Evidence Screen — Capture photo with GPS for claim validation
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Colors, Radius } from '../constants/theme';
import { Camera as CameraIcon, AlertTriangle, CheckCircle, CircleCheck, Radio, ShieldCheck, MapPin, Clock, RefreshCw, X } from 'lucide-react-native';
import { getCurrentLocation, buildClaimEvidence, formatCoordinates, getGPSAccuracyLabel, ClaimEvidence, saveEvidence } from '../services/cameraService';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturing, setCapturing] = useState(false);
  const [evidence, setEvidence] = useState<ClaimEvidence | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationPreview, setLocationPreview] = useState<string>('Acquiring GPS...');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Pre-fetch GPS as soon as screen opens
    fetchGPS();
  }, []);

  async function fetchGPS() {
    setGpsLoading(true);
    const loc = await getCurrentLocation();
    if (loc) {
      setLocationPreview(`${formatCoordinates(loc.latitude, loc.longitude)} • ${loc.city}`);
    } else {
      setLocationPreview('GPS unavailable');
    }
    setGpsLoading(false);
  }

  async function capturePhoto() {
    if (!cameraRef.current || capturing) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    setCapturing(true);
    try {
      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo) {
        setCapturing(false);
        return;
      }

      // Get GPS location
      const location = await getCurrentLocation();
      if (!location) {
        setCapturing(false);
        return;
      }

      // Build evidence
      const claimEvidence = buildClaimEvidence(photo.uri, location);
      setEvidence(claimEvidence);
    } catch (error) {
      console.error('Capture error:', error);
    }
    setCapturing(false);
  }

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={Colors.dark.lime} size="large" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <CameraIcon size={28} color={Colors.dark.textPrimary} />
          <Text style={[styles.permTitle, { marginBottom: 0 }]}>Camera Access Required</Text>
        </View>
        <Text style={styles.permText}>
          GigShield AI needs camera access to capture photo evidence for claim validation.
          This helps verify you were in the disruption zone and speeds up your payout.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show captured evidence
  if (evidence) {
    const gpsAccuracy = getGPSAccuracyLabel(evidence.location.accuracy);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.evidenceContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={28} color={Colors.dark.green} />
          <Text style={styles.evidenceTitle}>Evidence Captured</Text>
        </View>
        <Text style={styles.evidenceSub}>Photo + GPS metadata saved for claim validation</Text>

        {/* Photo Preview */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: evidence.photoUri }} style={styles.photoPreview} />
          <View style={styles.photoOverlay}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color="#fff" />
              <Text style={styles.overlayText}>{formatCoordinates(evidence.location.latitude, evidence.location.longitude)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Clock size={12} color="#fff" />
              <Text style={styles.overlayText}>{evidence.metadata.capturedAt}</Text>
            </View>
          </View>
        </View>

        {/* GPS Metadata Card */}
        <View style={styles.metaCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <Radio size={16} color={Colors.dark.lime} />
            <Text style={[styles.metaTitle, { marginBottom: 0 }]}>GPS Metadata</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Latitude</Text>
            <Text style={styles.metaValue}>{evidence.location.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Longitude</Text>
            <Text style={styles.metaValue}>{evidence.location.longitude.toFixed(6)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>City</Text>
            <Text style={styles.metaValue}>{evidence.location.city}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Accuracy</Text>
            <Text style={[styles.metaValue, { color: gpsAccuracy.color }]}>
              ±{evidence.location.accuracy.toFixed(1)}m ({gpsAccuracy.label})
            </Text>
          </View>
          {evidence.location.altitude !== null && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Altitude</Text>
              <Text style={styles.metaValue}>{evidence.location.altitude.toFixed(1)}m</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Timestamp</Text>
            <Text style={styles.metaValue}>{evidence.metadata.capturedAt}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>GPS Confidence</Text>
            <Text style={[styles.metaValue, { color: gpsAccuracy.color }]}>{evidence.metadata.gpsConfidence}</Text>
          </View>
        </View>

        {/* Anti-Spoofing Info */}
        <View style={styles.antiSpoofCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <ShieldCheck size={16} color={Colors.dark.lime} />
            <Text style={[styles.antiSpoofTitle, { marginBottom: 0 }]}>Anti-Spoofing Verification</Text>
          </View>
          <Text style={styles.antiSpoofText}>
            This evidence will be cross-validated with:
          </Text>
          <View style={styles.checkList}>
            <View style={styles.checkRow}>
              <CircleCheck size={14} color={Colors.dark.green} />
              <Text style={styles.checkItem}>GPS trajectory (5-min intervals)</Text>
            </View>
            <View style={styles.checkRow}>
              <CircleCheck size={14} color={Colors.dark.green} />
              <Text style={styles.checkItem}>Weather API at coordinates</Text>
            </View>
            <View style={styles.checkRow}>
              <CircleCheck size={14} color={Colors.dark.green} />
              <Text style={styles.checkItem}>Photo CV analysis (MobileNet-v3)</Text>
            </View>
            <View style={styles.checkRow}>
              <CircleCheck size={14} color={Colors.dark.green} />
              <Text style={styles.checkItem}>Platform delivery logs</Text>
            </View>
            <View style={styles.checkRow}>
              <CircleCheck size={14} color={Colors.dark.green} />
              <Text style={styles.checkItem}>Device step counter data</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setEvidence(null);
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CameraIcon size={16} color={Colors.dark.textPrimary} />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={async () => {
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (evidence) {
              await saveEvidence(evidence);
            }
            router.back();
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color={Colors.dark.background} />
              <Text style={styles.submitBtnText}>Submit Evidence</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // Camera View
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn}>
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>Claim Evidence</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {gpsLoading ? <Clock size={10} color="rgba(255,255,255,0.7)" /> : <MapPin size={10} color="rgba(255,255,255,0.7)" />}
              <Text style={[styles.topSub, { marginTop: 0 }]}>
                {gpsLoading ? 'Acquiring GPS...' : locationPreview}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
            style={styles.topBtn}
          >
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Capture Guide */}
        <View style={styles.guideOverlay}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>
            Point camera at weather conditions{'\n'}(wet roads, rain, flooding, dark sky)
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          <View style={styles.gpsIndicator}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {gpsLoading ? <Clock size={12} color={Colors.dark.lime} /> : <MapPin size={12} color={Colors.dark.lime} />}
              <Text style={styles.gpsText}>
                {gpsLoading ? 'GPS...' : 'GPS Ready'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.captureBtn, capturing && styles.captureBtnActive]}
            onPress={capturePhoto}
            disabled={capturing}
          >
            {capturing ? (
              <ActivityIndicator color={Colors.dark.background} size="small" />
            ) : (
              <View style={styles.captureBtnInner} />
            )}
          </TouchableOpacity>

          <Text style={styles.captureHint}>
            {capturing ? 'Capturing...' : 'Tap to capture'}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  centerContainer: { flex: 1, backgroundColor: Colors.dark.background, justifyContent: 'center', alignItems: 'center', padding: 32 },

  // Permission screen
  permTitle: { fontSize: 22, fontWeight: '800', color: Colors.dark.textPrimary, textAlign: 'center', marginBottom: 12 },
  permText: { fontSize: 14, color: Colors.dark.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  permBtn: { backgroundColor: Colors.dark.lime, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  permBtnText: { fontSize: 16, fontWeight: '700', color: Colors.dark.background },
  backBtn: { marginTop: 16, paddingVertical: 10 },
  backBtnText: { fontSize: 14, color: Colors.dark.textSecondary },

  // Camera
  camera: { flex: 1 },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.5)' },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  topBtnText: { fontSize: 18, color: '#fff' },
  topCenter: { alignItems: 'center', flex: 1 },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  topSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Guide overlay
  guideOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guideFrame: { width: 280, height: 360, borderWidth: 2, borderColor: 'rgba(203, 255, 0, 0.5)', borderRadius: 20, borderStyle: 'dashed' },
  guideText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 16, lineHeight: 20 },

  // Bottom bar
  bottomBar: { alignItems: 'center', paddingBottom: 40, paddingTop: 20, backgroundColor: 'rgba(0,0,0,0.6)' },
  gpsIndicator: { backgroundColor: 'rgba(203,255,0,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(203,255,0,0.3)' },
  gpsText: { fontSize: 12, fontWeight: '600', color: Colors.dark.lime },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: Colors.dark.lime },
  captureBtnActive: { opacity: 0.6 },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  captureHint: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12 },

  // Evidence view
  evidenceContent: { padding: 20, paddingTop: 56 },
  evidenceTitle: { fontSize: 24, fontWeight: '800', color: Colors.dark.textPrimary },
  evidenceSub: { fontSize: 13, color: Colors.dark.textSecondary, marginTop: 4, marginBottom: 20 },

  photoContainer: { borderRadius: Radius.lg, overflow: 'hidden', marginBottom: 16 },
  photoPreview: { width: '100%', height: 300, resizeMode: 'cover' },
  photoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12 },
  overlayText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  metaCard: { backgroundColor: Colors.dark.card, borderRadius: Radius.lg, padding: 20, borderWidth: 1, borderColor: Colors.dark.border, marginBottom: 16 },
  metaTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark.textPrimary, marginBottom: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  metaLabel: { fontSize: 13, color: Colors.dark.textSecondary },
  metaValue: { fontSize: 13, fontWeight: '600', color: Colors.dark.textPrimary },

  antiSpoofCard: { backgroundColor: 'rgba(203,255,0,0.06)', borderRadius: Radius.lg, padding: 20, borderWidth: 1, borderColor: Colors.dark.borderLime, marginBottom: 20 },
  antiSpoofTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark.lime, marginBottom: 8 },
  antiSpoofText: { fontSize: 12, color: Colors.dark.textSecondary, marginBottom: 12 },
  checkList: { gap: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkItem: { fontSize: 12, color: Colors.dark.green, fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 12 },
  retakeBtn: { flex: 1, backgroundColor: Colors.dark.card, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  retakeBtnText: { fontSize: 14, fontWeight: '700', color: Colors.dark.textPrimary },
  submitBtn: { flex: 1, backgroundColor: Colors.dark.lime, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: Colors.dark.background },
});
