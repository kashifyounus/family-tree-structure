import { semantic } from "@/theme/appTheme";
import { layout, radius, space } from "@/theme/tokens";

/**
 * Single source for Kuriosity mobile UI patterns (Gluestack + NativeWind).
 * Use these constants in mockups and new screens so UX stays consistent.
 */
export const kuriosityDesign = {
  brand: {
    name: "Kuriosity Family Tree",
    primary: semantic.primary,
    secondary: semantic.secondary,
    pedigreeCanvas: "#f3f4f6",
  },
  pedigree: {
    maleAccent: "#7eb6e0",
    femaleAccent: "#f4a6c1",
    neutralAccent: "#c4c4c4",
    connector: "#b8bcc4",
    cardWidth: 112,
    cardMinHeight: 118,
  },
  sheet: {
    topRadius: radius.xl,
    handleWidth: 48,
    handleHeight: 4,
    contentPaddingX: layout.screenPaddingX,
    fieldGap: space.md,
    footerBorder: "border-border",
  },
  form: {
    inputMinHeight: 48,
    inputRadius: radius.md,
    inputClass: "min-h-12 rounded-xl border-border bg-muted/40",
  },
  typography: {
    screenTitle: "headlineSmall" as const,
    sectionTitle: "titleMedium" as const,
    body: "bodyMedium" as const,
    label: "labelLarge" as const,
    meta: "labelSmall" as const,
  },
  motion: {
    sheetDurationMs: 220,
  },
} as const;

export type KuriosityDesign = typeof kuriosityDesign;
