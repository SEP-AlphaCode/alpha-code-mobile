export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
export interface LoginWithProfileResponse {
  requiresProfile: boolean; // true nếu là User role
  profiles?: Profile[]; // Danh sách profiles (nếu có)
  accessToken?: string; // Chỉ có nếu là Admin/Staff
  refreshToken?: string; // Chỉ có nếu là Admin/Staff
  accountId?: string; // camelCase version (backend mới)
  key?: string; // camelCase version (backend mới)
}

// Profile data từ backend
export interface Profile {
  id: string;
  name: string;
  passcode: string;
  accountId: string;
  accountFullName: string;
  avartarUrl: string;
  isKid: boolean; // true = Children, false = Parent
  lastActiveAt: string;
  createDate: string;
  lastUpdated: string;
  status: number;
  statusText: string;
}

// Response khi switch profile
export interface SwitchProfileResponse {
  accessToken: string;
  refreshToken: string;
  profile?: Profile; // Optional - backend may not return this
  key: string;
  accountId?: string | null;
  profiles?: Profile[] | null;
  requiresProfile?: boolean | null;
}
