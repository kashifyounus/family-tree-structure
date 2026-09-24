/** Navigation / legacy color tokens (no React Native Paper). */

export type AppColors = {
  primary: string;
  onPrimary: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outlineVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  outline: string;
};

export const semantic = {
  primary: "#1B4332",
  secondary: "#9C6644",
  tertiary: "#1D4E4A",
  success: "#047857",
  successContainer: "#d1fae5",
  onSuccessContainer: "#064e3b",
};

export const lightColors: AppColors = {
  primary: semantic.primary,
  onPrimary: "#ffffff",
  primaryContainer: "#d8f3dc",
  onPrimaryContainer: "#081c15",
  background: "#f6f1e7",
  onBackground: "#1a1814",
  surface: "#fffdf8",
  onSurface: "#1a1814",
  surfaceVariant: "#efe6d6",
  onSurfaceVariant: "#5c5346",
  outlineVariant: "#ddd3c4",
  error: "#b91c1c",
  onError: "#ffffff",
  errorContainer: "#fee2e2",
  onErrorContainer: "#7f1d1d",
  inverseSurface: "#1a1814",
  inverseOnSurface: "#f6f1e7",
  inversePrimary: "#95d5b2",
  secondary: semantic.secondary,
  outline: "#c4b8a8",
};

export const darkColors: AppColors = {
  primary: "#95d5b2",
  onPrimary: "#081c15",
  primaryContainer: "#1b4332",
  onPrimaryContainer: "#d8f3dc",
  background: "#1a1814",
  onBackground: "#f6f1e7",
  surface: "#242018",
  onSurface: "#f6f1e7",
  surfaceVariant: "#3a3329",
  onSurfaceVariant: "#d6cfc2",
  outlineVariant: "#5c5346",
  error: "#fca5a5",
  onError: "#450a0a",
  errorContainer: "#7f1d1d",
  onErrorContainer: "#fee2e2",
  inverseSurface: "#f6f1e7",
  inverseOnSurface: "#1a1814",
  inversePrimary: semantic.primary,
  secondary: semantic.secondary,
  outline: "#5c5346",
};

export type AppTheme = {
  mode: "light" | "dark";
  colors: AppColors;
};

export function getAppTheme(mode: "light" | "dark"): AppTheme {
  return { mode, colors: mode === "dark" ? darkColors : lightColors };
}
