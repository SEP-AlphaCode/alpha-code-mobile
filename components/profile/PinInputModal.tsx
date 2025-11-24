import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";
import { ProfileAvatar } from "./ProfileAvatar";

interface PinInputModalProps {
  visible: boolean;
  profileName: string;
  avatarUrl?: string;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PinInputModal({
  visible,
  profileName,
  avatarUrl,
  onConfirm,
  onCancel,
  loading = false
}: PinInputModalProps) {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (visible) {
      // Reset PIN when modal opens
      setPin(["", "", "", ""]);
      // Focus first input after a short delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [visible]);

  const handlePinChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d$/.test(text)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    // Auto focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 4 digits entered
    if (index === 3 && text) {
      const fullPin = newPin.join("");
      if (fullPin.length === 4) {
        setTimeout(() => {
          handleConfirm(fullPin);
        }, 200);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    const key = e.nativeEvent.key;
    // Handle backspace
    if (key === "Backspace" && !pin[index] && index > 0) {
      const newPin = [...pin];
      newPin[index - 1] = "";
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = (fullPin?: string) => {
    const pinCode = fullPin || pin.join("");
    
    if (pinCode.length !== 4) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập đủ 4 số PIN',
        position: 'top',
      });
      return;
    }

    onConfirm(pinCode);
  };

  const handleCancel = () => {
    setPin(["", "", "", ""]);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <ProfileAvatar
              name={profileName}
              avatarUrl={avatarUrl}
              size={80}
            />
            <Text style={styles.profileName}>{profileName}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Nhập mã PIN</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mã PIN 4 số để tiếp tục
          </Text>

          {/* PIN Input */}
          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.pinInput,
                  digit ? styles.pinInputFilled : null,
                ]}
                value={digit}
                onChangeText={(text) => handlePinChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry
                editable={!loading}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonTextCancel}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonConfirm,
                (pin.join("").length !== 4 || loading) && styles.buttonDisabled
              ]}
              onPress={() => handleConfirm()}
              disabled={pin.join("").length !== 4 || loading}
            >
              <Text style={styles.buttonTextConfirm}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f83ff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  pinInput: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    backgroundColor: "#fff",
  },
  pinInputFilled: {
    borderColor: "#2f83ff",
    backgroundColor: "#f0f8ff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonConfirm: {
    backgroundColor: "#2f83ff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextCancel: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextConfirm: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
