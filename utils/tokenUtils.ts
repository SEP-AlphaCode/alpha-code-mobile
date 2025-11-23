import { refreshToken as callRefreshToken } from "@/features/auth/api/auth-api";
import { JWTPayload } from "@/types/jwt-payload";
import { jwtDecode } from "jwt-decode";
// ĐÃ THÊM: Import AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

// Interface cho JWT payload
// (Giữ nguyên)
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    if (!payload.exp) return true;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// (Giữ nguyên các hàm: getTokenPayload, getUserInfoFromToken, getUserRoleFromToken, getUserIdFromToken)
// ... (các hàm này không cần thay đổi) ...

export const getTokenPayload = (token: string): JWTPayload | null => {
  if (!token || token.trim() === "") {
    return null;
  }
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error("Error decoding token payload:", error);
    return null;
  }
};

export const getUserInfoFromToken = (
  token: string
): Partial<JWTPayload> | null => {
  const payload = getTokenPayload(token);
  if (!payload) return null;
  return {
    id: payload.id,
    fullName: payload.fullName,
    username: payload.username,
    email: payload.email,
    roleId: payload.roleId,
    roleName: payload.roleName,
  };
};

export const getUserRoleFromToken = (token: string): string | null => {
  const payload = getTokenPayload(token);
  return payload?.roleName || null;
};

export const getUserIdFromToken = (token: string): string | null => {
  const payload = getTokenPayload(token);
  return payload?.id || null;
};

// ĐÃ THAY ĐỔI: Sử dụng AsyncStorage
export const isValidToken = async (token: string): Promise<boolean> => {
  console.log("isValidToken: Starting validation...");
  if (!token || token.trim() === "") {
    console.log("isValidToken: No token provided");
    return false;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("isValidToken: Invalid JWT format");
      return false;
    }

    jwtDecode<JWTPayload>(token);
    console.log("isValidToken: Token decoded successfully");

    const isExpired = isTokenExpired(token);
    console.log("isValidToken: Token expired?", isExpired);

    if (isExpired) {
      // ĐÃ THAY ĐỔI: Sử dụng await AsyncStorage.getItem
      const refreshTokenValue = await AsyncStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        console.log("isValidToken: No refresh token available");
        return false;
      }

      console.log("isValidToken: Attempting token refresh...");
      try {
        const res = await Promise.race([
          callRefreshToken(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Refresh token timeout")), 5000)
          ),
        ]);

        if (res?.accessToken && res?.refreshToken) {
          console.log("isValidToken: Token refreshed successfully");
          // ĐÃ THAY ĐỔI: Sử dụng await AsyncStorage.setItem
          await AsyncStorage.setItem("accessToken", res.accessToken);
          await AsyncStorage.setItem("refreshToken", res.refreshToken);
          return true;
        }
        console.log("isValidToken: Token refresh failed - no tokens in response");
        return false;
      } catch (refreshError) {
        console.error("isValidToken: Token refresh failed:", refreshError);
        return false;
      }
    }
    console.log("isValidToken: Token is valid (not expired)");
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

// ĐÃ THAY ĐỔI: Sử dụng AsyncStorage và trả về Promise
export const clearAuthData = async (): Promise<void> => {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
  // Bạn cũng nên xoá key 'auth' mà AuthContext đang dùng
  await AsyncStorage.removeItem("auth");
};