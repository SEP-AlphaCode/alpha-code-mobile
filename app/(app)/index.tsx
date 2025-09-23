import { useAuthContext } from "@/components/AuthContext";
import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>🏠 Playground</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
