import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from "react-native-paper";

import { radius } from "./tokens";

const brand = {
  primary: "#1B4332",
  secondary: "#9C6644",
  tertiary: "#1D4E4A",
  success: "#047857",
  successContainer: "#d1fae5",
};

const fontConfig = configureFonts({
  config: {
    fontFamily: "System",
    fontWeight: "400",
  },
});

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radius.md,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    onPrimary: "#ffffff",
    primaryContainer: "#d8f3dc",
    onPrimaryContainer: "#081c15",
    secondary: brand.secondary,
    onSecondary: "#ffffff",
    secondaryContainer: "#f3e6d8",
    onSecondaryContainer: "#3d2817",
    tertiary: brand.tertiary,
    tertiaryContainer: "#cce8e4",
    background: "#f6f1e7",
    onBackground: "#1a1814",
    surface: "#fffdf8",
    onSurface: "#1a1814",
    surfaceVariant: "#efe6d6",
    onSurfaceVariant: "#5c5346",
    outline: "#c4b8a5",
    outlineVariant: "#ddd3c4",
    error: "#b91c1c",
    onError: "#ffffff",
    errorContainer: "#fee2e2",
    onErrorContainer: "#7f1d1d",
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: "transparent",
      level1: "#fffdf8",
      level2: "#faf6ee",
      level3: "#f3ece0",
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  fonts: fontConfig,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#95d5b2",
    onPrimary: "#081c15",
    primaryContainer: "#1b4332",
    onPrimaryContainer: "#d8f3dc",
    secondary: "#e6ccb2",
    onSecondary: "#2d1f12",
    secondaryContainer: "#4a3524",
    onSecondaryContainer: "#f3e6d8",
    tertiary: "#b7e4c7",
    tertiaryContainer: "#1d4e4a",
    background: "#1a1814",
    onBackground: "#f6f1e7",
    surface: "#242018",
    onSurface: "#f6f1e7",
    onSurfaceVariant: "#d6cfc2",
    surfaceVariant: "#3a3329",
    outline: "#8a7e6a",
    outlineVariant: "#5c5346",
    error: "#fca5a5",
    onError: "#450a0a",
    errorContainer: "#7f1d1d",
    onErrorContainer: "#fee2e2",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#2a241c",
      level2: "#322b22",
      level3: "#3a3329",
    },
  },
};

export const semantic = brand;
