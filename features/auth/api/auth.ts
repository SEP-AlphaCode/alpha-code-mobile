import { usersHttp } from "@/utils/http";
import { LoginRequest, LoginWithProfileResponse, SwitchProfileResponse } from "../types/auth";

export async function loginApi(data: LoginRequest): Promise<LoginWithProfileResponse> {
  const res = await usersHttp.post<LoginWithProfileResponse>("/auth/login", data);
  let responseData = res.data;
  
  // Unwrap response if needed
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    responseData = (responseData as any).data;
  }
  if (responseData && typeof responseData === 'object' && 'result' in responseData) {
    responseData = (responseData as any).result;
  }
  
  return responseData;
}

// Switch profile - Chuyển đổi profile và nhận token mới
export async function switchProfile(
  profileId: string,
  accountId: string,
  passCode: string
): Promise<SwitchProfileResponse> {
  try {
    // Backend requires: accountId, passCode, profileId (all required)
    const payload = {
      accountId: accountId,
      passCode: passCode || "0000", // Default passcode if empty
      profileId: profileId
    };
    
    const response = await usersHttp.post('/auth/switch', payload);
    let responseData = response.data;
    
    // Unwrap response
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    if (responseData && responseData.result) {
      responseData = responseData.result;
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Switch profile API error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

