import { useAuthContext } from "@/components/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, currentProfile, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Nếu chưa đăng nhập -> login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Nếu đã đăng nhập nhưng chưa có profile -> select profile
  if (!currentProfile) {
    return <Redirect href="/(profile)/select-profile" />;
  }

  // Nếu đã có cả user và profile -> vào app
  return <Redirect href="/(app)" />;
}
