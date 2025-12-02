import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { jwtDecode } from "jwt-decode";
import { ArrowLeft, Settings } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  DimensionValue,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// --- COMPONENTS ---
import JoystickConfigurationModal from '@/components/joystick/joystick-config-modal';
import VirtualJoystick from '@/components/joystick/virtual-joystick';

// --- HOOKS & API ---
import { sendCommand } from '@/features/actions/api/api';
import { useJoystick } from '@/features/actions/hooks/useApi';
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
  const navigation = useNavigation();

  // 1. Robot info
  const { selectedRobotSerial, selectedRobot } = useRobotStore();
  const activeSerial = Array.isArray(selectedRobotSerial) ? selectedRobotSerial[0] : selectedRobotSerial;

  // 2. Auth Info
  const [accountId, setAccountId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          const decoded: any = jwtDecode(token);
          setAccountId(decoded.sub || decoded.id || decoded.userId);
        }
      } catch(e) { console.log('Err decode token', e); }
    })();
  }, []);

  // 3. Config Joystick API
  const { useGetJoysticks } = useJoystick();
  const { data: joystickRes, refetch: refetchConfigs } = useGetJoysticks({ 
      accountId: accountId || undefined, 
      robotId: selectedRobot?.id 
  });
  const joystickConfigs = joystickRes?.joysticks || [];

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastCommandTime = useRef(0);
  const lastDirection = useRef<string | null>(null);

  // 4. Xoay màn hình & ẨN BOTTOM TAB
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        navigation.getParent()?.setOptions({ tabBarStyle: undefined });
      };
    }, [navigation])
  );

  // 5. Joystick Di chuyển (Analog)
  const handleJoystickMove = useCallback((x: number, y: number) => {
    if (!activeSerial) return;
    if (Math.sqrt(x * x + y * y) < 0.3) return; 

    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const normalizedAngle = ((angle % 360) + 360) % 360;

    let direction = null;
    if (normalizedAngle > 45 && normalizedAngle < 135) direction = 'Keep_going_backwards';
    else if (normalizedAngle >= 135 && normalizedAngle < 225) direction = 'Keep_turning_left';
    else if (normalizedAngle >= 225 && normalizedAngle < 315) direction = 'Keep_moving_forward';
    else direction = 'Keep_turning_right';

    const now = Date.now();
    if (direction && (direction !== lastDirection.current || now - lastCommandTime.current > 300)) {
      console.log(`🕹 Move: ${direction}`);
      sendCommand(activeSerial, { type: 'skill_helper', data: { code: direction } });
      lastDirection.current = direction;
      lastCommandTime.current = now;
    }
  }, [activeSerial]);

  // 6. Xử lý nút bấm (Action)
  const handleActionPress = (btnId: string) => {
    if (!activeSerial) { Alert.alert("Lỗi", "Chưa chọn Robot!"); return; }
    
    // Tìm config tương ứng với nút bấm
    const config = joystickConfigs.find((j: any) => j.buttonCode === btnId);
    
    if (config) {
      console.log(`🔴 Button ${btnId} -> ${config.actionName}`);
      const code = config.actionCode || config.danceCode || config.expressionCode || config.extendedActionCode;
      if (code) {
          // Gửi lệnh cho Robot
          sendCommand(activeSerial, { 
              type: config.type, 
              data: { code: code } 
          }).catch(() => Alert.alert("Lỗi", "Không gửi được lệnh tới Robot"));
      }
    } else {
      Alert.alert("Thông báo", `Nút ${btnId} chưa được gán. Hãy vào cài đặt.`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      {/* HEADER */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <View style={styles.robotBadge}>
          <Text style={styles.robotName}>{selectedRobot?.name || activeSerial || "Disconnected"}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSettingsOpen(true)}>
          <Settings color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.bodyRow}>
        {/* Joystick Left */}
        <View style={styles.sideControl}>
          <VirtualJoystick
            onMove={handleJoystickMove}
            onStop={() => { lastDirection.current = null; }}
            size={160}
          />
        </View>

        {/* Center Screen */}
        <View style={styles.centerScreen}>
          <View style={styles.cameraFrame}>
             <Text style={{color: '#64748b'}}>Camera Stream</Text>
          </View>
        </View>

        {/* Action Buttons Right */}
        <View style={styles.sideControl}>
          <View style={styles.diamondContainer}>
            {ACTION_BUTTONS.map((btn) => {
              const hasConfig = joystickConfigs.some((j: any) => j.buttonCode === btn.id);
              return (
                <TouchableOpacity
                    key={btn.id}
                    style={[
                        styles.actionBtn,
                        { 
                          backgroundColor: btn.color, 
                          top: btn.top, left: btn.left, right: btn.right, bottom: btn.bottom, 
                          transform: btn.transform, 
                          opacity: hasConfig ? 1 : 0.6 
                        }
                    ]}
                    onPress={() => handleActionPress(btn.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionText}>{btn.id}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* MODAL CONFIG */}
      <JoystickConfigurationModal
        isVisible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        existingJoysticks={joystickConfigs}
        onSuccess={() => refetchConfigs()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', width: '100%', height: '100%' },
  headerOverlay: { position: 'absolute', top: 20, left: 20, right: 20, zIndex: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  robotBadge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  robotName: { color: '#e2e8f0', fontSize: 14, fontWeight: 'bold' },
  iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50 },
  bodyRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10 },
  sideControl: { width: 180, height: '100%', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  centerScreen: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', padding: 5 },
  cameraFrame: { width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  diamondContainer: { width: 160, height: 160, position: 'relative' },
  actionBtn: { position: 'absolute', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  actionText: { color: '#fff', fontWeight: '900', fontSize: 22, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
});