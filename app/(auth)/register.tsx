// Registration Screen - OAuth2.0 (Google + Mobile OTP)
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius } from '../../constants/theme';
import { signInWithGoogle, sendOTP, verifyOTP, generateJWT, saveUser } from '../../services/auth';

type AuthMethod = 'google' | 'phone' | null;

export default function RegisterScreen() {
  const router = useRouter();
  
  // Auth method selection
  const [method, setMethod] = useState<AuthMethod>(null);
  
  // Loading states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  
  // Phone/OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // User info state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Registration complete
  const [registered, setRegistered] = useState(false);

  // Google Sign Up
  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      await AsyncStorage.setItem('gigshield_user', user.name);
      await AsyncStorage.setItem('gigshield_email', user.email || '');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Google sign-up failed. Please try again.');
    }
    setGoogleLoading(false);
  }

  // Send OTP
  async function handleSendOTP() {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    setOtpSending(true);
    try {
      await sendOTP(phone);
      setOtpSent(true);
      setCountdown(30);
      
      // Countdown timer
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      Alert.alert('OTP Sent', 'Enter the 6-digit code. Demo: 123456');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
    setOtpSending(false);
  }

  // Verify OTP
  async function handleVerifyOTP() {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    
    setOtpVerifying(true);
    try {
      const user = await verifyOTP(phone, otp);
      if (user) {
        if (name) {
          user.name = name;
        }
        if (email) {
          user.email = email;
        }
        await saveUser(user);
        await AsyncStorage.setItem('gigshield_user', user.name || 'User');
        setRegistered(true);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    }
    setOtpVerifying(false);
  }

  // Back to method selection
  function handleBack() {
    setMethod(null);
    setOtpSent(false);
    setOtp('');
  }

  // Method selection view
  if (!method) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={{ fontSize: 18 }}>🛡️</Text>
            </View>
            <Text style={styles.brandText}>GIGSHIELD AI</Text>
          </View>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of gig workers protected by AI</Text>

          {/* Google Sign Up */}
          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#333" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Sign up with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone Sign Up */}
          <TouchableOpacity style={styles.phoneBtn} onPress={() => setMethod('phone')}>
            <Text style={styles.phoneIcon}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.phoneTitle}>Sign up with Mobile</Text>
              <Text style={styles.phoneSub}>Use OTP verification</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tokenInfo}>
            <Text style={styles.tokenInfoText}>🔐 Secured with OAuth 2.0 + JWT</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Phone OTP flow
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Mobile Verification</Text>
        <Text style={styles.subtitle}>
          {otpSent ? 'Enter the OTP sent to your phone' : 'Enter your phone number'}
        </Text>

        {!otpSent ? (
          <>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={Colors.dark.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity 
              style={[styles.btn, otpSending && styles.btnDisabled]} 
              onPress={handleSendOTP}
              disabled={otpSending}
            >
              <Text style={styles.btnText}>
                {otpSending ? 'SENDING...' : 'SEND OTP'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>OTP SENT TO +91 {phone.slice(-4)}••••</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              placeholderTextColor={Colors.dark.textTertiary}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            
            {/* Optional: Name & Email after OTP */}
            <Text style={[styles.label, { marginTop: 16 }]}>NAME (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.dark.textTertiary}
              value={name}
              onChangeText={setName}
            />
            
            <Text style={[styles.label, { marginTop: 12 }]}>EMAIL (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={Colors.dark.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.btn, otpVerifying && styles.btnDisabled]} 
              onPress={handleVerifyOTP}
              disabled={otpVerifying}
            >
              <Text style={styles.btnText}>
                {otpVerifying ? 'VERIFYING...' : 'VERIFY & CREATE ACCOUNT'}
              </Text>
            </TouchableOpacity>

            {countdown > 0 ? (
              <Text style={styles.resendText}>Resend OTP in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleSendOTP}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  backBtn: { marginBottom: 20 },
  backBtnText: { fontSize: 14, color: Colors.dark.lime, fontWeight: '600' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 11, fontWeight: '700', color: Colors.dark.lime, letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.dark.textPrimary, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.dark.textSecondary, marginBottom: 24 },
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: { fontSize: 20, fontWeight: '700', color: '#4285F4' },
  googleBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.dark.border },
  dividerText: { paddingHorizontal: 12, fontSize: 12, color: Colors.dark.textTertiary },
  phoneBtn: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.sm,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  phoneIcon: { fontSize: 24, marginRight: 12 },
  phoneTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark.textPrimary },
  phoneSub: { fontSize: 12, color: Colors.dark.textSecondary },
  chevron: { fontSize: 24, color: Colors.dark.textTertiary },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  loginText: { fontSize: 13, color: Colors.dark.textTertiary },
  loginLink: { fontSize: 13, fontWeight: '700', color: Colors.dark.lime },
  tokenInfo: { marginTop: 30, alignItems: 'center' },
  tokenInfoText: { fontSize: 11, color: Colors.dark.textTertiary },
  label: { fontSize: 10, fontWeight: '700', color: Colors.dark.textSecondary, letterSpacing: 1, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.sm,
    padding: 14,
    paddingLeft: 16,
    color: Colors.dark.textPrimary,
    fontSize: 15,
  },
  btn: {
    backgroundColor: Colors.dark.lime,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 14, fontWeight: '800', color: '#0D0D0D', letterSpacing: 0.5 },
  resendText: { fontSize: 13, color: Colors.dark.textTertiary, textAlign: 'center', marginTop: 16 },
  resendLink: { fontSize: 13, fontWeight: '600', color: Colors.dark.lime, textAlign: 'center', marginTop: 16 },
});
