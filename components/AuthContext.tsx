"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
// Đảm bảo đường dẫn này đúng
import { LoginResponse } from "../features/auth/types/auth";
import { JWTPayload } from "../types/jwt-payload";

// 1. IMPORT CÁC HÀM TỪ TOKEN UTILS
// Đảm bảo file tokenUtils.ts đã "export" JWTPayload
import {
  clearAuthData,
  getUserInfoFromToken,
  isValidToken, // <-- Quan trọng: Import kiểu JWTPayload
} from "../utils/tokenUtils"; // <-- Sửa đường dẫn nếu cần

interface AuthContextType {
  // 2. ĐỔI KIỂU CỦA USER: Giờ đây state user sẽ chứa payload đã giải mã
  user: Partial<JWTPayload> | null;
  login: (data: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 3. ĐỔI KIỂU STATE CỦA USER
  const [user, setUser] = useState<Partial<JWTPayload> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Logic load user khi khởi động app
    const loadUser = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Dùng isValidToken để kiểm tra (tự động refresh nếu cần)
        const valid = await isValidToken(accessToken);

        if (valid) {
          // 4. LẤY LẠI TOKEN (vì isValidToken có thể đã refresh nó)
          const currentAccessToken =
            (await AsyncStorage.getItem("accessToken")) ?? accessToken;

          // 5. GIẢI MÃ TOKEN ĐỂ LẤY USER INFO
          const userInfo = getUserInfoFromToken(currentAccessToken);
          setUser(userInfo); // <-- Set state là thông tin user
        } else {
          // Token không hợp lệ hoặc không thể refresh
          setUser(null);
          await clearAuthData();
        }
      } catch (err) {
        console.error("Failed to load user from storage:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 6. CẬP NHẬT HÀM LOGIN
  const login = async (data: LoginResponse) => {
    // data chỉ chứa token
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);

    // Giải mã accessToken để set user state
    const userInfo = getUserInfoFromToken(data.accessToken);
    setUser(userInfo); // <-- Set state là thông tin user
  };

  // 7. CẬP NHẬT HÀM LOGOUT
  const logout = async () => {
    setUser(null);
    await clearAuthData(); // Xoá accessToken và refreshToken
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}