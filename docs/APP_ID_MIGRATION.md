# Kuriosity app id migration (U1)

**Legacy:** `com.mughals.familytree`  
**Active (U1 release):** `com.kuriosity.engineering`

`family-tree-app/app.json`, Maestro flows, and `constants/packageIdentity.ts` use the active id. Treat this as a **new install** on device stores (no in-place upgrade from the legacy package).

## Pre-release checklist (users & QA)

1. **Backup:** Export private archive (JSON) via Tools / Archive settings; verify restore on a test device with the **new** package build.
2. **Uninstall legacy app** before installing U1 if testing on the same device (different `applicationId` / bundle id).

## Store & build

| Platform | Field | Value |
|----------|--------|--------|
| Android | `expo.android.package` | `com.kuriosity.engineering` |
| Android | `versionCode` | bumped per release (U1: 22) |
| iOS | `expo.ios.bundleIdentifier` | `com.kuriosity.engineering` |

- **Android Play:** New listing or new application id in Play Console; staged rollout recommended.
- **iOS:** New bundle id → new App Store Connect app record if required; TestFlight with new identifier.

## Google OAuth (U2 — required before Drive sign-in works on new id)

Register OAuth client credentials for **`com.kuriosity.engineering`**:

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. **Android client:** Add package name `com.kuriosity.engineering` and SHA-1 fingerprints:
   - **Debug:** `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - **Release:** SHA-1 from your upload/release keystore (Play App Signing → App signing key certificate).
3. **Web client** (if used for Expo / backend): unchanged unless redirect URIs change.
4. Rebuild and verify Google Sign-In + Drive backup on a physical device or release build.

Until U2 is done, sign-in may fail on builds using the new package id.

## Local data & keys (separate follow-ups)

- **SQLite:** `kuriosity_family.db` with legacy `mughals_family.db` migrate-on-launch (see `docs/SQLITE_STORAGE.md`).
- **AsyncStorage / SecureStore:** `kuriosity_*` / `@kuriosity/*` keys with migrate-on-read from legacy `mughals_*` (`lib/storage/legacyAsyncStorage.ts`, `legacySecureStore.ts`). New package id still starts with empty storage unless users restore backup.
- **Backup filenames:** `kuriosity-family-backup.json` with legacy import (P1).

## Maestro / CI

- Default `MAESTRO_APP_ID` / flow `appId`: `com.kuriosity.engineering`
- Override for legacy smoke: `MAESTRO_APP_ID=com.mughals.familytree` (only if an old build is installed).

## Rollback

Revert `app.json` package fields and Maestro `appId` to legacy; do not ship mixed ids in one store build.
