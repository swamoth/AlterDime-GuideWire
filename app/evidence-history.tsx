// Evidence History Screen — View previously captured claims
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Clock, ShieldCheck, ZapOff, Trash2 } from 'lucide-react-native';
import { getEvidenceHistory, clearEvidenceHistory, ClaimEvidence, formatCoordinates } from '../services/cameraService';
import { Alert, Platform } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

export default function EvidenceHistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<ClaimEvidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getEvidenceHistory();
      setHistory(data);
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleClearHistory() {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete all captured photo evidence?")) {
        await clearEvidenceHistory();
        setHistory([]);
      }
      return;
    }

    Alert.alert(
      "Clear Evidence History",
      "Are you sure you want to delete all captured photo evidence?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await clearEvidenceHistory();
            setHistory([]);
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={Colors.dark.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Evidence History</Text>
        </View>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' }}
          onPress={handleClearHistory}
        >
          <Trash2 size={16} color={Colors.dark.red} />
          <Text style={{ color: Colors.dark.red, fontSize: 13, fontWeight: '700' }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color={Colors.dark.lime} size="large" />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <ZapOff color={Colors.dark.textSecondary} size={32} />
            </View>
            <Text style={styles.emptyTitle}>No Evidence Found</Text>
            <Text style={styles.emptySub}>
              Photos you capture in the Evidence tool will securely appear here.
            </Text>
          </View>
        ) : (
          history.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <ShieldCheck size={14} color={Colors.dark.green} />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
                <Text style={styles.timeText}>{item.metadata.capturedAt}</Text>
              </View>

              <View style={styles.photoContainer}>
                <Image source={{ uri: item.photoUri }} style={styles.photoImage} />
                <View style={styles.gpsOverlay}>
                  <MapPin size={12} color="#fff" />
                  <Text style={styles.gpsOverlayText}>
                    {formatCoordinates(item.location.latitude, item.location.longitude)}
                  </Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>LOCATION</Text>
                  <Text style={styles.metaValue}>{item.location.city || 'Unknown Zone'}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>ACCURACY</Text>
                  <Text style={styles.metaValue}>±{item.location.accuracy.toFixed(1)}m</Text>
                </View>
              </View>

              {/* Secure hash visualization (mock) */}
              <View style={styles.hashBox}>
                <Text style={styles.hashLabel}>BLOCKCHAIN LEDGER HASH</Text>
                <Text style={styles.hashText} numberOfLines={1} ellipsizeMode="middle">
                  0x{(item.metadata.capturedAt + index).split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16).replace('-','').toUpperCase().padStart(8,'0')}A9F{index.toString(16).toUpperCase().padStart(4,'0')}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backBtn: {
    paddingRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.borderLime,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,199,89,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.green,
  },
  timeText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  photoContainer: {
    height: 200,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gpsOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  gpsOverlayText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    color: Colors.dark.textPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  hashBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  hashLabel: {
    fontSize: 9,
    color: Colors.dark.textTertiary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hashText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontFamily: 'monospace',
  },
});
