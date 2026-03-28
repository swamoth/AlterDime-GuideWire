// Auth Service - JWT + OAuth2.0 (Google + Mobile OTP)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Required for web — completes the auth session redirect
WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'gigshield_token';
const REFRESH_TOKEN_KEY = 'gigshield_refresh_token';
const USER_KEY = 'gigshield_user_data';

// Google OAuth Config
// In Google Console, add these EXACT redirect URIs:
//   Web:     http://localhost:8081
//   Android: com.alterdime.gigshield:/oauthredirect
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''; // Set in .env file

// Google discovery document
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export interface User {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  avatar?: string;
  provider: 'google' | 'phone' | 'email';
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
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  return { accessToken, refreshToken, expiresIn: 86400 };
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
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
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
}

// Build the redirect URI — must EXACTLY match what's in Google Console
export function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    // For web: produces http://localhost:8081 (no extra path)
    // For native: produces com.alterdime.gigshield:/oauthredirect  
  });
}

// Real Google OAuth — uses implicit flow (no client secret needed)
export async function signInWithGoogle(): Promise<User> {
  const redirectUri = getRedirectUri();
  console.log('Using redirect URI:', redirectUri);

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: AuthSession.ResponseType.Token, // Implicit flow — no client secret needed
    usePKCE: false, // PKCE not allowed with implicit flow on web clients
  });

  const result = await request.promptAsync(GOOGLE_DISCOVERY);

  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled or failed');
  }

  // Extract access token from the response
  const accessToken = (result as any).authentication?.accessToken 
    || (result as any).params?.access_token;

  if (!accessToken) {
    throw new Error('No access token received from Google');
  }

  // Fetch user profile from Google
  const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info from Google');
  }

  const googleUser = await response.json();
  const user: User = {
    id: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    avatar: googleUser.picture,
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  await generateJWT(user);
  await saveUser(user);
  return user;
}

// Demo Google Login - Works instantly without real OAuth
export async function signInWithGoogleDemo(): Promise<User> {
  await new Promise(r => setTimeout(r, 1500));
  
  const user: User = {
    id: 'google_demo_' + Date.now(),
    email: 'ravi.kumar@gmail.com',
    name: 'Ravi Kumar',
    avatar: 'https://lh3.googleusercontent.com/a/default',
    provider: 'google',
    createdAt: new Date().toISOString(),
  };

  await generateJWT(user);
  await saveUser(user);
  return user;
}

// Mobile OTP (demo)
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
