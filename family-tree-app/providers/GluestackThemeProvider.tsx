import type { ReactNode } from "react";

import {
  GluestackUIProvider,
  type ModeType,
} from "@/components/ui/gluestack-ui-provider";
import { useAppPreferences } from "@/context/AppPreferencesContext";

type GluestackThemeProviderProps = {
  children: ReactNode;
};

/** Syncs Gluestack / NativeWind color scheme with app light-dark preference. */
export function GluestackThemeProvider({ children }: GluestackThemeProviderProps) {
  const prefs = useAppPreferences();
  const mode: ModeType = prefs.theme === "dark" ? "dark" : "light";

  return <GluestackUIProvider mode={mode}>{children}</GluestackUIProvider>;
}
