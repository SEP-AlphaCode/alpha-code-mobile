import { pythonHttp } from '@/utils/http';
import { useCallback } from 'react';

// Callback để hiển thị thông báo (Toast)
type NotifyCallback = (msg: string, type: 'success' | 'error') => void;

export function useRobotCommand(setNotify?: NotifyCallback) {
  
  // 1. Gửi lệnh điều khiển (Di chuyển, Action, Expression...)
  const sendCommandToBackend = useCallback(async (
    actionCode: string,
    robotSerial: string,
    type: "action" | "expression" | "skill_helper" | "extended_action" | "process-text" = "action"
  ) => {
    if (!robotSerial) return;

    try {
      const body = {
        type,
        data: { code: actionCode },
      };

      // Gọi API Python
      const res = await pythonHttp.post(`/websocket/command/${robotSerial}`, body);
      const data = res.data;

      if (data.status === 'sent') {
        // Chỉ hiện notify nếu cần thiết (tránh spam khi di chuyển joystick)
        if (type !== 'skill_helper') {
            setNotify?.('✅ Đã gửi lệnh', 'success');
        }
      } else {
        setNotify?.('⚠️ Lỗi gửi lệnh', 'error');
      }
      return data;

    } catch (err) {
      console.error("Command Error:", err);
      // setNotify?.('❌ Mất kết nối Robot', 'error'); // Uncomment nếu muốn báo lỗi mạng
      throw err;
    }
  }, [setNotify]);

  // 2. Gửi lệnh Bật/Tắt Camera WebRTC
  const sendWebRTCCommand = useCallback(async (
    robotSerial: string,
    command: "webrtc_start" | "webrtc_stop"
  ) => {
    try {
      const body = {
        type: command,
        data: {},
        lang: "en"
      };

      const res = await pythonHttp.post(`/websocket/command/${robotSerial}`, body);
      return res.data;

    } catch (err) {
      console.error(`WebRTC ${command} Error:`, err);
      throw err;
    }
  }, []);

  return {
    sendCommandToBackend,
    sendWebRTCCommand
  };
}