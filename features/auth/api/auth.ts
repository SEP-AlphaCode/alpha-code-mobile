import { http } from "@/utils/http";
import { LoginRequest, LoginResponse } from "../types/auth";

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const res = await http.post<LoginResponse>("/auth/login", data);
  return res.data;
}
