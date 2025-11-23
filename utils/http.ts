// import { refreshToken as callRefreshToken } from '@/api/auth/auth-api'
// @/utils/http.ts

import { apiActivitiesUrl, apiCoursesUrl, apiPaymentsUrl, apiPythonUrl, apiRobotsUrl, apiUsersUrl } from '@/constants/constants'
import { refreshToken as callRefreshToken } from '@/features/auth/api/auth-api'
import AsyncStorage from '@react-native-async-storage/async-storage'; // ⬅️ Sửa: Dùng AsyncStorage
import axios, { AxiosInstance } from 'axios'
import { router } from 'expo-router'; // ⬅️ Sửa: Dùng expo-router để điều hướng

class Http {
  instance: AxiosInstance

  constructor(apiUrl: string) {
    this.instance = axios.create({
      baseURL: apiUrl,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor - Thêm token (phải là async)
    this.instance.interceptors.request.use(async (config) => { // ⬅️ Sửa: Thêm async
      const token = await AsyncStorage.getItem('accessToken') // ⬅️ Sửa: Dùng AsyncStorage
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor - Tự động refresh token (phải là async)
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => { // ⬅️ Sửa: Thêm async
        const originalRequest = error.config;

        // Xử lý 429 (Too Many Requests)
        if (error.response?.status === 429 && !originalRequest._rateLimitRetry) {
          // ... logic 429 của bạn vẫn ổn ...
          originalRequest._rateLimitRetry = true;
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          await new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
          return this.instance(originalRequest);
        }

        // Xử lý 401 (Unauthorized) - Refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken'); // ⬅️ Sửa: Dùng AsyncStorage
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken && // ⬅️ Sửa: Dùng biến đã await
          !originalRequest.url?.includes('refresh-new-token')
        ) {
          originalRequest._retry = true;

          try {
            const res = await callRefreshToken(); // ⬅️ Sửa: Phải await
            await AsyncStorage.setItem('accessToken', res.accessToken); // ⬅️ Sửa: Dùng AsyncStorage
            await AsyncStorage.setItem('refreshToken', res.refreshToken); // ⬅️ Sửa: Dùng AsyncStorage
            await AsyncStorage.setItem('key', res.key); // ⬅️ Sửa: Dùng AsyncStorage

            originalRequest.headers.Authorization = `Bearer ${res.accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            await AsyncStorage.clear(); // ⬅️ Sửa: Dùng AsyncStorage

            // ⬅️ Sửa: Dùng router để điều hướng
            if (router.canGoBack()) { // Chỉ điều hướng nếu đã ở trong app
              router.replace('/login');
            }

            return Promise.reject(refreshError);
          }
        }

        // Xử lý 401 - Không có refresh token
        if (error.response?.status === 401 && !refreshToken) {
          await AsyncStorage.clear(); // ⬅️ Sửa: Dùng AsyncStorage
          if (router.canGoBack()) { // ⬅️ Sửa: Dùng router
            router.replace('/login');
          }
        }

        return Promise.reject(error);
      }
    )
  }
}

export const pythonHttp = new Http(apiPythonUrl).instance
export const coursesHttp = new Http(apiCoursesUrl).instance
export const usersHttp = new Http(apiUsersUrl).instance
export const activitiesHttp = new Http(apiActivitiesUrl).instance
export const robotsHttp = new Http(apiRobotsUrl).instance
export const paymentsHttp = new Http(apiPaymentsUrl).instance