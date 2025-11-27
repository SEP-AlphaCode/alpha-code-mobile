// import { useRobotCommand } from '@/hooks/useRobotCommand';
// import { AlertCircle, VideoOff } from 'lucide-react-native';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// import {
//     MediaStream,
//     RTCIceCandidate,
//     RTCPeerConnection,
//     RTCSessionDescription,
//     RTCView
// } from 'react-native-webrtc';

// import { socketUrl } from '@/constants/constants';
// // const socketUrl = 'http://192.168.1.18:8000'; // Ví dụ IP

// interface RobotVideoStreamProps {
//   robotSerial: string | null;
//   style?: any;
// }

// export default function RobotVideoStream({ robotSerial, style }: RobotVideoStreamProps) {
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'error'>('idle');
  
//   const wsRef = useRef<WebSocket | null>(null);
//   const pcRef = useRef<RTCPeerConnection | null>(null);
  
//   const { sendWebRTCCommand } = useRobotCommand();

//   const startStream = useCallback(async () => {
//     if (!robotSerial) return;
//     setStatus('loading');

//     try {
//       // 1. Gửi lệnh API báo Robot mở WebRTC
//       await sendWebRTCCommand(robotSerial, 'webrtc_start');

//       // 2. Tạo PeerConnection
//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//       });
//       pcRef.current = pc;

//       // ✅ CHUẨN: Sử dụng addEventListener theo file định nghĩa bạn gửi
//       // Dùng (event: any) để tránh xung đột type nếu TS cấu hình quá chặt
//       pc.addEventListener('track', (event: any) => {
//         // Kiểm tra track/streams theo chuẩn thư viện
//         if (event.streams && event.streams.length > 0) {
//            setRemoteStream(event.streams[0]);
//            setStatus('streaming');
//         } else if (event.track) {
//            // Fallback cho một số phiên bản cũ hơn trả về track lẻ
//            const newStream = new MediaStream([event.track]);
//            setRemoteStream(newStream);
//            setStatus('streaming');
//         }
//       });

//       pc.addEventListener('icecandidate', (event: any) => {
//         if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ type: 'ice', candidate: event.candidate }));
//         }
//       });

//       // 3. Kết nối WebSocket Signaling
//       const ws = new WebSocket(`${socketUrl}/signaling/${robotSerial}/mobile`); 
//       wsRef.current = ws;

//       ws.onopen = () => console.log("WebRTC WS Connected");
      
//       ws.onmessage = async (event) => {
//         const data = JSON.parse(event.data);
        
//         if (data.type === 'offer') {
//           // ✅ CHUẨN: Wrap data vào class RTCSessionDescription
//           await pc.setRemoteDescription(new RTCSessionDescription(data)); 
//           const answer = await pc.createAnswer();
//           await pc.setLocalDescription(answer);
//           ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
        
//         } else if (data.type === 'ice' && data.candidate) {
//           // ✅ CHUẨN: Wrap candidate vào class RTCIceCandidate
//           await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); 
//         }
//       };

//       ws.onerror = (e) => {
//         console.log("WebRTC WS Error", e);
//         setStatus('error');
//       };

//     } catch (err) {
//       console.error("Stream Start Error", err);
//       setStatus('error');
//     }
//   }, [robotSerial, sendWebRTCCommand]);

//   useEffect(() => {
//     if (robotSerial) {
//         startStream();
//     }
//     return () => {
//       // Cleanup
//       if (remoteStream) {
//         remoteStream.getTracks().forEach(t => t.stop());
//         remoteStream.release(); // Quan trọng để giải phóng RAM trên mobile
//       }
//       pcRef.current?.close();
//       wsRef.current?.close();
      
//       if (robotSerial) {
//           sendWebRTCCommand(robotSerial, 'webrtc_stop').catch(() => {});
//       }
//     };
//   }, [robotSerial]);

//   return (
//     <View style={[styles.container, style]}>
//       {status === 'streaming' && remoteStream ? (
//         <RTCView 
//           streamURL={remoteStream.toURL()} 
//           objectFit="cover" 
//           style={styles.video} 
//         />
//       ) : (
//         <View style={styles.placeholder}>
//           {status === 'loading' ? <ActivityIndicator size="large" color="#fff" /> : 
//            status === 'error' ? <AlertCircle size={32} color="#ef4444" /> : 
//            <VideoOff size={32} color="#6b7280" />}
//           <Text style={styles.statusText}>
//             {status === 'loading' ? 'Đang kết nối Camera...' : status === 'error' ? 'Lỗi Camera' : 'Sẵn sàng'}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden', aspectRatio: 16 / 9, width: '100%' },
//   video: { width: '100%', height: '100%' },
//   placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
//   statusText: { color: '#d1d5db', fontSize: 12 },
// });