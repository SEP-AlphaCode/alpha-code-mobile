export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Response khi login với User role (cần chọn profile)
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
  profile: Profile;
  key: string;
}
