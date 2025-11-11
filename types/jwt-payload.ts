export interface JWTPayload {
  id: string;
  fullName: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  // Thông tin profile (nếu login qua profile)
  profileId?: string;
  profileName?: string;
  exp?: number;
  iat?: number;
}