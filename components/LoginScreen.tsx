import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { LoadingOverlay } from "../components/LoadingOverlay";

import { router } from "expo-router";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function LoginScreen() {
  const { login, loading } = useAuth();

  const [username, setUsername] = useState("teacher"); // test user
  const [password, setPassword] = useState("123456");
  const [accepted, setAccepted] = useState(true);

  const canLogin = username && password && accepted;

  const handleLogin = async () => {
    try {
      const res = await login({ username, password });
      if (res) {
        router.replace("/"); 
      }
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      {/* phần logo + input ở trên */}
      <View style={styles.topContent}>
        <LoadingOverlay visible={loading} />
        <Image
          source={require("../assets/images/img_edu_login.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Campus Account Login</Text>

        <View style={styles.inputCard}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Student ID"
            style={[styles.input, styles.inputTop, styles.inputItalic]}
          />
          <View style={styles.separator} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password"
            secureTextEntry
            style={[styles.input, styles.inputBottom]}
          />
        </View>
      </View>

      {/* phần button + terms ở dưới */}
      <View style={styles.bottomContent}>
        <TouchableOpacity
          onPress={handleLogin}
          style={[
            styles.button,
            { backgroundColor: canLogin ? "#2f83ff" : "#888" },
            { opacity: canLogin ? 1 : 0.5 },
          ]}
          disabled={!canLogin || loading}
        >
          {loading ? (
            <LottieView
              source={require("../assets/loading/loading_pop_up.webp")}
              autoPlay
              loop
              style={{ width: 40, height: 40 }}
            />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAccepted(!accepted)}
          style={styles.termsRow}
        >
          <Text style={styles.termsText}>
            {accepted ? "☑" : "☐"} I have read and agreed to the{" "}
            <Text style={styles.link}>privacy</Text> and{" "}
            <Text style={styles.link}>terms</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContent: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  logo: { width: 200, height: 200, marginBottom: 10, resizeMode: "contain" },
  title: { fontSize: 20, color: "#2f83ff", marginBottom: 20, fontStyle: "italic" },
  inputCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 20,
    overflow: "hidden",
  },
  input: { fontSize: 16, textAlign: "center", paddingVertical: 15 },
  inputTop: { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  inputBottom: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  inputItalic: { fontStyle: "italic" },
  separator: { height: 1, backgroundColor: "#eee" },
  button: {
    backgroundColor: "#888",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 15,
    transform: [{ skewX: "-10deg" }],
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
    transform: [{ skewX: "10deg" }],
  },
  termsRow: {},
  termsText: { fontSize: 14, color: "#444", textAlign: "center" },
  link: { color: "blue" },
});
