import AsyncStorage from "@react-native-async-storage/async-storage";
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
    updateRobotInfo,
    connectMode,
  } = useRobotStore();

  const isMultiMode =
    connectMode === "multi" ||
    (Array.isArray(selectedRobotSerial) && selectedRobotSerial.length > 1);

  // Lấy accountId từ token
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        const userId = getUserIdFromToken(token);
        if (userId) setAccountId(userId);
      }
    })();
  }, []);

  // Gọi API lấy robots
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

  const { useGetMultipleRobotInfo } = useRobotInfo();
  const serialList = useMemo(() => robots.map((r) => r.serialNumber), [robots]);
  const robotInfos = useGetMultipleRobotInfo(serialList, 3, {
    enabled: robots.length > 0,
  });

  useEffect(() => {
    robotInfos.forEach((info) => {
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

      if (existing.status !== newStatus)
        updateRobotStatus(info.serial, newStatus);
      if (existing.battery !== newBattery)
        updateRobotBattery(info.serial, newBattery ?? null);
    });
  }, [robotInfos]);

  const handleRobotSelect = async (serial: string) => {
    selectRobot(serial);
    await AsyncStorage.setItem("selectedRobotSerial", serial);
  };

  const displayRobots = robots
    .filter((r) => r.accountId === accountId)
    .map((r) => ({
      ...r,
      avatar:
        r.status === "online" || r.status === "charging"
          ? require("../../assets/img_top_alphamini_connect.png")
          : require("../../assets/img_top_alphamini_disconnect.png"),
    }));

  const selectedSerials = Array.isArray(selectedRobotSerial)
    ? selectedRobotSerial
    : selectedRobotSerial
    ? [selectedRobotSerial]
    : [];

  const selectedRobots = displayRobots.filter((r) =>
    selectedSerials.includes(r.serialNumber)
  );

  const displayName =
    selectedRobots.length === 0
      ? "Chưa có robot nào"
      : isMultiMode
      ? `${selectedRobots.length} robots được chọn`
      : selectedRobots[0].name;

  if (isLoading) return <Text>Đang tải robots...</Text>;

  return (
    <View style={{ padding: 10 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#e0f2fe",
          borderRadius: 12,
          padding: 10,
        }}
        onPress={() => setVisible(true)}
      >
        <Image
          source={
            selectedRobots[0]?.avatar ||
            require("../../assets/img_top_alphamini_disconnect.png")
          }
          style={{ width: 50, height: 50, borderRadius: 10 }}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{displayName}</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>
            {isMultiMode
              ? "Multi mode"
              : selectedRobots[0]?.serialNumber ?? ""}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Modal chọn robot */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 12 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
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
                    {item.status === "online" && <Wifi size={16} stroke="green" />}
                    {item.status === "charging" && <Zap size={16} stroke="orange" />}
                    {item.status === "offline" && <WifiOff size={16} stroke="gray" />}
                    {item.battery && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 5 }}>
                        <Battery size={16} />
                        <Text style={{ fontSize: 12 }}>{item.battery}%</Text>
                      </View>
                    )}
                    {isSelected && (
                      <Text style={{ color: "#2563eb", marginLeft: 8 }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <Button
              icon={() => <Plus size={16} stroke="#2563eb" />}
              mode="outlined"
              onPress={() => console.log("Thêm Robot")}
              style={{ marginTop: 15 }}
            >
              Thêm Robot mới
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
