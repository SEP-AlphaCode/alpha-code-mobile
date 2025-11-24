import { usersHttp } from "@/utils/http";

// Request type theo Swagger spec
export interface CreateProfileRequest {
  accountId: string;        // UUID
  avatarFile?: File;        // Binary file (optional)
  isKid: boolean;           // true = Children, false = Parent
  name: string;             // Profile name
  passCode: string;         // PIN code (integer)
  status: number;           // Status (integer)
}

// Response type
export interface CreateProfileResponse {
  id: string;
  name: string;
  passcode: string;
  accountId: string;
  accountFullName: string;
  avartarUrl: string;
  isKid: boolean;
  lastActiveAt: string;
  createDate: string;
  lastUpdated: string;
  status: number;
  statusText: string;
}

// Tạo profile mới theo Swagger spec
export const createProfileSwagger = async (data: CreateProfileRequest): Promise<CreateProfileResponse> => {
  try {
    // Luôn dùng FormData để gửi dữ liệu (theo yêu cầu backend)
    const formData = new FormData();
    formData.append('accountId', data.accountId);
    formData.append('name', data.name);
    formData.append('passCode', data.passCode.toString());
    formData.append('isKid', data.isKid.toString());
    formData.append('status', data.status.toString());
    if (data.avatarFile) {
      formData.append('avatarFile', data.avatarFile);
    }

    const response = await usersHttp.post<CreateProfileResponse>('/profiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};
