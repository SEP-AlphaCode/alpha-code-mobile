import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function AppLayout() {
  return (
    <Tabs
      // give the tabs scene full height and adjust tab bar sizing
      // sceneContainerStyle={{ backgroundColor: "transparent", flex: 1 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2196F3",
        tabBarStyle: { height: 64, paddingBottom: 6 }, // adjust as needed
      }}
    >
      <Tabs.Screen
        name="action-page"
        options={{
          title: "Hành động",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../../assets/icons/ic_tabbar_me_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expression-page"
        options={{
          title: "Biểu cảm",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../../assets/icons/ic_tabbar_me_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="extended-action-page"
        options={{
          title: "Hành động mở rộng",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../../assets/icons/ic_tabbar_me_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dance-page"
        options={{
          title: "Múa",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../../assets/icons/ic_tabbar_me_p.webp")}
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}