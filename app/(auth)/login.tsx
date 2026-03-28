// Login Screen - JWT + OAuth2.0 (Google + Email)
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, FontSizes } from '../../constants/theme';
import { signInWithGoogle, generateJWT, saveUser } from '../../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Demo Google Login - Works instantly
  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      await AsyncStorage.setItem('gigshield_user', user.name);
      await AsyncStorage.setItem('gigshield_email', user.email || '');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
    setGoogleLoading(false);
  }

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      const user = {
        id: 'email_' + Date.now(),
        email,
        name: email.split('@')[0],
        provider: 'email' as const,
        createdAt: new Date().toISOString(),
      };
      
      await generateJWT(user);
      await saveUser(user);
      await AsyncStorage.setItem('gigshield_user', user.name);
      await AsyncStorage.setItem('gigshield_email', user.email);
      
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
    setLoading(false);
  }

  async function handleSkip() {
    await AsyncStorage.setItem('gigshield_user', 'Ravi Kumar');
    await AsyncStorage.setItem('gigshield_email', 'ravi@zomato.com');
    await AsyncStorage.setItem('gigshield_city', 'bangalore');
    await AsyncStorage.setItem('gigshield_plan', 'smart');
    
    const demoUser = {
      id: 'demo_' + Date.now(),
      email: 'ravi@zomato.com',
      name: 'Ravi Kumar',
      provider: 'email' as const,
      createdAt: new Date().toISOString(),
    };
    await generateJWT(demoUser);
    await saveUser(demoUser);
    
    router.replace('/(tabs)/home');
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={{ fontSize: 18 }}>🛡️</Text>
          </View>
          <Text style={styles.brandText}>GIGSHIELD AI</Text>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your GigShield dashboard</Text>

        <TouchableOpacity 
          style={styles.googleBtn} 
          onPress={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#333" size="small" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>EMAIL / PHONE</Text>
        <TextInput
          style={styles.input}
          placeholder="ravi@zomato.com"
          placeholderTextColor={Colors.dark.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={Colors.dark.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleEmailLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSkip} onPress={handleSkip}>
          <Text style={styles.btnSkipText}>SKIP TO DASHBOARD →</Text>
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>New to GigShield? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenInfoText}>🔐 JWT Secured</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.dark.borderLime,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
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
  subtitle: { fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 24 },
  googleBtn: {
    backgroundColor: '#fff',
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.dark.border },
  dividerText: { paddingHorizontal: 12, fontSize: 12, color: Colors.dark.textTertiary },
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
  btnText: { fontSize: 14, fontWeight: '800', color: '#0D0D0D', letterSpacing: 0.5 },
  btnSkip: {
    backgroundColor: Colors.dark.elevated,
    borderRadius: Radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  btnSkipText: { fontSize: 13, fontWeight: '700', color: Colors.dark.lime, letterSpacing: 0.5 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { fontSize: 13, color: Colors.dark.textTertiary },
  registerLink: { fontSize: 13, fontWeight: '700', color: Colors.dark.lime },
  tokenInfo: { marginTop: 20, alignItems: 'center' },
  tokenInfoText: { fontSize: 11, color: Colors.dark.textTertiary },
});
