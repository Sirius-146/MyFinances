import { Appearance } from "react-native";

export const LightTheme = {
  background: "#FFFFFF",
  card: "#F5F5F7",
  text: "#1A1A1A",
  textSecondary: "#555",
  border: "#000080",
  primary: "#4F46E5",
  success: "#1F51FF",
  disabled: "#"
};

export const DarkTheme = {
  background: "#0D0D0D",
  card: "#1A1A1A",
  text: "#EDEDED",
  textSecondary: "#CCC",
  border: "#00f0ff",
  primary: "#7B6CF6",
  success: "#1F51FF",
  // disabled: 
};

export function getTheme() {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === "dark" ? DarkTheme : LightTheme;
}