import React from "react";
import { Image, Modal, StyleSheet, View } from "react-native";

export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Image
            source={require("../assets/loading/loading_pop_up.webp")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: 200,
    height: 200,
  },
});
