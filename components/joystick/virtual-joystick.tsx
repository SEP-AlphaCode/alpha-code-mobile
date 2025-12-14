import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onStop: () => void;
  size?: number;
}

export default function VirtualJoystick({ onMove, onStop, size = 150 }: VirtualJoystickProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const MAX_RADIUS = size / 2;

  // Hàm gọi ngược về JS thread
  const handleMoveJS = (x: number, y: number) => {
    const normalizedX = x / MAX_RADIUS;
    const normalizedY = y / MAX_RADIUS;
    onMove(normalizedX, normalizedY);
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const x = e.translationX;
      const y = e.translationY;
      
      const distance = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x);
      
      const limitedDist = Math.min(distance, MAX_RADIUS);
      const limitedX = Math.cos(angle) * limitedDist;
      const limitedY = Math.sin(angle) * limitedDist;

      translateX.value = limitedX;
      translateY.value = limitedY;

      runOnJS(handleMoveJS)(limitedX, limitedY);
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      runOnJS(onStop)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
  }));

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.thumb, animatedStyle]}>
           <View style={styles.innerThumb} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e2e8f0',
    borderWidth: 4,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  innerThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
  }
});