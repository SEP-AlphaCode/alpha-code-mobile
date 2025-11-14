// @/features/auth/hooks/use-login.ts

import { googleLogin, login } from "@/features/auth/api/auth-api";
import { LoginRequest, LoginWithProfileResponse } from "@/types/login";
import { getTokenPayload } from "@/utils/tokenUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

// 1. IMPORT TỪ AUTH CONTEXT VÀ TYPES
import { useAuthContext } from "@/components/AuthContext"; // <-- Sửa đường dẫn nếu cần
import { LoginResponse } from "@/features/auth/types/auth"; // <-- Import type mà AuthContext cần

// Thay thế Toast bằng Alert trong React Native
const showToast = (type: "success" | "error" | "info", message: string) => {
  Alert.alert(
    type === "error" ? "❌ Lỗi" : type === "success" ? "✅ Thành công" : "ℹ️ Thông báo",
    message
  );
};

// ================================================================
// 🔐 USE LOGIN
// ================================================================

export const useLogin = (redirectUrl?: string) => {
  // 2. LẤY HÀM LOGIN TỪ AUTH CONTEXT
  const { login: setAuthState } = useAuthContext();

  return useMutation<LoginWithProfileResponse, Error, LoginRequest>({
    mutationFn: login,

    onSuccess: async (data) => {
      if (!data) {
        showToast("error", "Phản hồi trống từ server");
        return;
      }

      // ======================================================
      // CASE 1: Đăng nhập thành công — KHÔNG cần tạo profile
      // ======================================================
      if (data.accessToken && data.refreshToken && !data.requiresProfile) {
        
        // 3. [ĐÂY LÀ ĐIỂM SỬA LỖI]
        // Gọi AuthContext với object có kiểu chính xác
        await setAuthState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        } as LoginResponse); // Ép kiểu 'as LoginResponse' để đảm bảo khớp type

        // AuthContext đã tự động lưu token,
        // giờ chỉ cần hiển thị thông báo và điều hướng

        const account = getTokenPayload(data.accessToken);
        if (!account) {
          showToast("error", "Không thể đọc token");
          return;
        }

        showToast("success", `Chào mừng ${account.fullName}!`);

        if (redirectUrl) {
          router.replace({ pathname: redirectUrl as any });
          return;
        }

        router.replace({ pathname: "/" });
        return;
      }

      // ======================================================
      // CASE 2: User cần tạo hoặc chọn profile
      // (Logic này giữ nguyên vì user chưa đăng nhập hoàn toàn)
      // ======================================================
      if (data.requiresProfile) {
        if (redirectUrl) {
          await AsyncStorage.setItem("pendingRedirect", redirectUrl);
        }

        if (data.accountId) {
          await AsyncStorage.setItem("pendingAccountId", data.accountId);
        }

        if (!data.profiles || data.profiles.length === 0) {
          showToast("info", "Vui lòng tạo hồ sơ để tiếp tục");
          router.replace({ pathname: "/" }); // Hoặc trang tạo profile
          return;
        }

        await AsyncStorage.setItem(
          "availableProfiles",
          JSON.stringify(data.profiles)
        );
        router.replace({ pathname: "/" }); // Hoặc trang chọn profile
        return;
      }

      // ======================================================
      // CASE Không hợp lệ
      // ======================================================
      showToast("error", "Phản hồi API không hợp lệ");
    },

    onError: (error) => {
      console.error("Login error:", error);
      showToast("error", "Đăng nhập thất bại, vui lòng thử lại!");
    },
  });
};

// ================================================================
// 🔐 USE GOOGLE LOGIN (Sửa tương tự)
// ================================================================

export const useGoogleLogin = (redirectUrl?: string) => {
  const { login: setAuthState } = useAuthContext();

  return useMutation<LoginWithProfileResponse, Error, string>({
    mutationFn: googleLogin,

    onSuccess: async (data) => {
      if (!data) {
        showToast("error", "Phản hồi trống từ server");
        return;
      }

      // KHÔNG cần profile
      if (data.accessToken && data.refreshToken && !data.requiresProfile) {
        
        // [SỬA LỖI]
        await setAuthState({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        } as LoginResponse);

        const account = getTokenPayload(data.accessToken);
        if (!account) {
          showToast("error", "Không đọc được token");
          return;
        }

        showToast("success", `Chào mừng ${account.fullName}!`);

        if (redirectUrl) {
          router.replace({ pathname: redirectUrl as any });
          return;
        }

        router.replace({ pathname: "/" });
        return;
      }

      // Cần tạo/chọn profile (Logic giữ nguyên)
      if (data.requiresProfile) {
        if (data.accountId) {
          await AsyncStorage.setItem("pendingAccountId", data.accountId);
        }

        if (!data.profiles || data.profiles.length === 0) {
          router.replace({ pathname: "/" }); // Tới trang tạo profile
          return;
        }

        await AsyncStorage.setItem(
          "availableProfiles",
          JSON.stringify(data.profiles)
        );
        router.replace({ pathname: "/" }); // Tới trang chọn profile
        return;
      }

      showToast("error", "Phản hồi API không hợp lệ");
    },

    onError: () => {
      showToast("error", "Đăng nhập Google thất bại!");
    },
  });
};