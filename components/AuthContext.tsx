"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { LoginResponse, Profile } from "../features/auth/types/auth";

interface AuthContextType {
  user: LoginResponse | null;
  currentProfile: Profile | null;
  availableProfiles: Profile[] | null;
  login: (data: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentProfile: (profile: Profile | null) => Promise<void>;
  setAvailableProfiles: (profiles: Profile[] | null) => Promise<void>;
  loading: boolean; // loading khi check token từ storage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);
  const [availableProfiles, setAvailableProfilesState] = useState<Profile[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load token và profile từ storage khi app khởi động
    const loadUser = async () => {
      try {
        const [accessToken, refreshToken, profileStr, profilesStr] = await Promise.all([
          AsyncStorage.getItem("accessToken"),
          AsyncStorage.getItem("refreshToken"),
          AsyncStorage.getItem("currentProfile"),
          AsyncStorage.getItem("availableProfiles"),
        ]);

        if (accessToken && refreshToken) {
          setUser({ accessToken, refreshToken });
        }

        if (profileStr) {
          setCurrentProfileState(JSON.parse(profileStr));
        }

        if (profilesStr) {
          setAvailableProfilesState(JSON.parse(profilesStr));
        }
      } catch (err) {
        console.error("Failed to load user from storage:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 6. CẬP NHẬT HÀM LOGIN
  const login = async (data: LoginResponse) => {
    setUser(data);
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);
  };

  // 7. CẬP NHẬT HÀM LOGOUT
  const logout = async () => {
    setUser(null);
    setCurrentProfileState(null);
    setAvailableProfilesState(null);
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "currentProfile",
      "availableProfiles",
      "pendingAccountId",
      "pendingKey",
      "key",
    ]);
  };

  const setCurrentProfile = async (profile: Profile | null) => {
    setCurrentProfileState(profile);
    if (profile) {
      await AsyncStorage.setItem("currentProfile", JSON.stringify(profile));
    } else {
      await AsyncStorage.removeItem("currentProfile");
    }
  };

  const setAvailableProfiles = async (profiles: Profile[] | null) => {
    setAvailableProfilesState(profiles);
    if (profiles) {
      await AsyncStorage.setItem("availableProfiles", JSON.stringify(profiles));
    } else {
      await AsyncStorage.removeItem("availableProfiles");
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        currentProfile,
        availableProfiles,
        login, 
        logout, 
        setCurrentProfile,
        setAvailableProfiles,
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}