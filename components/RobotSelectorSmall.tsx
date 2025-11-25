import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Battery, Wifi, WifiOff, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { useRobot } from "../hooks/useRobot";
import { useRobotInfo } from "../hooks/useRobotInfo";
import { useRobotStore } from "../hooks/useRobotStore";
import { getUserIdFromToken } from "../utils/tokenUtils";

export function RobotSelectorSmall() {
  const [accountId, setAccountId] = useState("");
  const [visible, setVisible] = useState(false);

  const {
    robots,
    selectedRobotSerial,
    selectRobot,
    addRobot,
    updateRobotStatus,
    updateRobotBattery,
    connectMode,
  } = useRobotStore();

  const isMultiMode =
    connectMode === "multi" ||
    (Array.isArray(selectedRobotSerial) && selectedRobotSerial.length > 1);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        const userId = getUserIdFromToken(token);
        if (userId) setAccountId(userId);
      }
    })();
  }, []);

  const { useGetRobotsByAccountId } = useRobot();
  const { data: robotsResponse, isLoading } = useGetRobotsByAccountId(accountId);
  const robotsApi = robotsResponse?.data || [];

  useEffect(() => {
    robotsApi.forEach((r) => {
      addRobot({
        id: r.id,
        serialNumber: r.serialNumber,
        name: r.robotModelName || "Unknown Robot",
        status: r.status === 1 ? "online" : "offline",
        battery: r.battery,
        robotModelId: r.robotModelId,
        robotModelName: r.robotModelName,
        accountId: r.accountId,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotsApi]);

  const { useGetMultipleRobotInfo } = useRobotInfo();
  const serialList = useMemo(() => robots.map((r) => r.serialNumber), [robots]);
  const infoList = useGetMultipleRobotInfo(serialList, 3, {
    enabled: robots.length > 0,
  });

  useEffect(() => {
    infoList.forEach((info) => {
      const apiData = info.data?.data;
      const existing = robots.find((r) => r.serialNumber === info.serial);
      if (!existing) return;

      let newStatus = existing.status;
      let newBattery = existing.battery;

      if (!info.data || info.data.status === "error") {
        newStatus = "offline";
      } else if (apiData) {
        newStatus = apiData.is_charging ? "charging" : "online";
        newBattery = String(apiData.battery_level ?? existing.battery);
      }

      if (existing.status !== newStatus) updateRobotStatus(info.serial, newStatus);
      if (existing.battery !== newBattery)
        updateRobotBattery(info.serial, newBattery ?? null);
    });
  }, [infoList, robots, updateRobotBattery, updateRobotStatus]);

  const displayRobots = robots
    .filter((r) => r.accountId === accountId)
    .map((r) => ({
      ...r,
      avatar:
        r.status === "online" || r.status === "charging"
          ? require("../assets/images/img_top_alphamini_connect.webp")
          : require("../assets/images/img_top_alphamini_disconnect.webp"),
    }));

  const selectedSerials = Array.isArray(selectedRobotSerial)
    ? selectedRobotSerial
    : selectedRobotSerial
      ? [selectedRobotSerial]
      : [];

  const selectedRobot = displayRobots.find(
    (r) => r.serialNumber === selectedSerials[0]
  );

  const handleSelect = async (serial: string) => {
    selectRobot(serial);
    setVisible(false);
    await AsyncStorage.setItem("selectedRobotSerial", serial);
  };

  const compactModel = selectedRobot?.robotModelName ?? selectedRobot?.name ?? "No robot";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
      >
        <Image
          source={
            selectedRobot?.avatar ||
            require("../assets/images/img_top_alphamini_disconnect.webp")
          }
          style={styles.avatar}
          resizeMode="contain"
        />

        <View style={styles.info}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    selectedRobot?.status === "online"
                      ? "#4ade80"
                      : selectedRobot?.status === "charging"
                        ? "#facc15"
                        : "#ef4444",
                },
              ]}
            />
            <Text style={styles.modelText} numberOfLines={1}>
              {compactModel}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.serialText} numberOfLines={1}>
              {selectedRobot?.serialNumber ?? "—"}
            </Text>

            {selectedRobot?.battery ? (
              <View style={styles.batteryWrap}>
                <Battery size={12} />
                <Text style={styles.batteryText}>{selectedRobot.battery}%</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Ionicons name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Chọn Robot</Text>

            <FlatList
              data={displayRobots}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={Divider}
              renderItem={({ item }) => {
                const isSelected = selectedSerials.includes(item.serialNumber);
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.serialNumber)}
                    style={styles.item}
                  >
                    <Image source={item.avatar} style={styles.itemAvatar} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                      <Text style={{ color: "#666", fontSize: 12 }}>
                        {item.serialNumber}
                      </Text>
                    </View>

                    {item.status === "online" && <Wifi size={16} />}
                    {item.status === "charging" && <Zap size={16} />}
                    {item.status === "offline" && <WifiOff size={16} />}

                    {item.battery && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 6 }}>
                        <Battery size={16} />
                        <Text style={{ fontSize: 12 }}>{item.battery}%</Text>
                      </View>
                    )}

                    {isSelected && <Text style={{ color: "#2563eb", marginLeft: 8 }}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />

            <Button mode="outlined" onPress={() => console.log("Thêm Robot")} style={{ marginTop: 12 }}>
              Thêm Robot
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 6 },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: { width: 48, height: 48, borderRadius: 8 },
  info: { flex: 1, marginLeft: 6 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  modelText: { fontWeight: "700", color: "#111", maxWidth: "85%" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  serialText: { color: "#6b7280", fontSize: 12 },
  batteryWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  batteryText: { fontSize: 12, marginLeft: 4 },
  modal: { backgroundColor: "white", padding: 16, borderRadius: 12, margin: 20, maxHeight: "80%" },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  itemAvatar: { width: 40, height: 40, borderRadius: 8 },
});