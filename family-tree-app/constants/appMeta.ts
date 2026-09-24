import Constants from "expo-constants";

/** Display name — keep in sync with `app.json` → `expo.name`. */
export const APP_NAME = "Mughal's Family Tree";

export const APP_TAGLINE =
  "Preserve your lineage, connect generations, and share your story with those you trust.";

export const APP_OWNER = "Kashif Younus";
export const APP_OWNER_EMAIL = "kashifyounus@mughals.local";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.4.0";

export const APP_BUILD_NUMBER = String(
  Constants.expoConfig?.android?.versionCode ?? 1,
);

/** Shown in Account and boot screen, e.g. `1.4.0 (5)`. */
export const APP_VERSION_LABEL = `${APP_VERSION} (${APP_BUILD_NUMBER})`;

export const DEFAULT_FAMILY_CODE = "FAM-10004";
