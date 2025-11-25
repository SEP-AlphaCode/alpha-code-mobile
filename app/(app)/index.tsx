import { useAuthContext } from "@/components/AuthContext";
import React from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function HomeScreen() {
  const { logout, currentProfile } = useAuthContext();

  const programmingItems = [
    {
      id: 'create-actions',
      title: 'Create Actions',
      image: require('@/assets/images/img_prp.png'),
      bgColor: '#9333ea',
      gradient: ['#a855f7', '#9333ea'],
    },
    {
      id: 'workspace',
      title: 'Workspace',
      image: require('@/assets/images/img_programming_free.png'),

      bgColor: '#0ea5e9',
      gradient: ['#38bdf8', '#0ea5e9'],
    },
    {
      id: 'my-works',
      title: 'My Works',
      image: require('@/assets/images/img_programmini_projects.png'),
      bgColor: '#8b5cf6',
      gradient: ['#a78bfa', '#8b5cf6'],
    },
  ];

  const entertainmentItems = [
    { id: 'action', title: 'Action', icon: '🏃', bgColor: '#ef4444' },
    { id: 'album', title: 'Album', icon: '🎨', bgColor: '#f59e0b' },
    { id: 'friends', title: 'Friends', icon: '👥', bgColor: '#22c55e' },
  ];

  const thingsToTry = [
    '"Hey Mini, storkstand"',
    '"Hey Mini, play Little Star"',
    '"Hey Mini, I like you"',
    '"Hey Mini, let\'s play a word game"',
    '"Hey Mini, fart"',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AlphaMini Card */}
        <View style={styles.robotCard}>
          <View style={styles.robotContent}>
            <View style={styles.robotImageContainer}>
              <Image 
                source={require('@/assets/images/img_top_alphamini_connect.webp')}
                style={styles.robotImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.robotInfo}>
              <Text style={styles.robotTitle}>AlphaMini</Text>
              <TouchableOpacity style={styles.bindButton}>
                <Text style={styles.bindButtonText}>Start Binding</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Programming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROGRAMMING</Text>
          <View style={styles.cardGrid}>
            {programmingItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.programCard}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={item.image}
                  style={styles.programCardBackground}
                  imageStyle={styles.programCardBackgroundImage}
                  resizeMode="cover"
                >
                  <View style={styles.programCardTextContainer}>
                    <Text style={styles.programCardTitle}>{item.title}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Entertainment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENTERTAINMENT</Text>
          <View style={styles.circleGrid}>
            {entertainmentItems.map((item) => (
              <View key={item.id} style={styles.circleItem}>
                <TouchableOpacity 
                  style={[styles.circleButton, { backgroundColor: item.bgColor }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.circleIcon}>{item.icon}</Text>
                </TouchableOpacity>
                <Text style={styles.circleLabel}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Things to Try Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>THINGS TO TRY:</Text>
            <TouchableOpacity>
              <Text style={styles.refreshButton}>Refresh</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.commandsList}>
            {thingsToTry.map((command, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.commandItem}
                activeOpacity={0.7}
              >
                <Text style={styles.commandText}>{command}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    padding: 16,
    paddingBottom: 100,
  },
  robotCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  robotContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  robotImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#D6EAF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  robotImage: {
    width: 64,
    height: 64,
  },
  robotInfo: {
    flex: 1,
  },
  robotTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  bindButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bindButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "600",
  },
  cardGrid: {
    flexDirection: "row",
    gap: 12,
  },
  programCard: {
    flex: 1,
    borderRadius: 16,
    minHeight: 150,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  programCardBackground: {
    flex: 1,
    justifyContent: "flex-start",
  },
  programCardBackgroundImage: {
    borderRadius: 16,
  },
  programCardTextContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  programCardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "left",
  },
  circleGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  circleItem: {
    alignItems: "center",
    gap: 8,
  },
  circleButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  circleIcon: {
    fontSize: 32,
  },
  circleLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  commandsList: {
    gap: 12,
  },
  commandItem: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  commandText: {
    color: "#0ea5e9",
    fontSize: 15,
    fontWeight: "500",
  },
});