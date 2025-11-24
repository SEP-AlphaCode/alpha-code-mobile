// JWT Token payload interface
export interface JwtPayload {
  roleId: string;
  id: string;
  username: string;
  roleName: string;
  email: string;
  fullName: string;
  profileId?: string;
  profileName?: string;
  iat: number;
  exp: number;
}

// Decode JWT token (Base64)
export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}
