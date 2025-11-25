import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Battery, Plus, Wifi, WifiOff, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { Button, Divider, Modal, Portal } from "react-native-paper";
import { useRobot } from "../hooks/useRobot";
import { useRobotInfo } from "../hooks/useRobotInfo";
import { useRobotStore } from "../hooks/useRobotStore";
import { getUserIdFromToken } from "../utils/tokenUtils";

export function RobotSelector() {
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

  // ========================
  // GET ACCOUNT ID FROM TOKEN
  // ========================
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        const userId = getUserIdFromToken(token);
        if (userId) setAccountId(userId);
      }
    })();
  }, []);

  // =====================
  // GET ROBOT LIST FROM API
  // =====================
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
  }, [robotsApi]);

  // ======================
  // GET MULTIPLE ROBOT INFO (STATUS, BATTERY)
  // ======================
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
  }, [infoList]);

  const handleRobotSelect = async (serial: string) => {
    selectRobot(serial);
    setVisible(false);
    await AsyncStorage.setItem("selectedRobotSerial", serial);
  };

  // ======================
  // DISPLAY DATA
  // ======================
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

  const displayName = selectedRobot
    ? selectedRobot.name
    : "Chưa có robot nào";

  if (isLoading) return <Text>Đang tải robots...</Text>;

  // ======================
  // RENDER MAIN
  // ======================
  return (
    <View style={{ padding: 10 }}>
      
      {/* 🌈 CARD ROBOT ĐẸP */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.9}
        style={{ borderRadius: 16, overflow: "hidden" }}
      >
        <LinearGradient
          colors={["#6366f1", "#8b5cf6", "#d946ef"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 16,
            borderRadius: 16,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            {/* LEFT */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* DOT */}
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor:
                      selectedRobot?.status === "online"
                        ? "#4ade80"
                        : selectedRobot?.status === "charging"
                        ? "#facc15"
                        : "#ef4444",
                    marginRight: 6,
                  }}
                />
                <Text style={{ color: "#fff" }}>
                  {selectedRobot?.status ?? "Unknown"}
                </Text>
              </View>

              <Text style={{ color: "#fff", fontSize: 20, marginTop: 6 }}>
                {displayName}
              </Text>
              <Text style={{ color: "#e5e5e5", marginBottom: 10 }}>
                {selectedRobot?.serialNumber ?? "Không có serial"}
              </Text>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 20,
                  width: 140,
                }}
              >
                <Ionicons name="link" size={16} color="#fff" />
                <Text
                  style={{ color: "#fff", marginLeft: 6, fontSize: 13 }}
                >
                  Start Binding
                </Text>
              </TouchableOpacity>
            </View>

            {/* ROBOT IMAGE */}
            <Image
              source={
                selectedRobot?.avatar ||
                require("../assets/images/img_top_alphamini_disconnect.webp")
              }
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* MODAL CHỌN ROBOT */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)}>
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
              margin: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Chọn Robot
            </Text>

            <FlatList
              data={displayRobots}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={Divider}
              renderItem={({ item }) => {
                const isSelected = selectedSerials.includes(item.serialNumber);

                return (
                  <TouchableOpacity
                    onPress={() => handleRobotSelect(item.serialNumber)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                    }}
                  >
                    <Image
                      source={item.avatar}
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                    />

                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                      <Text style={{ color: "#666", fontSize: 12 }}>
                        {item.serialNumber}
                      </Text>
                    </View>

                    {item.status === "online" && <Wifi size={16} />}
                    {item.status === "charging" && <Zap size={16} />}
                    {item.status === "offline" && <WifiOff size={16} />}

                    {item.battery && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginLeft: 5,
                        }}
                      >
                        <Battery size={16} />
                        <Text style={{ fontSize: 12 }}>{item.battery}%</Text>
                      </View>
                    )}

                    {isSelected && (
                      <Text style={{ color: "#2563eb", marginLeft: 8 }}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <Button
              icon={() => <Plus size={16} />}
              mode="outlined"
              onPress={() => console.log("Thêm Robot")}
              style={{ marginTop: 15 }}
            >
              Thêm Robot
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
