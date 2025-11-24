import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Profile } from "../../features/auth/types/auth";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileCardProps {
  profile: Profile;
  onPress: () => void;
  disabled?: boolean;
}

export function ProfileCard({ profile, onPress, disabled }: ProfileCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <ProfileAvatar
        name={profile.name}
        avatarUrl={profile.avartarUrl}
        size={80}
      />
      <Text style={styles.name} numberOfLines={1}>
        {profile.name}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {profile.isKid ? "👶 Trẻ em" : "👨‍👩‍👧 Phụ huynh"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    width: "48%",
    marginBottom: 16,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  name: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: "#666",
  },
});
