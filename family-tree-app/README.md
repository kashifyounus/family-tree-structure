# Mughal's Family Tree — Android (Expo)

React Native **Expo SDK 57** app (`family-tree-app`) for the same backend as the Next.js web project.

## Features

- **6 tabs**: Home, Members, Tree, Reports, Tools, Account
- **Member profile** — view/edit (local), add spouse & child (local), computed kinship (online)
- **Reports** — city & age charts (local SQLite or online API)
- **Tools** — export/import JSON backup, member compare (local)
- **Pull-to-refresh** on member list
- **Dual storage** (Account tab):
  - **Local SQLite** — each device has its own `mughals_family.db` (offline, private)
  - **Online API** — shared **PostgreSQL** on the server (via Next.js `/api/mobile/*`, not direct DB from the phone)
- **Home** — shortcuts to tree and members
- **Members** — search; add/delete when in local mode
- **Tree** — local union/child summary (SQLite) or embedded web graph (online)
- **Account** — storage mode, API URL, demo seed, server sign-in when online

## Prerequisites

1. Web app running with PostgreSQL seeded (`npm run dev` from repo root).
2. Mobile API routes under `app/api/mobile/*` (included in monorepo).

## Storage modes

| Mode | Data lives | Internet | Edits on phone |
|------|------------|----------|----------------|
| **Local SQLite** | This device only | Not required | Add/delete members; demo seed |
| **Online API** | Server PostgreSQL | Required | Read via API; use web dashboard for full CRUD |

Default on first launch: **Local SQLite**.

## Configure API URL (online mode only)

```bash
cp env.example .env
```

Set `EXPO_PUBLIC_API_URL` to your reachable backend:

| Scenario | URL |
|----------|-----|
| Android emulator | `http://10.0.2.2:3000` |
| Expo Go on phone (LAN) | `http://<your-computer-ip>:3000` |
| Cloud / Vercel / tunnel | `https://…` |

Restart Expo after changing env vars.

## Run in development

```bash
cd family-tree-app
npm install
npx expo start
```

Press `a` for Android emulator or scan QR with Expo Go.

## Build APK

### Option A — EAS (recommended for sharing)

Requires a free [Expo](https://expo.dev) account.

```bash
npm install -g eas-cli
eas login
eas build:configure   # links Expo project, sets projectId in app.json
```

Set `EXPO_PUBLIC_API_URL` in `eas.json` `preview.env` or EAS dashboard secrets, then:

```bash
eas build -p android --profile preview
```

When the build finishes, download the **APK** from the Expo dashboard.

### Option B — Local Gradle (no Expo login)

1. Install **Android SDK** (Android Studio or [command-line tools](https://developer.android.com/studio#command-tools)) and set `ANDROID_HOME`.
2. Set your backend URL (baked into the JS bundle at build time):

```bash
cp env.example .env
# edit EXPO_PUBLIC_API_URL — use https://your-site.com or http://YOUR_LAN_IP:3000
```

3. Build:

```bash
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

Output: `android/app/build/outputs/apk/release/app-release.apk` (~100 MB universal APK).

**Note:** Release builds use the debug keystore from the generated `android/` project (fine for family testing). For Play Store, configure a release keystore and use EAS or your own signing.

**Online API after install:** You can also change the API URL in the app **Account** tab without rebuilding; local SQLite mode works fully offline.

## Tech stack

- Expo Router tabs
- `expo-secure-store` for auth token
- `react-native-webview` for the family tree canvas
