import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2196F3",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Playground",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/ic_tabbar_home_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: "AlphaMini Skills",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/ic_tabbar_strategy_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/icons/ic_tabbar_me_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
