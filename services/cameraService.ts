// Camera + GPS Evidence Capture Service
// Captures photos with embedded GPS coordinates for claim validation
// Part of the anti-spoofing pipeline (README: "Photo Challenge with CV")

import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EVIDENCE_STORAGE_KEY = '@gigshield_evidence_history';

export interface ClaimEvidence {
  photoUri: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    city: string;
  };
  metadata: {
    capturedAt: string;
    deviceTime: string;
    gpsConfidence: string;
  };
}

// ─── Permission Helpers ─────────────────────────────────────────

export async function requestCameraPermission(): Promise<boolean> {
  // expo-camera handles permissions via its own hook (useCameraPermissions)
  // This is a utility for checking from outside camera component
  return true;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Location Required',
      'GPS location is needed to validate your claim. This helps us verify you were in the disruption zone and speeds up your payout.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
}

// ─── Get Current GPS Location ───────────────────────────────────

export async function getCurrentLocation(): Promise<ClaimEvidence['location'] | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Reverse geocode to get city name
    let cityName = 'Unknown';
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        cityName = geocode[0].city || geocode[0].subregion || geocode[0].region || 'Unknown';
      }
    } catch {
      // Reverse geocode may fail in some environments
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      altitude: location.coords.altitude,
      city: cityName,
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
}

// ─── Build Evidence Object ──────────────────────────────────────

export function buildClaimEvidence(
  photoUri: string,
  location: ClaimEvidence['location']
): ClaimEvidence {
  const now = new Date();

  return {
    photoUri,
    timestamp: now.toISOString(),
    location,
    metadata: {
      capturedAt: now.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      deviceTime: now.toISOString(),
      gpsConfidence: location.accuracy < 10 ? 'High' : location.accuracy < 50 ? 'Medium' : 'Low',
    },
  };
}

export async function saveEvidence(evidence: ClaimEvidence): Promise<void> {
  try {
    const existingStr = await AsyncStorage.getItem(EVIDENCE_STORAGE_KEY);
    const existing: ClaimEvidence[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [evidence, ...existing];
    await AsyncStorage.setItem(EVIDENCE_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save evidence:', error);
  }
}

export async function getEvidenceHistory(): Promise<ClaimEvidence[]> {
  try {
    const dataStr = await AsyncStorage.getItem(EVIDENCE_STORAGE_KEY);
    return dataStr ? JSON.parse(dataStr) : [];
  } catch (error) {
    console.error('Failed to fetch evidence history:', error);
    return [];
  }
}

export async function clearEvidenceHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EVIDENCE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear evidence history', error);
  }
}

// ─── Format GPS for display ─────────────────────────────────────

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

export function getGPSAccuracyLabel(accuracy: number): { label: string; color: string } {
  if (accuracy < 10) return { label: 'Excellent', color: '#34C759' };
  if (accuracy < 30) return { label: 'Good', color: '#CBFF00' };
  if (accuracy < 100) return { label: 'Fair', color: '#FF9500' };
  return { label: 'Poor', color: '#FF3B30' };
}
