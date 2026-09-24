import { useAppPreferences } from "@/context/AppPreferencesContext";
import { getAppTheme, type AppTheme } from "@/theme/appTheme";

export function useAppTheme(): AppTheme {
  const prefs = useAppPreferences();
  return getAppTheme(prefs.theme);
}
