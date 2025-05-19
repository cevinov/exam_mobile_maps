import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { VinoColors } from "../../constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: VinoColors.primary,
        tabBarInactiveTintColor: VinoColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: VinoColors.tabBarBackground,
          borderTopColor: VinoColors.separator,
        },
        headerStyle: { backgroundColor: VinoColors.primary }, // Default header style for tab screens
        headerTintColor: VinoColors.headerText,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index" 
        options={{
          title: "Vino App",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              size={26} // Slightly adjusted size
              name="hospital-o"
              color={
                focused ? VinoColors.tabIconSelected : VinoColors.tabIconDefault
              }
            />
          ),
        }}
      />
      {}
    </Tabs>
  );
}
