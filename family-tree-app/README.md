# Mughal's Family Tree — Android (Expo)

React Native **Expo SDK 57** app (`family-tree-app`) for the same backend as the Next.js web project.

## UI (React Native Paper)

The app uses **Material Design 3** via `react-native-paper` with a shared Mughal palette (`theme/paperTheme.ts`), layout tokens (`theme/tokens.ts`), and motion timings (`theme/motion.ts`). Reusable building blocks live under `components/ui/` (`Screen`, `SectionCard`, `PageHeader`, `FormTextInput`, `GenderField`, `ActionTile`, `AppDialogForm`, `EmptyState`, `LoadingView`, `ReferenceText`). Import from `@/components/ui` or individual files.

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
- **Account** — storage mode, **family website address (saved on device, change anytime)**, demo seed, server sign-in when online

## Prerequisites

1. Web app running with PostgreSQL seeded (`npm run dev` from repo root).
2. Mobile API routes under `app/api/mobile/*` (included in monorepo).

## Storage modes

| Mode | Data lives | Internet | Edits on phone |
|------|------------|----------|----------------|
| **Local SQLite** | This device only | Not required | Add/delete members; demo seed |
| **Online API** | Server PostgreSQL | Required | Read via API; use web dashboard for full CRUD |

Default on first launch: **Local SQLite**.

## Family website address (online mode)

**You do not need to bake the server URL into the APK.** The app stores the address in AsyncStorage and you can change it anytime:

1. Account → **Shared online**
2. Enter the family website address (e.g. `https://your-family.vercel.app` or `http://192.168.1.5:3000` on your home network)
3. **Test connection** → **Save address**
4. Sign in with your family cloud account

Optional: set a **default** in `.env` for development (`EXPO_PUBLIC_API_URL`) so Expo Go and first launch pre-fill the field. Restart Expo after changing env vars.

| Scenario | Example URL |
|----------|-------------|
| Android emulator | `http://10.0.2.2:3000` |
| Phone on same Wi‑Fi as dev machine | `http://<your-computer-ip>:3000` |
| Hosted site | `https://…` |

```bash
cp env.example .env
# optional default for dev
```

## Run in development

```bash
cd family-tree-app
npm install
npx expo start
```

Press `a` for Android emulator or scan QR with Expo Go.

## Download APK (GitHub)

See **[RELEASE.md](./RELEASE.md)** — CI builds a release APK on each `app-v*` tag and on manual workflow runs. Download the artifact from GitHub Actions or the Releases page.

## Build APK (local Gradle — no EAS)

This project is set up for **local Android release builds** (no Expo Application Services required).

1. Install **Android SDK** (Android Studio or [command-line tools](https://developer.android.com/studio#command-tools)) and set `ANDROID_HOME`.
2. Optional: copy `env.example` → `.env` and set `EXPO_PUBLIC_API_URL` only if you want a default address in dev builds.
3. Build:

```bash
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

Output: `android/app/build/outputs/apk/release/app-release.apk` and a copy under `dist/`.

Install: `adb install -r dist/Mughals-Family-Tree-*-release.apk`

**Note:** Release builds use the debug keystore from the generated `android/` project (fine for family sideloading). For Play Store distribution, configure your own release keystore in Gradle.

**After install:** Use Account → Shared online to set or change the family website address; private archive mode works fully offline without any URL.

## UI & architecture (v1.1)

- **[React Native Paper](https://callstack.github.io/react-native-paper/)** (Material Design 3) — single open-source UI system
- Reusable `Screen`, `AppCard`, `BrandLogo` components
- **Onboarding** — SQLite vs API, local registration + focal member, optional server sign-in
- **Error handling** — `AppError`, global snackbar feedback, root error boundary
- **Google Drive backup** (Android) — native sign-in + SQLite file upload (`Tools` tab)
- **Jest** — `npm test` in `family-tree-app`
- **Maestro** — `npm run test:e2e` (Android UI smoke flows; see `maestro/README.md`)

## Tech stack

- Expo Router tabs
- `expo-secure-store` for auth token
- `react-native-webview` for the family tree canvas
