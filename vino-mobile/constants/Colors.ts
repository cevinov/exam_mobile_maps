const tintColorLight = "#7D0A0A"; // Deep Red - Vino Primary
const tintColorDark = "#fff";

export const VinoColors = {
  primary: tintColorLight, // Deep Red
  secondary: "#BF3131", // Lighter Red / Accent
  accent: "#EAD196", // Gold/Beige accent

  text: "#333333", // Dark gray for text on light backgrounds
  lightText: "#FFFFFF", // White text for dark backgrounds
  subtleText: "#555555",

  background: "#FDF0F0", // Very light, warm off-white or pale pink
  cardBackground: "#FFFFFF",
  inputBackground: "#FFFFFF",

  // Headers
  headerBackground: tintColorLight,
  headerText: "#FFFFFF",

  // Tabs
  tabBarBackground: "#FFFFFF", // Or could be dark with light icons
  tabIconDefault: "#888",
  tabIconSelected: tintColorLight,

  // Others
  separator: "#EAEAEA",
  errorBackground: "red",
  errorText: "#fff",
  warningBackground: "#EAEB5E",
  warningText: "#666804",
  noticeBackground: tintColorLight,
  noticeText: "#fff",
  tint: tintColorLight, // For compatibility with some templates
  dark: {
    text: "#E0E0E0",
    background: "#1A0000", // Very dark red
    cardBackground: "#2B0B0B",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
    headerBackground: "#4A0404",
    headerText: "#FFFFFF",
  },
};
