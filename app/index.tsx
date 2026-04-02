// Animated Radial Splash matching the precision hardware UI
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';
import { Shield, CloudLightning, Camera, Waves, Wallet, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SIZE = 440; // Greatly expanded canvas area
const CENTER = SIZE / 2;
const BUBBLE_RADIUS = 150; // Increased radius to fill out screen significantly

// We want 5 segments. Circumference for r=150 is ~942.47. 
// 942.47 / 5 = 188.49. Let's make Arc = 120, Gap = 68.49.
const ARC_LENGTH = 120;
const GAP_LENGTH = 68.49;
const DASH_ARRAY = `${ARC_LENGTH} ${GAP_LENGTH}`;
// Offset aligns the gaps precisely on the 0, 72, 144... degree marks for the bubbles to sit inside
const DASH_OFFSET = GAP_LENGTH / 2; 

// Contextual App Icons for the bubbles
const ORBIT_ICONS = [
  { id: 0, Icon: CloudLightning }, // Top-Right (0 starts at 3 o'clock, 72 is bottom right etc if drawn normal, but rotated by -90 it starts top)
  { id: 1, Icon: Camera },
  { id: 2, Icon: Waves },
  { id: 3, Icon: Wallet },
  { id: 4, Icon: Zap },
];

export default function SplashScreen() {
  const router = useRouter();

  const containerOpacity = useSharedValue(0);
  
  // Outer rotates clockwise, inner rotates counter-clockwise
  const outerRotation = useSharedValue(0);
  const innerRotation = useSharedValue(0);

  useEffect(() => {
    // Elegant fade in
    containerOpacity.value = withTiming(1, { duration: 1000 });

    // Inner fine-tick ring rotates counter-clockwise slowly
    innerRotation.value = withRepeat(
      withTiming(-360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );

    // Outer thick arcs + bubbles rotate clockwise
    outerRotation.value = withRepeat(
      withTiming(360, { duration: 32000, easing: Easing.linear }),
      -1,
      false
    );

    checkAuth();
  }, []);

  async function checkAuth() {
    await new Promise((r) => setTimeout(r, 4500));

    containerOpacity.value = withTiming(0, { duration: 400 });
    await new Promise((r) => setTimeout(r, 500));

    const user = await AsyncStorage.getItem('gigshield_user');
    if (user) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(auth)/login');
    }
  }

  const fadeStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  
  // Rotation for the inner clock ticks
  const innerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${innerRotation.value}deg` }] }));
  
  // Rotation for the outer segmented ring and orbital bubbles
  const outerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${outerRotation.value}deg` }] }));
  
  // Bubbles counter-rotate by -outerRotation, so icons stay completely upright
  const counterStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${-outerRotation.value}deg` }] }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, fadeStyle]}>

        <View style={styles.radarBox}>
          
          {/* Inner Dashed Ring (Fine Ticks) */}
          <Animated.View style={[styles.absoluteCenter, innerStyle]}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              <Circle 
                cx={CENTER} 
                cy={CENTER} 
                r={85} 
                stroke={Colors.dark.lime} 
                strokeWidth={5} 
                strokeDasharray="2 6" // Dense, thin clock-like ticks
                fill="none" 
              />
            </Svg>
          </Animated.View>

          {/* Outer Segmented Arcs */}
          {/* We rotate the entire SVG container -90deg so angle 0 represents the top of the circle */}
          <Animated.View style={[styles.absoluteCenter, outerStyle]}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle 
                cx={CENTER} 
                cy={CENTER} 
                r={BUBBLE_RADIUS} 
                stroke={Colors.dark.lime} 
                strokeWidth={8} 
                strokeDasharray={DASH_ARRAY}
                strokeDashoffset={DASH_OFFSET} 
                strokeLinecap="round"
                fill="none" 
              />
            </Svg>
            
            {/* The bubbles orbit tightly within the gaps of the thick arcs */}
            {ORBIT_ICONS.map((item, index) => {
              // Calculate mapping placement (shifting -90 degrees so index 0 is at Top)
              // 360 / 5 = 72 degrees step
              const angle = ((index * 72) - 90) * (Math.PI / 180);
              const x = Math.cos(angle) * BUBBLE_RADIUS;
              const y = Math.sin(angle) * BUBBLE_RADIUS;

              // Top-left rule: Make the first bubble solid to match image asymmetry
              const isSolid = index === 0;
              
              return (
                <View 
                  key={item.id}
                  style={[styles.bubbleWrapper, { transform: [{ translateX: x }, { translateY: y }] }]}
                >
                  <Animated.View style={[
                    styles.bubble, 
                    isSolid && styles.bubbleSolid,
                    counterStyle // keeps the inner icon unrotated
                  ]}>
                    <item.Icon size={22} color={isSolid ? Colors.dark.background : Colors.dark.lime} strokeWidth={2.5} />
                  </Animated.View>
                </View>
              );
            })}
          </Animated.View>

          {/* Center Hub */}
          <View style={styles.hubCore}>
            <Shield size={44} color={Colors.dark.lime} strokeWidth={1.5} />
          </View>

        </View>

        {/* Footer App Attribution */}
        <View style={styles.footer}>
          <Text style={styles.subtitle}>B Y   A L T E R   D I M E</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black premium hardware aesthetic
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarBox: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCenter: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: 'rgba(203, 255, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: Colors.dark.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bubbleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: Colors.dark.lime,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleSolid: {
    backgroundColor: Colors.dark.lime,
    // Add an extra strong glow to the highlighted solid bubble
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    letterSpacing: 4,
    fontWeight: '500',
  },
});
