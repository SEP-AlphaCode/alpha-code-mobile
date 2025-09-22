import { useState } from "react";
import { loginApi } from "../api/auth";
import { LoginRequest, LoginResponse } from "../types/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest): Promise<LoginResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginApi(data);
      // TODO: lưu token vào secure storage / AsyncStorage
      return res;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
