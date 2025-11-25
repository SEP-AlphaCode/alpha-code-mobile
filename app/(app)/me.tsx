import { useAuthContext } from "@/components/AuthContext";
import { decodeJwtToken, JwtPayload } from "@/utils/jwt";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function MeScreen() {
  const { user, currentProfile, logout, loading } = useAuthContext();
  const [userInfo, setUserInfo] = useState<JwtPayload | null>(null);

  useEffect(() => {
    if (user?.accessToken) {
      const decoded = decodeJwtToken(user.accessToken);
      setUserInfo(decoded);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  // Xử lý loading
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Xử lý chưa đăng nhập
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
          <Text style={styles.emptySubtitle}>
            Đăng nhập để truy cập thông tin cá nhân
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.primaryButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getInitial = () => {
    const name = userInfo?.fullName || currentProfile?.name || "User";
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "Parent": return "#8b5cf6";
      case "Teacher": return "#06b6d4";
      case "Admin": return "#ef4444";
      default: return "#6366f1";
    }
  };

  // Hiển thị thông tin user
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header với gradient effect */}
        <View style={styles.profileHeader}>
          <View style={styles.headerGradient}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitial()}</Text>
              </View>
              <View style={[styles.avatarBadge, { backgroundColor: getRoleBadgeColor(userInfo?.roleName) }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            </View>
            
            <Text style={styles.userName}>
              {userInfo?.fullName || currentProfile?.name || "Người dùng"}
            </Text>
            
            <View style={[styles.roleTag, { backgroundColor: `${getRoleBadgeColor(userInfo?.roleName)}20` }]}>
              <Text style={[styles.roleTagText, { color: getRoleBadgeColor(userInfo?.roleName) }]}>
                {userInfo?.roleName || "User"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#6366f1" />
              <Text style={styles.statLabel}>Ngày tham gia</Text>
              <Text style={styles.statValue}>
                {currentProfile?.createDate 
                  ? new Date(currentProfile.createDate).toLocaleDateString('vi-VN')
                  : "N/A"}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#10b981" />
              <Text style={styles.statLabel}>Hoạt động</Text>
              <Text style={styles.statValue}>
                {currentProfile?.lastActiveAt 
                  ? new Date(currentProfile.lastActiveAt).toLocaleDateString('vi-VN')
                  : "N/A"}
              </Text>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            </View>
            
            <View style={styles.card}>
              <InfoItem 
                icon="mail-outline" 
                label="Email" 
                value={userInfo?.email || "Chưa cập nhật"} 
              />
              <InfoItem 
                icon="person-circle-outline" 
                label="Tên đăng nhập" 
                value={userInfo?.username || "Chưa cập nhật"} 
              />
            </View>
          </View>

          {/* Profile Information */}
          {currentProfile && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="albums-outline" size={20} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Thông tin profile</Text>
              </View>
              
              <View style={styles.card}>
                <InfoItem 
                  icon="bookmark-outline" 
                  label="Tên profile" 
                  value={currentProfile.name} 
                />
                <InfoItem 
                  icon="people-outline" 
                  label="Loại tài khoản" 
                  value={currentProfile.isKid ? "Trẻ em" : "Phụ huynh"}
                  badge={currentProfile.isKid ? "👶" : "👨‍👩‍👧"}
                />
                <InfoItem 
                  icon="shield-checkmark-outline" 
                  label="Trạng thái" 
                  value={currentProfile.statusText}
                  statusColor="#10b981"
                  isLast 
                />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonContent}>
                <View style={[styles.actionIcon, { backgroundColor: "#eff6ff" }]}>
                  <Ionicons name="settings-outline" size={22} color="#3b82f6" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonTitle}>Cài đặt</Text>
                  <Text style={styles.actionButtonSubtitle}>Quản lý tài khoản</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionButtonContent}>
                <View style={[styles.actionIcon, { backgroundColor: "#fef3c7" }]}>
                  <Ionicons name="help-circle-outline" size={22} color="#f59e0b" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonTitle}>Trợ giúp</Text>
                  <Text style={styles.actionButtonSubtitle}>Hỗ trợ & FAQ</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={styles.logoutButtonContent}>
                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Component cho info item
interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
  badge?: string;
  statusColor?: string;
  isLast?: boolean;
}

function InfoItem({ icon, label, value, badge, statusColor, isLast }: InfoItemProps) {
  return (
    <View style={[styles.infoItem, !isLast && styles.infoItemBorder]}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color="#9ca3af" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoRight}>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
        {badge && <Text style={styles.infoBadge}>{badge}</Text>}
        {statusColor && (
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    backgroundColor: "#fff",
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerGradient: {
    paddingTop: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  roleTag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
  },
  roleTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "right",
  },
  infoBadge: {
    fontSize: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  actionSection: {
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fee2e2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
});