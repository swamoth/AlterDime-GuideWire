import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Unique global identifier for the background daemon
export const LOCATION_TASK_NAME = 'background-location-task';

// The exact execution block that survives even when the React Native UI is closed.
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(`[BackgroundTracker] Task execution failed:`, error.message);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (!locations || locations.length === 0) return;

    try {
      const latestCoord = locations[locations.length - 1].coords;
      console.log(`[BackgroundTracker] Silent Ping Captured: ${latestCoord.latitude}, ${latestCoord.longitude}`);

      // Serialize and append to the local persistent database (SQLite wrapper)
      const existingStr = await AsyncStorage.getItem('@gigshield_live_route');
      const existingCache = existingStr ? JSON.parse(existingStr) : [];

      const newCache = [...existingCache, {
        lat: latestCoord.latitude,
        lon: latestCoord.longitude,
        timestamp: new Date().toISOString()
      }];

      // Cap memory limits to the last 100 pinged coordinates to avoid Bloat memory-leaks.
      if (newCache.length > 100) newCache.shift();

      await AsyncStorage.setItem('@gigshield_live_route', JSON.stringify(newCache));
    } catch (e) {
      console.error('[BackgroundTracker] Persistence Exception:', e);
    }
  }
});

// User Action Trigger: Start tracking and display sticky notification.
export async function startShift() {
  const foregroundAuth = await Location.requestForegroundPermissionsAsync();
  if (foregroundAuth.status !== 'granted') throw new Error('Foreground GPS denied');

  const backgroundAuth = await Location.requestBackgroundPermissionsAsync();
  if (backgroundAuth.status !== 'granted') throw new Error('Background GPS denied by OS Security');

  // Activate the high-performance battery-throttled Daemon.
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,  // 'Balanced' rather than 'Highest' avoids massive battery drain.
    distanceInterval: 100,                 // Only fire when they physically move 100 meters.
    deferredUpdatesInterval: 60000,        // Batch triggers every 60 seconds.
    showsBackgroundLocationIndicator: true,// Required to prevent App Store instantaneous rejections.
    foregroundService: {                   // Explicit Android 14+ bypass
      notificationTitle: "Shift Active: GigShield AI",
      notificationBody: "Disruptions and weather conditions are being passively monitored.",
      notificationColor: "#A4E367",
    },
  });

  return true;
}

// User Action Trigger: De-escalate privileges and nuke tracking daemon.
export async function stopShift() {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
  return true;
}

// Status query for UI sync
export async function checkShiftActive() {
  return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
}
