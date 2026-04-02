import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { quickLogin, generateJWT, saveUser } from '../../services/auth';
import { User, Mail, ArrowRight, Smartphone } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleQuickSignUp() {
    setLoading(true);
    await AsyncStorage.setItem('gigshield_user', 'Priya Patel');
    await AsyncStorage.setItem('gigshield_email', 'priya@swiggy.com');
    await AsyncStorage.setItem('gigshield_city', 'mumbai');
    await AsyncStorage.setItem('gigshield_plan', 'smart');
    
    const demoUser = {
      id: 'demo_' + Date.now(),
      email: 'priya@swiggy.com',
      name: 'Priya Patel',
      provider: 'email' as const,
      createdAt: new Date().toISOString(),
    };
    await generateJWT(demoUser);
    await saveUser(demoUser);
    router.replace('/(tabs)/home');
  }

  async function handleGoogleLogin() {
    if (Platform.OS === 'web') {
      window.alert('Google Sign-In coming soon!');
    } else {
      Alert.alert('Coming Soon', 'Google Sign-In will be available in the next update.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Soft Radial Ambient Glow */}
      <View style={styles.ambientGlow} />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign Up Account</Text>
          <Text style={styles.subtitle}>Enter your personal data to create your account</Text>
        </View>

        <TouchableOpacity 
          style={styles.primaryAuthBtn} 
          onPress={handleQuickSignUp}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={Colors.dark.background} /> : (
            <>
              <User size={20} color={Colors.dark.background} />
              <Text style={styles.primaryAuthText}>Continue with Quick Demo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAuthBtn} onPress={handleGoogleLogin}>
          <Mail size={20} color={Colors.dark.textPrimary} />
          <Text style={styles.secondaryAuthText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAuthBtn}>
          <Smartphone size={20} color={Colors.dark.textPrimary} />
          <Text style={styles.secondaryAuthText}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.skipText}>SKIP TO DASHBOARD</Text>
            <ArrowRight size={16} color={Colors.dark.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 32,
    zIndex: 10,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryAuthBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  primaryAuthText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryAuthBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.sm,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  secondaryAuthText: {
    color: Colors.dark.textPrimary,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  footerText: {
    color: Colors.dark.textTertiary,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  footerLink: {
    color: Colors.dark.textPrimary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  ambientGlow: {
    position: 'absolute',
    top: -150,
    width: 400,
    height: 300,
    borderRadius: 200,
    backgroundColor: Colors.dark.limeDark, // The muted teal
    opacity: 0.15,
    transform: [{ scaleX: 1.5 }],
    zIndex: 0,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  skipText: {
    color: Colors.dark.textTertiary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
});
