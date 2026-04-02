import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Map, History, X, Shield, Settings, LogOut, FileText, Code } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

interface SettingsMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsMenu({ visible, onClose }: SettingsMenuProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path as any);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Shield color={Colors.dark.lime} size={24} />
              <Text style={styles.headerTitle}>Settings & Tools</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={Colors.dark.textPrimary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>FEATURES</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/map')}
            >
              <View style={styles.iconBox}>
                <Map color={Colors.dark.lime} size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Map Trajectory Ping</Text>
                <Text style={styles.menuSub}>Real-time GPS tracking every 40s</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/evidence-history')}
            >
              <View style={styles.iconBox}>
                <History color={Colors.dark.lime} size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Claims Evidence History</Text>
                <Text style={styles.menuSub}>View saved photos & GPS coordinates</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>GENERAL</Text>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Settings color={Colors.dark.textSecondary} size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>App Preferences</Text>
                <Text style={styles.menuSub}>Notifications & appearance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <FileText color={Colors.dark.textSecondary} size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Terms & Policies</Text>
                <Text style={styles.menuSub}>Legal and privacy details</Text>
              </View>
            </TouchableOpacity>

            <View style={{ marginVertical: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: Colors.dark.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Made by Team AlterDime
              </Text>

              <TouchableOpacity
                style={[styles.menuItem, { marginBottom: 0 }]}
                onPress={() => Linking.openURL('https://github.com/swamoth/AlterDime-GuideWire')}
              >
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Code color={Colors.dark.textPrimary} size={20} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Open Source</Text>
                  <Text style={styles.menuSub}>View code on GitHub</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.menuItem, { marginTop: 12 }]} onPress={() => handleNavigation('/(auth)/login')}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                <LogOut color={Colors.dark.red} size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: Colors.dark.red }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
  },
  container: {
    backgroundColor: Colors.dark.background,
    width: '85%',
    height: '100%',
    paddingTop: 50,
    borderRightWidth: 1,
    borderRightColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: Colors.dark.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dark.textTertiary,
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(203,255,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
  },
  menuSub: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
