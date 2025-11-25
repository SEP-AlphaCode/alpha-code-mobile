import { useAuthContext } from "@/components/AuthContext";
import { RobotSelector } from "@/components/RobotSelector";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get('window');
const cardWidth = (width - 56) / 3;

export default function HomeScreen() {
  const { currentProfile } = useAuthContext();

  const programmingItems = [
    {
      id: 'create-actions',
      title: 'Create Actions',
      subtitle: 'Tạo hành động',
      image: require('@/assets/images/img_prp.png'),
      icon: 'create-outline',
      gradient: ['rgba(139, 92, 246, 0.85)', 'rgba(236, 72, 153, 0.85)'] as const,
    },
    {
      id: 'workspace',
      title: 'Workspace',
      subtitle: 'Không gian làm việc',
      image: require('@/assets/images/img_programming_free.png'),
      icon: 'cube-outline',
      gradient: ['rgba(6, 182, 212, 0.85)', 'rgba(59, 130, 246, 0.85)'] as const,
    },
    {
      id: 'my-works',
      title: 'My Works',
      subtitle: 'Dự án của tôi',
      image: require('@/assets/images/img_programmini_projects.png'),
      icon: 'folder-open-outline',
      gradient: ['rgba(99, 102, 241, 0.85)', 'rgba(168, 85, 247, 0.85)'] as const,
    },
  ];

  const entertainmentItems = [
    {
      id: 'action',
      title: 'Action',
      subtitle: 'Hành động',
      icon: 'fitness-outline',
      gradient: ['#f43f5e', '#fb923c'] as const,
    },
    {
      id: 'album',
      title: 'Album',
      subtitle: 'Thư viện',
      icon: 'images-outline',
      gradient: ['#f59e0b', '#fbbf24'] as const,
    },
    {
      id: 'friends',
      title: 'Friends',
      subtitle: 'Bạn bè',
      icon: 'people-outline',
      gradient: ['#10b981', '#06b6d4'] as const,
    },
  ];

  const quickActions = [
    { id: 'dance', title: 'Dance', icon: 'musical-notes', color: '#8b5cf6' },
    { id: 'photo', title: 'Photo', icon: 'camera', color: '#06b6d4' },
    { id: 'game', title: 'Game', icon: 'game-controller', color: '#f59e0b' },
    { id: 'chat', title: 'Chat', icon: 'chatbubbles', color: '#10b981' },
  ];

  const thingsToTry = [
    { text: '"Hey Mini, storkstand"', icon: 'body-outline' },
    { text: '"Hey Mini, play Little Star"', icon: 'musical-note-outline' },
    { text: '"Hey Mini, I like you"', icon: 'heart-outline' },
    { text: '"Hey Mini, let\'s play a word game"', icon: 'extension-puzzle-outline' },
    { text: '"Hey Mini, fart"', icon: 'happy-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greetingText}>Xin chào 👋</Text>
            <Text style={styles.greetingName}>
              {currentProfile?.name || 'Bạn'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1e293b" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* AlphaMini Card với gradient */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <RobotSelector />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Programming Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Programming</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {programmingItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.programCard}
                activeOpacity={0.9}
              >
                <ImageBackground
                  source={item.image}
                  style={styles.programCardBackground}
                  imageStyle={styles.programCardBackgroundImage}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.programCardGradient}
                  >
                    <View style={styles.programCardTop}>
                      <View style={styles.programCardIconLarge}>
                        <Ionicons name={item.icon as any} size={24} color="#fff" />
                      </View>
                    </View>
                    <View style={styles.programCardBottom}>
                      <Text style={styles.programCardTitle}>{item.title}</Text>
                      <Text style={styles.programCardSubtitle}>{item.subtitle}</Text>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Entertainment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entertainment</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.entertainmentGrid}>
            {entertainmentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.entertainmentCard}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.entertainmentGradient}
                >
                  <Ionicons name={item.icon as any} size={32} color="#fff" />
                  <Text style={styles.entertainmentTitle}>{item.title}</Text>
                  <Text style={styles.entertainmentSubtitle}>{item.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Things to Try Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Things to Try</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton}>
              <Ionicons name="refresh-outline" size={18} color="#6366f1" />
            </TouchableOpacity>
          </View>
          <View style={styles.commandsList}>
            {thingsToTry.map((command, index) => (
              <TouchableOpacity
                key={index}
                style={styles.commandItem}
                activeOpacity={0.7}
              >
                <View style={styles.commandIcon}>
                  <Ionicons name={command.icon as any} size={20} color="#6366f1" />
                </View>
                <Text style={styles.commandText}>{command.text}</Text>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  greetingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f8fafc",
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  robotCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  robotCard: {
    borderRadius: 24,
  },
  robotContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
  },
  robotLeft: {
    flex: 1,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  robotTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  robotSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  bindButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  bindButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  robotImageContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  robotImage: {
    width: 90,
    height: 90,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  programCard: {
    width: 180,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  programCardBackground: {
    flex: 1,
  },
  programCardBackgroundImage: {
    borderRadius: 24,
  },
  programCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  programCardTop: {
    alignItems: "flex-start",
  },
  programCardIconLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  programCardBottom: {
    gap: 6,
  },
  programCardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  programCardSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  entertainmentGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  entertainmentCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  entertainmentGradient: {
    padding: 20,
    alignItems: "center",
    gap: 8,
    minHeight: 140,
    justifyContent: "center",
  },
  entertainmentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  entertainmentSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  commandsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  commandItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  commandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  commandText: {
    flex: 1,
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 40,
  },
});