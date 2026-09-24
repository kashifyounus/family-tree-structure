import Constants from "expo-constants";

/** Display name — keep in sync with `app.json` → `expo.name`. */
export const APP_NAME = "Kuriosity Family Tree";

export const APP_COMPANY = "Kuriosity Engineering";
export const APP_COMPANY_SHORT = "K.E";

export const APP_TAGLINE =
  "Preserve your lineage, connect generations, and share your story with those you trust.";

export const APP_CREDIT_SUBTITLE = "by Kashif Younus";
export const APP_OWNER = "Kashif Younus";
/** Demo / owner sign-in on web API matches `lib/auth.ts` (keep in sync for cloud sign-in). */
export const APP_OWNER_EMAIL = "kashifyounus@mughals.local";

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export const APP_BUILD_NUMBER = String(
  Constants.expoConfig?.android?.versionCode ?? 1,
);

/** Shown in Account and boot screen, e.g. `1.0.0 (6)`. */
export const APP_VERSION_LABEL = `${APP_VERSION} (${APP_BUILD_NUMBER})`;

export const DEFAULT_FAMILY_CODE = "FAM-10004";
