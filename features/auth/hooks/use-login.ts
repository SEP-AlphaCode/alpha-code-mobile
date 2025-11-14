// @/features/auth/hooks/use-login.ts

import { googleLogin, login } from '@/features/auth/api/auth-api';
import { LoginRequest, LoginWithProfileResponse } from '@/types/login';
import { getTokenPayload } from '@/utils/tokenUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Thay thế Toast bằng Alert trong React Native
const showToast = (type: 'success' | 'error' | 'info', message: string) => {
  Alert.alert(
    type === 'error' ? '❌ Lỗi' : type === 'success' ? '✅ Thành công' : 'ℹ️ Thông báo',
    message
  );
};

// ================================================================
// 🔐 USE LOGIN
// ================================================================

export const useLogin = (redirectUrl?: string) => {
  return useMutation<LoginWithProfileResponse, Error, LoginRequest>({
    mutationFn: login,

    onSuccess: async (data) => {
      if (!data) {
        showToast('error', 'Phản hồi trống từ server');
        return;
      }

      // ======================================================
      // CASE 1: Đăng nhập thành công — KHÔNG cần tạo profile
      // ======================================================
      if (data.accessToken && data.refreshToken && !data.requiresProfile) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);

        const account = getTokenPayload(data.accessToken);
        if (!account) {
          showToast('error', 'Không thể đọc token');
          return;
        }

        showToast('success', `Chào mừng ${account.fullName}!`);

        // Sửa: Điều hướng đến redirectUrl (nếu có), không phải quay lại /login
        if (redirectUrl) {
          router.replace({ pathname: redirectUrl as any });
          return;
        }

        // 👉 Mặc định tất cả user vào "/parent"
        router.replace({ pathname: '/' });
        return;
      }

      // ======================================================
      // CASE 2: User cần tạo hoặc chọn profile
      // ======================================================
      if (data.requiresProfile) {
        if (redirectUrl) {
          await AsyncStorage.setItem('pendingRedirect', redirectUrl);
        }

        if (data.accountId) {
          await AsyncStorage.setItem('pendingAccountId', data.accountId);
        }

        // 2.1 — Chưa có profile → tạo Parent Profile
        if (!data.profiles || data.profiles.length === 0) {
          showToast('info', 'Vui lòng tạo hồ sơ để tiếp tục');
          router.replace({ pathname: '/' });
          return;
        }

        // 2.2 — Có profile → chuyển sang chọn profile
        await AsyncStorage.setItem('availableProfiles', JSON.stringify(data.profiles));
        router.replace({ pathname: '/' });
        return;
      }

      // ======================================================
      // CASE Không hợp lệ
      // ======================================================
      showToast('error', 'Phản hồi API không hợp lệ');
    },

    onError: (error) => {
      console.error('Login error:', error);
      showToast('error', 'Đăng nhập thất bại, vui lòng thử lại!');
    }
  });
};

// ================================================================
// 🔐 USE GOOGLE LOGIN (nếu bạn cần)
// ================================================================

export const useGoogleLogin = (redirectUrl?: string) => {
  return useMutation<LoginWithProfileResponse, Error, string>({
    mutationFn: googleLogin,

    onSuccess: async (data) => {
      if (!data) {
        showToast('error', 'Phản hồi trống từ server');
        return;
      }

      // KHÔNG cần profile
      if (data.accessToken && data.refreshToken && !data.requiresProfile) {
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);

        const account = getTokenPayload(data.accessToken);
        if (!account) {
          showToast('error', 'Không đọc được token');
          return;
        }

        showToast('success', `Chào mừng ${account.fullName}!`);

        // Sửa: Điều hướng đến redirectUrl (nếu có), không phải quay lại /login
        if (redirectUrl) {
          router.replace({ pathname: redirectUrl as any });
          return;
        }

        router.replace({ pathname: '/' });
        return;
      }

      // Cần tạo/chọn profile
      if (data.requiresProfile) {
        if (data.accountId) {
          await AsyncStorage.setItem('pendingAccountId', data.accountId);
        }

        if (!data.profiles || data.profiles.length === 0) {
          router.replace({ pathname: '/' });
          return;
        }

        await AsyncStorage.setItem('availableProfiles', JSON.stringify(data.profiles));
        router.replace({ pathname: '/' });
        return;
      }

      showToast('error', 'Phản hồi API không hợp lệ');
    },

    onError: () => {
      showToast('error', 'Đăng nhập Google thất bại!');
    }
  });
};