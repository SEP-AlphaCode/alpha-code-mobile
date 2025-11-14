import { refreshToken as callRefreshToken } from '@/features/auth/api/auth-api';
import { JWTPayload } from "@/types/jwt-payload";
import { jwtDecode } from 'jwt-decode';


// Interface cho JWT payload


// JWT utility functions for token validation
export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode JWT token using jwt-decode library
    const payload = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;

    if (!payload.exp) {
      // If no expiration time, consider token as expired for safety
      return true;
    }

    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Consider invalid tokens as expired
  }
};

export const getTokenPayload = (token: string): JWTPayload | null => {
  if (!token || token.trim() === '') {
    return null;
  }

  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
};

// Utility functions để lấy thông tin từ token
export const getUserInfoFromToken = (token: string): Partial<JWTPayload> | null => {
  const payload = getTokenPayload(token);
  if (!payload) return null;

  return {
    id: payload.id,
    fullName: payload.fullName,
    username: payload.username,
    email: payload.email,
    roleId: payload.roleId,
    roleName: payload.roleName
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

export const isValidToken = async (token: string): Promise<boolean> => {
  console.log('isValidToken: Starting validation...');
  
  if (!token || token.trim() === '') {
    console.log('isValidToken: No token provided');
    return false;
  }

  try {
    // Basic JWT format check
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('isValidToken: Invalid JWT format');
      return false;
    }

    // Try to decode the token to validate structure
    jwtDecode<JWTPayload>(token);
    console.log('isValidToken: Token decoded successfully');

    const isExpired = isTokenExpired(token);
    console.log('isValidToken: Token expired?', isExpired);

    if (isExpired) {
      // Check if refresh token exists
      const refreshTokenValue = sessionStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        console.log('isValidToken: No refresh token available');
        return false; // No refresh token available
      }

      console.log('isValidToken: Attempting token refresh...');
      try {
        const res = await Promise.race([
          callRefreshToken(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Refresh token timeout')), 5000)
          )
        ]);

        if (res?.accessToken && res?.refreshToken) {
          console.log('isValidToken: Token refreshed successfully');
          sessionStorage.setItem('accessToken', res.accessToken);
          sessionStorage.setItem('refreshToken', res.refreshToken);
          return true; // refresh thành công
        }
        console.log('isValidToken: Token refresh failed - no tokens in response');
        return false; // refresh thất bại
      } catch (refreshError) {
        console.error('isValidToken: Token refresh failed:', refreshError);
        return false; // refresh thất bại
      }
    }
    console.log('isValidToken: Token is valid (not expired)');
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const clearAuthData = (): void => {
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};
