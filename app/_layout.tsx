import { AuthProvider, useAuthContext } from "@/components/AuthContext";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
