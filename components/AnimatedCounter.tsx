// Animated number counter — counts up from 0 to target value
import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useState } from 'react';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  style?: TextStyle | TextStyle[];
  formatter?: (val: number) => string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1200,
  style,
  formatter,
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animatedValue.value = 0;
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  useDerivedValue(() => {
    runOnJS(setDisplayValue)(Math.round(animatedValue.value));
  });

  const formattedValue = formatter
    ? formatter(displayValue)
    : displayValue.toLocaleString();

  return (
    <Text style={style}>
      {prefix}{formattedValue}{suffix}
    </Text>
  );
}
