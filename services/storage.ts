// AsyncStorage helpers for user data persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  user: 'gigshield_user',
  email: 'gigshield_email',
  phone: 'gigshield_phone',
  aadhaar: 'gigshield_aadhaar',
  platform: 'gigshield_platform',
  platformId: 'gigshield_platform_id',
  city: 'gigshield_city',
  zones: 'gigshield_zones',
  plan: 'gigshield_plan',
  upiId: 'gigshield_upi',
  theme: 'gigshield_theme',
  registered: 'gigshield_registered',
  claims: 'gigshield_claims',
  policyActive: 'gigshield_policy_active',
  policyStartDate: 'gigshield_policy_start',
};

export async function saveUserData(data: Record<string, string>) {
  const entries = Object.entries(data).map(([key, value]) => [key, value] as [string, string]);
  await AsyncStorage.multiSet(entries);
}

export async function getUserData(keys: string[]): Promise<Record<string, string | null>> {
  const pairs = await AsyncStorage.multiGet(keys);
  return Object.fromEntries(pairs);
}

export async function clearUserData() {
  const allKeys = Object.values(KEYS);
  await AsyncStorage.multiRemove(allKeys);
}

export async function isRegistered(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.registered);
  return val === 'true';
}

export async function isLoggedIn(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.user);
  return val !== null;
}

export { KEYS };
