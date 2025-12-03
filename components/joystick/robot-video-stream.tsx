import { AlertCircle, Bot, Loader2, Play, Radio, Square } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RTCPeerConnection, RTCView } from 'react-native-webrtc';

// Import Hook
import { socketUrl } from '@/constants/constants';
import { useRobotCommand } from '@/hooks/useRobotCommand';

// ⚠️ Cấu hình signaling server
const SIGNALING_SERVER_URL = socketUrl;

interface RobotVideoStreamProps {
  robotSerial: string | null;
  isCompact?: boolean;
  showControls?: boolean;
  style?: any;
  onError?: (error: string) => void;
  onStatusChange?: (isStreaming: boolean) => void;
}

export default function RobotVideoStream({
  robotSerial,
  isCompact = false,
  showControls = true,
  style,
  onError,
  onStatusChange
}: RobotVideoStreamProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [robotError, setRobotError] = useState<string | null>(null);
  const [isWebRTCStarted, setIsWebRTCStarted] = useState(false);
  const [remoteStreamURL, setRemoteStreamURL] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const { sendWebRTCCommand } = useRobotCommand();

  // Retry state
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY = 3;

  useEffect(() => {
    onStatusChange?.(isWebRTCStarted);
  }, [isWebRTCStarted, onStatusChange]);

  // === RETRY LOGIC ===
  const retryWebRTC = useCallback(() => {
    if (retryCount >= MAX_RETRY) {
      console.log("❌ Retry limit reached");
      setRobotError("Không thể kết nối camera sau nhiều lần thử.");
      setIsLoading(false);
      return;
    }

    const next = retryCount + 1;
    setRetryCount(next);

    console.log(`🔁 Retry WebRTC... (${next}/${MAX_RETRY})`);

    setTimeout(() => {
      initializeWebRTCConnection();
    }, 2000);
  }, [retryCount]);

  // === INITIALIZE WEBRTC ===
  const initializeWebRTCConnection = useCallback(() => {
    if (!robotSerial) return;

    console.log("🔗 [WebRTC] Initializing connection...");
    let pc: RTCPeerConnection | null = null;
    let ws: WebSocket | null = null;

    try {
      const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };

      pc = new RTCPeerConnection(configuration);
      pcRef.current = pc;

      // Receive track
      (pc as any).ontrack = (event: any) => {
        console.log("📹 [WebRTC] Received video track");
        if (event.streams && event.streams.length > 0) {
          setRemoteStreamURL(event.streams[0].toURL());
          setIsLoading(false);
          setRetryCount(0); // reset retry khi thành công
        }
      };

      // ICE candidate
      (pc as any).onicecandidate = (event: any) => {
        if (event.candidate && ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ice", candidate: event.candidate }));
        }
      };

      const wsUrl = `${SIGNALING_SERVER_URL}/signaling/${robotSerial}/web`;
      console.log(`🔌 Connecting WS: ${wsUrl}`);

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ [WS] Connected");
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "webrtc_start_response") {
            console.log("📨 Robot confirmed START");
            setIsWebRTCStarted(true);
            setRobotError(null);
            setRetryCount(0); // reset retry
          }
          else if (data.type === "webrtc_stop_response") {
            console.log("📨 Robot confirmed STOP");
            setIsWebRTCStarted(false);
            setRemoteStreamURL(null);
            setIsLoading(false);
          }
          else if (data.type === "offer") {
            if (!pc) return;
            console.log("📨 Received OFFER");
            await pc.setRemoteDescription(data);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws?.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
          }
          else if (data.type === "answer") {
            console.log("📨 Received ANSWER");
            await pc?.setRemoteDescription(data);
          }
          else if (data.type === "ice" && data.candidate) {
            await pc?.addIceCandidate(data.candidate);
          }
        } catch (err) {
          console.error("❌ [WS] Message error:", err);
        }
      };

      ws.onerror = (e: any) => {
        console.error("❌ [WS] Error:", e.message);
        setRobotError("Lỗi kết nối Server — thử lại...");
        setIsLoading(false);
        retryWebRTC();
      };

      ws.onclose = () => {
        console.log("⚠️ [WS] Closed");
        if (isWebRTCStarted && retryCount < MAX_RETRY) {
          retryWebRTC();
        }
        setIsWebRTCStarted(false);
      };

    } catch (err: any) {
      console.error("❌ [WebRTC] Init Error:", err);
      setRobotError("Lỗi khởi tạo WebRTC — thử lại...");
      setIsLoading(false);
      retryWebRTC();
    }
  }, [robotSerial, retryCount]);

  const cleanupWebRTCConnection = useCallback(() => {
    console.log("🧹 [WebRTC] Cleanup");
    setIsWebRTCStarted(false);
    setRemoteStreamURL(null);
    setRetryCount(0);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  // === COMMAND CONTROL ===
  const handleStart = useCallback(async () => {
    if (!robotSerial || isLoading || isWebRTCStarted) return;

    setIsLoading(true);
    setRobotError(null);
    setRetryCount(0);

    try {
      await sendWebRTCCommand(robotSerial, 'webrtc_start');
      initializeWebRTCConnection();
    } catch (e) {
      console.error("Failed to start:", e);
      setRobotError("Không thể bật Camera");
      setIsLoading(false);
      onError?.("Không thể bật Camera");
    }
  }, [robotSerial, isLoading, isWebRTCStarted, sendWebRTCCommand, initializeWebRTCConnection]);

  const handleStop = useCallback(async () => {
    if (!robotSerial) return;
    setIsLoading(true);
    setRetryCount(0);

    try {
      await sendWebRTCCommand(robotSerial, 'webrtc_stop');
      cleanupWebRTCConnection();
    } catch (e) {
      console.error("Failed to stop:", e);
    } finally {
      setIsLoading(false);
    }
  }, [robotSerial, sendWebRTCCommand, cleanupWebRTCConnection]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => cleanupWebRTCConnection();
  }, []);

  // === RENDER UI ===
  if (!robotSerial) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Bot color="#94a3b8" size={32} />
        <Text style={styles.placeholderText}>Chưa chọn robot</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>

      {/* HEADER CONTROLS */}
      {!isCompact && showControls && (
        <View style={styles.headerControl}>
          <View style={[styles.badge, isWebRTCStarted ? styles.badgeActive : styles.badgeInactive]}>
            {isLoading ? <Loader2 size={12} color="#fff" /> : <Radio size={12} color={isWebRTCStarted ? "#fff" : "#94a3b8"} />}
            <Text style={[styles.badgeText, !isWebRTCStarted && { color: '#94a3b8' }]}>
              {isLoading ? "Kết nối..." : isWebRTCStarted ? "Live" : "Offline"}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.btnMini, { backgroundColor: '#2563eb' }]}
              onPress={handleStart}
              disabled={isLoading || isWebRTCStarted}
            >
              <Play size={12} color="#fff" fill="#fff" />
              <Text style={styles.btnText}>Bật</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnMini, { backgroundColor: '#ef4444' }]}
              onPress={handleStop}
              disabled={isLoading || !isWebRTCStarted}
            >
              <Square size={12} color="#fff" fill="#fff" />
              <Text style={styles.btnText}>Tắt</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* VIDEO CONTAINER */}
      <View style={styles.videoContainer}>
        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#a855f7" />
            <Text style={styles.overlayText}>Đang kết nối...</Text>
          </View>
        )}

        {robotError && (
          <View style={styles.overlay}>
            <AlertCircle size={32} color="#ef4444" />
            <Text style={[styles.overlayText, { color: '#ef4444' }]}>{robotError}</Text>
          </View>
        )}

        {remoteStreamURL ? (
          <RTCView
            streamURL={remoteStreamURL}
            style={styles.rtcVideo}
            objectFit="cover"
            mirror={false}
            zOrder={1}
          />
        ) : (
          <View style={styles.rtcVideoPlaceholder} />
        )}

        {isCompact && showControls && (
          <View style={styles.compactControls}>
            <TouchableOpacity onPress={handleStart} style={styles.iconBtn} disabled={isWebRTCStarted}>
              <Play size={16} color="#fff" fill={isWebRTCStarted ? "gray" : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStop} style={[styles.iconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.8)' }]} disabled={!isWebRTCStarted}>
              <Square size={16} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12
  },
  placeholderText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
  },
  headerControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeActive: { backgroundColor: '#22c55e' },
  badgeInactive: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  btnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 200,
  },
  rtcVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  rtcVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500'
  },
  compactControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
