import { useAuthContext } from "@/components/AuthContext";
import { decodeJwtToken } from "@/utils/jwt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { switchProfile } from "../api/auth";
import { SwitchProfileResponse } from "../types/auth";

export function useSwitchProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: updateAuthContext, setCurrentProfile } = useAuthContext();

  const switchProfileHandler = async (
    profileId: string,
    accountId: string,
    passCode: string
  ): Promise<SwitchProfileResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const data = await switchProfile(profileId, accountId, passCode);

      // Lưu token mới vào AsyncStorage
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      if (data.key) {
        await AsyncStorage.setItem('key', data.key);
      }

      // Lưu current profile vào AsyncStorage
      if (data.profile) {
        await AsyncStorage.setItem('currentProfile', JSON.stringify(data.profile));
      }

      // CẬP NHẬT AuthContext để UI phản ánh ngay lập tức
      await updateAuthContext({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      
      if (data.profile) {
        await setCurrentProfile(data.profile);
      }

      // Xóa dữ liệu tạm thời
      await AsyncStorage.removeItem('availableProfiles');
      await AsyncStorage.removeItem('pendingAccountId');
      await AsyncStorage.removeItem('pendingKey');

      // Decode JWT token to get user info
      const tokenPayload = decodeJwtToken(data.accessToken);
      const fullName = tokenPayload?.fullName || 'Người dùng';
      const profileName = tokenPayload?.profileName || data.profile?.name || '';
      // Show success message with account full name and profile name
      Toast.show({
        type: 'success',
        text1: profileName ? `Chào ${fullName}! Đăng nhập với profile: ${profileName} 👋` : `Chào ${fullName}!`,
        position: 'top',
        visibilityTime: 3000,
      });

      // Determine redirect based on profile type
      // For now, redirect to main app
      // TODO: Decode token to check role and redirect accordingly
      router.replace('/(app)');

      return data;
    } catch (err: any) {
      console.error('Switch profile error:', err);
      
      let message = 'Không thể chuyển profile. Vui lòng thử lại.';
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        visibilityTime: 4000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    switchProfile: switchProfileHandler,
    loading,
    error
  };
}
