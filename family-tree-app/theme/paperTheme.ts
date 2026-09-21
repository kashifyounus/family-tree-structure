import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from "react-native-paper";

const brand = {
  primary: "#4f46e5",
  secondary: "#b45309",
  tertiary: "#0d9488",
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
    primaryContainer: "#e0e7ff",
    secondaryContainer: "#ffedd5",
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceVariant: "#f1f5f9",
    outline: "#cbd5e1",
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 12,
  fonts: fontConfig,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#a5b4fc",
    onPrimary: "#1e1b4b",
    secondary: "#fdba74",
    tertiary: "#5eead4",
    primaryContainer: "#312e81",
    onPrimaryContainer: "#e0e7ff",
    background: "#0f172a",
    onBackground: "#f1f5f9",
    surface: "#1e293b",
    onSurface: "#f8fafc",
    onSurfaceVariant: "#cbd5e1",
    surfaceVariant: "#334155",
    outline: "#64748b",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#1e293b",
      level2: "#243044",
      level3: "#2a3549",
    },
  },
};
