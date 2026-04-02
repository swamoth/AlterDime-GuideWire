// Auth Service — Simplified (OAuth deferred for Phase 2)
// Quick login with name for demo purposes
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'gigshield_token';
const USER_KEY = 'gigshield_user_data';

export interface User {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  avatar?: string;
  provider: 'quick' | 'phone' | 'email';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function generateJWT(user: User): Promise<AuthTokens> {
  const accessToken = generateToken();
  const refreshToken = generateToken();

  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({
    token: accessToken,
    sub: user.id,
    email: user.email,
    iat: Date.now(),
    exp: Date.now() + 86400000,
  }));

  return { accessToken, refreshToken, expiresIn: 86400 };
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem('gigshield_user', user.name);
}

export async function getUser(): Promise<User | null> {
  const userData = await AsyncStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

export async function getToken(): Promise<string | null> {
  const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
  if (!tokenData) return null;
  const parsed = JSON.parse(tokenData);
  return parsed.exp > Date.now() ? parsed.token : null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getToken()) !== null;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    USER_KEY,
    'gigshield_user',
    'gigshield_email',
  ]);
}

// Quick login — name-based for demo
export async function quickLogin(name: string): Promise<User> {
  const user: User = {
    id: 'usr_' + Date.now(),
    name: name || 'Ravi Kumar',
    provider: 'quick',
    createdAt: new Date().toISOString(),
  };

  await generateJWT(user);
  await saveUser(user);
  return user;
}

// ======= MOBILE OTP (Demo) =======
let storedOTP: string | null = null;

export async function sendOTP(phone: string): Promise<boolean> {
  storedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Demo OTP:', storedOTP);
  return true;
}

export async function verifyOTP(phone: string, otp: string): Promise<User | null> {
  if (otp !== storedOTP && otp !== '123456') return null;
  storedOTP = null;

  const user: User = {
    id: 'phone_' + Date.now(),
    phone,
    name: 'User',
    provider: 'phone',
    createdAt: new Date().toISOString(),
  };

  await generateJWT(user);
  await saveUser(user);
  return user;
}
