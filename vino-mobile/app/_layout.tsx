import { Stack } from "expo-router";
import { VinoColors } from "../constants/Colors"; // Import your colors

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: VinoColors.headerBackground,
        },
        headerTintColor: VinoColors.headerText,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="hospital-detail"
        options={({ route }) => ({
          title: "Hospital Details", // Fallback title
        })}
      />
      {}
    </Stack>
  );
}
