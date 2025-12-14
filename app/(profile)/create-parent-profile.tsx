import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useSwitchProfile } from "@/features/auth/hooks/useSwitchProfile";
import { useCreateUserProfile } from "@/features/users/hooks/use-profile";
import { decodeJwtToken } from "@/utils/jwt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";

export default function CreateParentProfileScreen() {
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isKid, setIsKid] = useState(false); // false = Parent, true = Children
  const [accountId, setAccountId] = useState("");
  const [accountFullName, setAccountFullName] = useState("");
  const [creating, setCreating] = useState(false);
  const { switchProfile, loading: switchingProfile } = useSwitchProfile();
  const createProfileMutation = useCreateUserProfile({ showToast: false });
  const pinInputRefs = React.useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    loadAccountInfo();
  }, []);

  const loadAccountInfo = async () => {
    try {
      const [storedAccountId, accessToken] = await Promise.all([
        AsyncStorage.getItem("pendingAccountId"),
        AsyncStorage.getItem("accessToken"),
      ]);
      
      let accId = storedAccountId || "";
      let accFullName = "";
      
      // Try to get info from token if available
      if (accessToken && !accId) {
        const tokenPayload = decodeJwtToken(accessToken);
        if (tokenPayload) {
          accId = tokenPayload.id || "";
          accFullName = tokenPayload.fullName || "";
        }
      }
      
      setAccountId(accId);
      setAccountFullName(accFullName);
    } catch (error) {
      console.error("Error loading account info:", error);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập tên profile',
        position: 'top',
      });
      return;
    }

    if (passcode && (passcode.length !== 4 || !/^\d{4}$/.test(passcode))) {
      Toast.show({
        type: 'error',
        text1: 'Mã PIN phải là 4 chữ số',
        position: 'top',
      });
      return;
    }

    if (!accountId) {
      Toast.show({
        type: 'error',
        text1: 'Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.',
        position: 'top',
      });
      return;
    }

    try {
      setCreating(true);

      // Use Swagger API format (accountId, passCode, isKid, status)
      const profileData = {
        accountId: accountId,
        name: name.trim(),
        passcode: passcode || "0000",
        isKid: isKid,
        accountFullName: accountFullName,
        avartarUrl: "",
        lastActiveAt: new Date().toISOString(),
        status: 1,
        statusText: "Active"
      };

      console.log('Creating profile with data:', profileData);

      // Create profile using the hook
      const newProfile = await createProfileMutation.mutateAsync(profileData);

      console.log('Profile created:', newProfile);

      // Remove pending data
      await AsyncStorage.removeItem('pendingAccountId');

      Toast.show({
        type: 'success',
        text1: 'Tạo profile thành công!',
        position: 'top',
      });

      // Auto switch to new profile
      if (newProfile && newProfile.id) {
        setTimeout(async () => {
          await switchProfile(newProfile.id, accountId, passcode || "0000");
        }, 500);
      }
    } catch (error: any) {
      console.error("Error creating profile:", error);
      const message = error.response?.data?.message || error.message || "Không thể tạo profile. Vui lòng thử lại.";
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  const isLoading = creating || switchingProfile;

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🎓</Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              Tạo Profile {isKid ? "Trẻ Em" : "Phụ Huynh"}
            </Text>
            <Text style={styles.subtitle}>
              Đây là lần đầu tiên bạn đăng nhập. Vui lòng tạo profile để bắt đầu học lập trình với Alpha Mini!
            </Text>
          </View>

          <View style={styles.form}>
            {/* Avatar Preview */}
            <View style={styles.avatarContainer}>
              <ProfileAvatar
                name={name || "?"}
                size={96}
              />
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên của bạn <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="VD: Ba Minh, Mẹ Na, Bé An..."
                maxLength={50}
                editable={!isLoading}
                autoFocus
              />
              <Text style={styles.hint}>
                Tên này sẽ được hiển thị khi chọn profile
              </Text>
            </View>

            {/* Profile Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại Profile</Text>
              <View style={styles.profileTypeContainer}>
                <TouchableOpacity
                  onPress={() => setIsKid(false)}
                  style={[
                    styles.profileTypeButton,
                    !isKid && styles.profileTypeButtonActive,
                  ]}
                  disabled={isLoading}
                >
                  <Text style={styles.profileTypeEmoji}>👨‍👩‍👧</Text>
                  <Text style={[styles.profileTypeText, !isKid && styles.profileTypeTextActive]}>
                    Phụ huynh
                  </Text>
                  <Text style={styles.profileTypeSubtext}>Parent</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsKid(true)}
                  style={[
                    styles.profileTypeButton,
                    isKid && styles.profileTypeButtonActive,
                  ]}
                  disabled={isLoading}
                >
                  <Text style={styles.profileTypeEmoji}>👶</Text>
                  <Text style={[styles.profileTypeText, isKid && styles.profileTypeTextActive]}>
                    Trẻ em
                  </Text>
                  <Text style={styles.profileTypeSubtext}>Children</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Passcode Input with OTP-style */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã PIN</Text>
              <View style={styles.pinContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      pinInputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.pinInput,
                      passcode[index] && styles.pinInputFilled,
                    ]}
                    value={passcode[index] || ""}
                    onChangeText={(text) => {
                      // Xử lý xóa và nhập
                      const arr = passcode.split("");
                      while (arr.length < 4) arr.push("");
                      
                      if (text === "") {
                        // Đang xóa
                        arr[index] = "";
                      } else if (/^\d$/.test(text)) {
                        // Đang nhập số
                        arr[index] = text;
                        // Auto jump to next
                        if (index < 3) {
                          setTimeout(() => pinInputRefs.current[index + 1]?.focus(), 10);
                        }
                      }
                      
                      setPasscode(arr.join(""));
                    }}
                    onKeyPress={(e) => {
                      if (e.nativeEvent.key === "Backspace") {
                        const arr = passcode.split("");
                        while (arr.length < 4) arr.push("");
                        
                        if (!arr[index] && index > 0) {
                          // Ô hiện tại trống, xóa ô trước và focus về đó
                          arr[index - 1] = "";
                          setPasscode(arr.join(""));
                          setTimeout(() => pinInputRefs.current[index - 1]?.focus(), 10);
                        }
                        // Nếu ô hiện tại có giá trị, onChangeText sẽ xử lý
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    editable={!isLoading}
                    selectTextOnFocus
                  />
                ))}
              </View>
              <Text style={styles.hint}>
                Mã PIN 4 số để bảo vệ profile của bạn
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                (!name.trim() || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!name.trim() || isLoading}
            >
              <Text style={styles.buttonTextPrimary}>
                {creating ? "Đang tạo profile..." : "🚀 Tạo Profile & Bắt đầu học"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleBackToLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonTextSecondary}>← Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#2f83ff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  profileTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  profileTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  profileTypeButtonActive: {
    borderColor: "#2f83ff",
    backgroundColor: "#f0f8ff",
  },
  profileTypeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  profileTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  profileTypeTextActive: {
    color: "#2f83ff",
  },
  profileTypeSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
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
  footer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: "#333",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#666",
    fontSize: 14,
  },
});
