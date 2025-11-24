import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { loginApi } from "../api/auth";
import { LoginRequest, LoginWithProfileResponse } from "../types/auth";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest): Promise<LoginWithProfileResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await loginApi(data);
      
      // Check if this is a profile-based login (User role)
      if (res.requiresProfile) {
        // User role - need to handle profile selection
        if (!res.profiles || res.profiles.length === 0) {
          // No profiles yet - redirect to create parent profile
          // Store accountId for creating profile
          if (res.accountId) {
            await AsyncStorage.setItem('pendingAccountId', res.accountId);
          }
          if (res.key) {
            await AsyncStorage.setItem('pendingKey', res.key);
          }
          router.replace('/(profile)/create-parent-profile');
        } else {
          // Has profiles - redirect to profile selection
          await AsyncStorage.setItem('availableProfiles', JSON.stringify(res.profiles));
          if (res.accountId) {
            await AsyncStorage.setItem('pendingAccountId', res.accountId);
          }
          if (res.key) {
            await AsyncStorage.setItem('pendingKey', res.key);
          }
          router.replace('/(profile)/select-profile');
        }
      } else {
        // Admin/Staff - has token directly
        if (res.accessToken && res.refreshToken) {
          await AsyncStorage.setItem('accessToken', res.accessToken);
          await AsyncStorage.setItem('refreshToken', res.refreshToken);
          if (res.key) {
            await AsyncStorage.setItem('key', res.key);
          }
          
          // Decode token to get role and redirect accordingly
          // For now, redirect to main app
          router.replace('/(app)');
        }
      }
      
      return res;
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
