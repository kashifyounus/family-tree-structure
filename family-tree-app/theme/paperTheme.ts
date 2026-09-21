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
    secondary: "#fdba74",
    tertiary: "#5eead4",
    primaryContainer: "#312e81",
    background: "#0f172a",
    surface: "#1e293b",
    surfaceVariant: "#334155",
  },
};
