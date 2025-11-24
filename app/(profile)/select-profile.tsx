import { LoadingOverlay } from "@/components/LoadingOverlay";
import { PinInputModal } from "@/components/profile/PinInputModal";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useSwitchProfile } from "@/features/auth/hooks/useSwitchProfile";
import { Profile } from "@/features/auth/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function SelectProfileScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const { switchProfile, loading: switchingProfile } = useSwitchProfile();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const [profilesStr, storedAccountId] = await Promise.all([
        AsyncStorage.getItem("availableProfiles"),
        AsyncStorage.getItem("pendingAccountId"),
      ]);

      if (!profilesStr) {
        Alert.alert("Lỗi", "Không tìm thấy danh sách profiles. Vui lòng đăng nhập lại.");
        router.replace("/(auth)/login");
        return;
      }

      const parsedProfiles = JSON.parse(profilesStr);
      setProfiles(parsedProfiles);
      setAccountId(storedAccountId || "");
    } catch (error) {
      console.error("Error loading profiles:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách profiles.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin: string) => {
    if (!selectedProfile) return;

    try {
      console.log('Switching profile with PIN:', {
        profileId: selectedProfile.id,
        accountId: accountId,
        profileName: selectedProfile.name,
      });
      
      await switchProfile(selectedProfile.id, accountId, pin);
      setShowPinModal(false);
      setSelectedProfile(null);
    } catch (error: any) {
      console.error("Error switching profile:", error);
      console.error("Error details:", error.response?.data);
      // Keep modal open on error so user can try again
    }
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    setSelectedProfile(null);
  };

  const handleCreateProfile = () => {
    router.push("/create-parent-profile");
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  if (loadingData) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={switchingProfile} />
      
      {/* PIN Input Modal */}
      <PinInputModal
        visible={showPinModal}
        profileName={selectedProfile?.name || ""}
        avatarUrl={selectedProfile?.avartarUrl}
        onConfirm={handlePinConfirm}
        onCancel={handlePinCancel}
        loading={switchingProfile}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Chọn Profile</Text>
        <Text style={styles.subtitle}>
          Chọn profile để tiếp tục
        </Text>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            onPress={() => handleSelectProfile(item)}
            disabled={switchingProfile}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có profile nào</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleCreateProfile}
          disabled={switchingProfile}
        >
          <Text style={styles.buttonTextPrimary}>+ Tạo Profile Mới</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleBackToLogin}
          disabled={switchingProfile}
        >
          <Text style={styles.buttonTextSecondary}>← Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2f83ff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: "#2f83ff",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2f83ff",
  },
  buttonTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#2f83ff",
    fontSize: 16,
    fontWeight: "600",
  },
});
