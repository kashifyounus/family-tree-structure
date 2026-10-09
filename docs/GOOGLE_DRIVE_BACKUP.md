# Google Drive backup (U2)

Android-only cloud backup uploads **two** files per run:

| File | Purpose |
|------|---------|
| `kuriosity-family-YYYY-MM-DD.db` | Full SQLite archive |
| `kuriosity-family-YYYY-MM-DD.json` | Portable JSON (same payload as Tools → Export) |

Local file export uses `kuriosity-family-backup.json`. Imports still accept legacy `mughals-family-backup.json` (`shared/backupArtifacts.ts`).

## OAuth setup (required per Android package id)

1. [Google Cloud Console](https://console.cloud.google.com/) → enable **Google Drive API**.
2. Create an **OAuth 2.0 Web client** → set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env` / EAS secrets (`family-tree-app/env.example`).
3. Create an **Android OAuth client** with your app package id (`com.kuriosity.engineering` after U1 — see `docs/APP_ID_MIGRATION.md`) and SHA-1:
   - Debug: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - Release: Play App Signing certificate SHA-1
4. Rebuild the APK/AAB after changing package id or SHA-1.

## Runtime behavior

- Scope: `drive.file` (files created by the app only).
- On HTTP **401**, the client refreshes the access token once and retries the upload.
- Missing `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` → user sees “Cloud backup is not set up for this build”.

## QA

- Live archive only (not demo lane).
- Sign in with Google → confirm both `.db` and `.json` appear in Drive.
- Export JSON locally → filename `kuriosity-family-backup.json`; restore still works with an old `mughals-family-backup.json` export.
