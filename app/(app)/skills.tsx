import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

export default function SkillsScreen() {
  const skillCategories = [
    {
      id: 'programming',
      title: 'Programming',
      subtitle: 'Lập trình & Logic',
      description: 'Train your logical thinking in a fun and interesting way with coding.',
      icon: 'code-slash',
      gradient: ['#667eea', '#764ba2'] as const,
      iconBg: '#667eea',
    },
    {
      id: 'dance',
      title: 'Dance',
      subtitle: 'Nhảy múa & Âm nhạc',
      description: '"Hey Mini, show me dance"\n"Hey Mini, dance Little Star"',
      icon: 'musical-notes',
      gradient: ['#f093fb', '#f5576c'] as const,
      iconBg: '#f093fb',
    },
    {
      id: 'action',
      title: 'Action',
      subtitle: 'Hành động & Thể thao',
      description: '"Hey Mini, Kungfu"\n"Hey Mini, do a push-up"',
      icon: 'fitness',
      gradient: ['#fa709a', '#fee140'] as const,
      iconBg: '#fa709a',
    },
    {
      id: 'friends',
      title: 'Friends',
      subtitle: 'Kết bạn & Giao tiếp',
      description: '"Hey Mini, I am xxx"\n"Hey Mini, who am I?"',
      icon: 'people',
      gradient: ['#30cfd0', '#330867'] as const,
      iconBg: '#30cfd0',
    },
    {
      id: 'photo',
      title: 'Photo',
      subtitle: 'Chụp ảnh & Sáng tạo',
      description: '"Hey Mini, take a photo"',
      icon: 'camera',
      gradient: ['#ffecd2', '#fcb69f'] as const,
      iconBg: '#fcb69f',
    },
  ];

  const handleSkillPress = (skillId: string) => {
    if (skillId === 'action') {
      router.push('/(app)/(actions)/action-page');
    }
    // TODO: Navigate to other skill details
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerSubtitle}>Khám phá kỹ năng</Text>
                <Text style={styles.headerTitle}>AlphaMini Skills</Text>
              </View>
              <TouchableOpacity style={styles.infoButton}>
                <Ionicons name="information-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Feature Banner */}
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={require('@/assets/images/img_free_programme.png')}
            style={styles.banner}
            imageStyle={styles.bannerImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent']}
              style={styles.bannerOverlay}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>🎓 Free Learning</Text>
                <Text style={styles.bannerSubtitle}>Học lập trình miễn phí</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Kỹ năng</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="rocket" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Hoạt động</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star" size={24} color="#06b6d4" />
            </View>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>Sáng tạo</Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục kỹ năng</Text>
          <Text style={styles.sectionSubtitle}>Chọn kỹ năng bạn muốn khám phá</Text>
        </View>

        {/* Skills List với gradient cards */}
        <View style={styles.skillsList}>
          {skillCategories.map((skill, index) => (
            <TouchableOpacity 
              key={skill.id} 
              style={styles.skillCardWrapper}
              activeOpacity={0.8}
              onPress={() => handleSkillPress(skill.id)}
            >
              <LinearGradient
                colors={skill.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.skillCardGradient}
              >
                <View style={styles.skillCardContent}>
                  <View style={styles.skillHeader}>
                    <View style={styles.skillIconWrapper}>
                      <View style={styles.skillIconContainer}>
                        <Ionicons name={skill.icon as any} size={28} color="#fff" />
                      </View>
                    </View>
                    <View style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{index + 1}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillTitle}>{skill.title}</Text>
                    <Text style={styles.skillSubtitle}>{skill.subtitle}</Text>
                    <Text style={styles.skillDescription} numberOfLines={2}>
                      {skill.description}
                    </Text>
                  </View>

                  <View style={styles.skillFooter}>
                    <View style={styles.exploreButton}>
                      <Text style={styles.exploreButtonText}>Khám phá</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
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
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
  },
  banner: {
    borderRadius: 20,
    overflow: "hidden",
    height: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerImage: {
    borderRadius: 20,
  },
  bannerOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
  },
  bannerContent: {
    gap: 4,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  skillsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  skillCardWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  skillCardGradient: {
    borderRadius: 20,
  },
  skillCardContent: {
    padding: 20,
    minHeight: 180,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  skillIconWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  skillIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  skillBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  skillBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  skillInfo: {
    flex: 1,
    gap: 6,
  },
  skillTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  skillSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
  skillFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  bottomSpacing: {
    height: 40,
  },
});
