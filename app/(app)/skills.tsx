import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function SkillsScreen() {
  const skillCategories = [
    {
      id: 'programming',
      title: 'Programming',
      description: 'Train your logical thinking in a fun and interesting way with coding.',
      icon: '💻',
      iconBg: '#4C9AFF',
    },
    {
      id: 'dance',
      title: 'Dance',
      description: '"Hey Mini, show me dance"\n"Hey Mini, dance Little Star"',
      icon: '🐰',
      iconBg: '#A78BFA',
    },
    {
      id: 'action',
      title: 'Action',
      description: '"Hey Mini, Kungfu"\n"Hey Mini, do a push-up"',
      icon: '🏃',
      iconBg: '#F87171',
    },
    {
      id: 'friends',
      title: 'Friends',
      description: '"Hey Mini, I am xxx"\n"Hey Mini, who am I?"',
      icon: '👥',
      iconBg: '#4ADE80',
    },
    {
      id: 'photo',
      title: 'Photo',
      description: '"Hey Mini, take a photo"',
      icon: '📷',
      iconBg: '#FBBF24',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AlphaMini Skills</Text>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={require('@/assets/images/img_free_programme.png')}
            style={styles.banner}
            imageStyle={styles.bannerImage}
            resizeMode="cover"
          >
          </ImageBackground>
        </View>

        {/* Skills List */}
        <View style={styles.skillsList}>
          {skillCategories.map((skill) => (
            <TouchableOpacity 
              key={skill.id} 
              style={styles.skillCard}
              activeOpacity={0.7}
            >
              <View style={[styles.skillIcon, { backgroundColor: skill.iconBg }]}>
                <Text style={styles.skillIconText}>{skill.icon}</Text>
              </View>
              <View style={styles.skillContent}>
                <Text style={styles.skillTitle}>{skill.title}</Text>
                <Text style={styles.skillDescription}>{skill.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  banner: {
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 140,
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    minHeight: 140,
  },
  bannerLeft: {
    flex: 1,
    gap: 12,
  },
  bannerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    fontStyle: "italic",
  },
  robotContainer: {
    alignSelf: "flex-start",
  },
  robotEmoji: {
    fontSize: 48,
  },
  bannerRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  buildingsEmoji: {
    fontSize: 80,
  },
  skillsList: {
    padding: 16,
    gap: 12,
  },
  skillCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  skillIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  skillIconText: {
    fontSize: 28,
  },
  skillContent: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
});
