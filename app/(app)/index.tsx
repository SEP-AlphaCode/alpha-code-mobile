import { useAuthContext } from "@/components/AuthContext";
import { router } from "expo-router";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
// 1. Import RobotSelector (sửa đường dẫn nếu cần)
import { RobotSelector } from "@/components/RobotSelector";

export default function HomeScreen() {
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    // 2. Dùng SafeAreaView để tránh status bar
    <SafeAreaView style={styles.container}>
      {/* 3. Đặt RobotSelector ở trên cùng */}
      <RobotSelector />

      {/* 4. Đặt nội dung cũ vào một View riêng để căn giữa */}
      <View style={styles.content}>
        <Text>🏠 Playground</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Thêm màu nền nếu cần
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});