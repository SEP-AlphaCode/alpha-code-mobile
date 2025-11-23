import { useAuthContext } from "@/components/AuthContext"; // Import hook
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MeScreen() {
  // 1. 'user' bây giờ là Partial<JWTPayload>
  const { user, logout, loading } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  // 2. Xử lý loading (khi AuthContext đang check token)
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 3. Xử lý chưa đăng nhập (loading=false, user=null)
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ marginBottom: 10 }}>Bạn chưa đăng nhập.</Text>
        <Button
          title="Tới trang Đăng nhập"
          onPress={() => router.replace("/(auth)/login")}
        />
      </View>
    );
  }

  // 4. Hiển thị thông tin user (đã đăng nhập)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>👤 Thông tin cá nhân</Text>

        

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Họ tên:</Text>
            {/* 'user' giờ đã là payload, nên user.fullName là ĐÚNG */}
            <Text style={styles.value}>{user.fullName ?? "Chưa cập nhật"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email ?? "Chưa cập nhật"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Vai trò:</Text>
            {/* Dùng 'roleName' như trong JWTPayload của bạn */}
            <Text style={styles.value}>{user.roleName ?? "User"}</Text>
          </View>
        </View>

        <Button title="Đăng xuất" color="red" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
});