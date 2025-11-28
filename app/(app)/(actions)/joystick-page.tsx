import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation'; // 👈 Import thư viện xoay
import { ArrowLeft, Settings } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import {
  Alert,
  DimensionValue,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

// Import Components
import VirtualJoystick from '@/components/joystick/virtual-joystick';
// import RobotVideoStream from '@/components/robot/robot-video-stream';

// Import Hooks
import { useRobotCommand } from '@/hooks/useRobotCommand';
import { useRobotStore } from '@/hooks/useRobotStore';

interface ActionButtonConfig {
  id: string;
  color: string;
  top?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  bottom?: DimensionValue;
  transform?: ViewStyle['transform'];
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  { id: 'Y', color: '#22c55e', top: 0, left: '50%', transform: [{ translateX: -30 }] },
  { id: 'X', color: '#3b82f6', top: '50%', left: 0, transform: [{ translateY: -30 }] },
  { id: 'B', color: '#ef4444', top: '50%', right: 0, transform: [{ translateY: -30 }] },
  { id: 'A', color: '#eab308', bottom: 0, left: '50%', transform: [{ translateX: -30 }] },
];

export default function JoystickPage() {
  const router = useRouter();
  const { selectedRobotSerial, selectedRobot } = useRobotStore();
  const { sendCommandToBackend } = useRobotCommand();

  const activeSerial = Array.isArray(selectedRobotSerial) ? selectedRobotSerial[0] : selectedRobotSerial;

  const lastCommandTime = useRef(0);
  const lastDirection = useRef<string | null>(null);

  // 🔄 EFFECT: Tự động xoay ngang khi vào trang
  useFocusEffect(
    useCallback(() => {
      // Khi màn này được focus → xoay ngang
      (async () => {
        try {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
          );
        } catch (e) { }
      })();

      // Khi rời màn → trả về dọc ngay lập tức
      return () => {
        (async () => {
          try {
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
          } catch (e) { }
        })();
      };
    }, [])
  );

  // Xử lý Joystick
  const handleJoystickMove = useCallback((x: number, y: number) => {
    if (!activeSerial) return;

    const threshold = 0.3;
    const distance = Math.sqrt(x * x + y * y);
    if (distance < threshold) return;

    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const normalizedAngle = ((angle % 360) + 360) % 360;

    let direction = null;
    if (normalizedAngle > 45 && normalizedAngle < 135) direction = 'Keep_going_backwards';
    else if (normalizedAngle >= 135 && normalizedAngle < 225) direction = 'Keep_turning_left';
    else if (normalizedAngle >= 225 && normalizedAngle < 315) direction = 'Keep_moving_forward';
    else direction = 'Keep_turning_right';

    const now = Date.now();
    if (direction && (direction !== lastDirection.current || now - lastCommandTime.current > 300)) {
      console.log(`Sending: ${direction} -> ${activeSerial}`);
      sendCommandToBackend(direction, activeSerial, 'skill_helper');
      lastDirection.current = direction;
      lastCommandTime.current = now;
    }
  }, [activeSerial, sendCommandToBackend]);

  const handleActionPress = (btn: string) => {
    if (!activeSerial) return Alert.alert("Thông báo", "Vui lòng chọn Robot trước!");
    console.log(`Action ${btn} -> ${activeSerial}`);
    // sendCommandToBackend('wave_hand', activeSerial, 'action');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      {/* HEADER OVERLAY (Nổi lên trên) */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>

        <View style={styles.robotBadge}>
          <Text style={styles.robotName}>
            {selectedRobot?.name || (activeSerial ? activeSerial : "Disconnected")}
          </Text>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
          <Settings color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* MAIN LAYOUT (NGANG) */}
      <View style={styles.bodyRow}>

        {/* 🎮 TRÁI: Joystick */}
        <View style={styles.sideControl}>
          <VirtualJoystick
            onMove={handleJoystickMove}
            onStop={() => lastDirection.current = null}
            size={160}
          />
        </View>

        {/* 📺 GIỮA: Camera Stream */}
        <View style={styles.centerScreen}>
          <View style={styles.cameraFrame}>
            {/* <RobotVideoStream 
                    robotSerial={activeSerial} 
                    style={{ width: '100%', height: '100%' }} 
                 /> */}
          </View>
        </View>

        {/* 🎮 PHẢI: Buttons */}
        <View style={styles.sideControl}>
          <View style={styles.diamondContainer}>
            {ACTION_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.id}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: btn.color,
                    top: btn.top,
                    left: btn.left,
                    right: btn.right,
                    bottom: btn.bottom,
                    transform: btn.transform
                  }
                ]}
                onPress={() => handleActionPress(btn.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionText}>{btn.id}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Màu nền tối (Slate-900)
  },

  // Header nổi
  headerOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  robotBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  robotName: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  },

  // Layout chính: Hàng ngang (Row)
  bodyRow: {
    flex: 1,
    flexDirection: 'row', // Quan trọng nhất để nằm ngang
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  // Vùng điều khiển 2 bên
  sideControl: {
    width: 180,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Màn hình camera ở giữa
  centerScreen: {
    flex: 1, // Co giãn chiếm hết chỗ trống
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  cameraFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#334155',
  },

  // Nút bấm
  diamondContainer: {
    width: 160,
    height: 160,
    position: 'relative',
  },
  actionBtn: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});