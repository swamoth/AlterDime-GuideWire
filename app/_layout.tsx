import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, TextInput } from 'react-native';
import { Colors } from '../constants/theme';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Global Font Monkey Patch — outside component to avoid re-render loops
const TextWithDefaultProps = Text as any;
TextWithDefaultProps.defaultProps = TextWithDefaultProps.defaultProps || {};
TextWithDefaultProps.defaultProps.style = {
  ...TextWithDefaultProps.defaultProps.style,
  fontFamily: 'Inter_500Medium',
  letterSpacing: -0.2,
};

const TextInputWithDefaultProps = TextInput as any;
TextInputWithDefaultProps.defaultProps = TextInputWithDefaultProps.defaultProps || {};
TextInputWithDefaultProps.defaultProps.style = {
  ...TextInputWithDefaultProps.defaultProps.style,
  fontFamily: 'Inter_500Medium'
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.dark.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}
