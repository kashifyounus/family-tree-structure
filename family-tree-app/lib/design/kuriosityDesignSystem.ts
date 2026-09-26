import { semantic } from "@/theme/appTheme";
import { layout, radius, space } from "@/theme/tokens";
import { kuriosityPedigreeTheme } from "../../../shared/pedigreeTheme";

/**
 * Single source for Kuriosity mobile UI patterns (Gluestack + NativeWind).
 * Use these constants in mockups and new screens so UX stays consistent.
 */
export const kuriosityDesign = {
  brand: {
    name: "Kuriosity Family Tree",
    primary: semantic.primary,
    secondary: semantic.secondary,
    pedigreeCanvas: kuriosityPedigreeTheme.canvasBackground,
  },
  pedigree: {
    maleAccent: "#7eb6e0",
    femaleAccent: "#f4a6c1",
    neutralAccent: "#c4c4c4",
    connector: kuriosityPedigreeTheme.connector,
    cardWidth: kuriosityPedigreeTheme.cardWidth,
    cardMinHeight: kuriosityPedigreeTheme.cardHeight,
  },
  sheet: {
    topRadius: radius.xl,
    handleWidth: 48,
    handleHeight: 4,
    contentPaddingX: layout.screenPaddingX,
    fieldGap: space.md,
    footerBorder: "border-border",
  },
  colors: {
    selectedRowFill: "#E8F0EA",
    cardPadding: 14,
    sectionGap: space.md,
  },
  form: {
    inputMinHeight: 48,
    inputRadius: radius.md,
    inputClass: "min-h-12 rounded-xl border-border bg-muted/40",
    chipMinHeight: 36,
    primaryCtaMinHeight: 48,
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
