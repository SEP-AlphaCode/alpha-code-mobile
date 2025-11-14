import { AuthProvider, useAuthContext } from "@/components/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";

// 1. Import Redux Provider và store của bạn
import { store } from "@/store/store";
import { Provider as ReduxProvider } from "react-redux";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { loading, user } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 2. Bọc mọi thứ bằng ReduxProvider */}
      <ReduxProvider store={store}>
        <PaperProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </PaperProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
}