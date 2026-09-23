import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from "react-native-paper";

const brand = {
  primary: "#1B4332",
  secondary: "#9C6644",
  tertiary: "#1D4E4A",
};

const fontConfig = configureFonts({ config: { fontFamily: "System" } });

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
    tertiary: brand.tertiary,
    primaryContainer: "#d8f3dc",
    onPrimary: "#ffffff",
    secondaryContainer: "#f3e6d8",
    background: "#f6f1e7",
    surface: "#fffdf8",
    surfaceVariant: "#efe6d6",
    outline: "#c4b8a5",
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 12,
  fonts: fontConfig,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#95d5b2",
    onPrimary: "#081c15",
    secondary: "#e6ccb2",
    tertiary: "#b7e4c7",
    primaryContainer: "#1b4332",
    onPrimaryContainer: "#d8f3dc",
    background: "#1a1814",
    onBackground: "#f6f1e7",
    surface: "#242018",
    onSurface: "#f6f1e7",
    onSurfaceVariant: "#d6cfc2",
    surfaceVariant: "#3a3329",
    outline: "#8a7e6a",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#1e293b",
      level2: "#243044",
      level3: "#2a3549",
    },
  },
};
