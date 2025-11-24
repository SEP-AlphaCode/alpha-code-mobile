import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="select-profile" />
      <Stack.Screen name="create-parent-profile" />
    </Stack>
  );
}
