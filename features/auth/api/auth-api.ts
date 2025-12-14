// @/features/auth/api/auth-api.ts

import { apiUsersUrl } from '@/constants/constants';
import { LoginRequest, LoginWithProfileResponse } from '@/types/login';
import { usersHttp } from '@/utils/http';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export const login = async (data: LoginRequest): Promise<LoginWithProfileResponse> => {
  try {
    const response = await usersHttp.post('/auth/login', data);
    let responseData = response.data;
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    if (responseData && responseData.result) {
      responseData = responseData.result;
    }
    if (responseData && responseData.success && responseData.payload) {
      responseData = responseData.payload;
    }
    if (!responseData || typeof responseData !== 'object') {
      throw new Error('Invalid response format from server');
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

// ‼️ SỬA QUAN TRỌNG: Phá vỡ vòng lặp
export const refreshToken = async (): Promise<{ accessToken: string; refreshToken: string, key: string }> => {
  try {
    const refreshTokenValue = await AsyncStorage.getItem('refreshToken'); 
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${apiUsersUrl}/auth/refresh-new-token`,
      refreshTokenValue,
      { headers: { 'Content-Type': 'text/plain' } }
    );

    let responseData = response.data;
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    if (responseData && responseData.result) {
      responseData = responseData.result;
    }

    return {
      accessToken: responseData.accessToken || responseData.token,
      refreshToken: responseData.refreshToken,
      key: responseData.key
    };
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('refreshToken'); // ⬅️ Sửa: Dùng AsyncStorage
    await usersHttp.post('/auth/logout', token, {
      headers: { "Content-Type": "text/plain" }
    });
  } catch (error) {
    throw error;
  }
};

export const googleLogin = async (idToken: string): Promise<LoginWithProfileResponse> => {
  try {
    const response = await usersHttp.post('/auth/google-login', idToken, {
      headers: { "Content-Type": "text/plain" }
    });
    const responseData = response.data;
    return {
      ...responseData,
      requiresProfile: responseData.requiresProfile || false,
    };
  } catch (error) {
    throw error;
  }
}

export const registerAccount = async (accountData: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  gender: number;
  // ⬇️ Sửa: Định dạng file của React Native
  avatarFile?: { uri: string; name: string; type: string; };
}): Promise<void> => {
  try {
    const form = new FormData();
    form.append('username', accountData.username);
    form.append('password', accountData.password);
    form.append('email', accountData.email);
    form.append('fullName', accountData.fullName);
    form.append('phone', accountData.phone);
    form.append('gender', String(accountData.gender));
    
    if (accountData.avatarFile) {
      form.append('avatarFile', {
        uri: accountData.avatarFile.uri,
        name: accountData.avatarFile.name,
        type: accountData.avatarFile.type,
      } as any); // 'as any' để tránh lỗi type
    }

    const response = await usersHttp.post('/auth/register', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      const data = error.response.data as unknown;
      const msg = (data as { message?: string; error?: string }).message || (data as { error?: string }).error || error.response.statusText || 'Request failed';
      throw new Error(msg);
    }
    throw error;
  }
};