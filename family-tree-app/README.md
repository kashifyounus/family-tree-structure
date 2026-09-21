# Mughal's Family Tree — Android (Expo)

React Native **Expo SDK 57** app (`family-tree-app`) for the same backend as the Next.js web project.

## Features (v1)

- **Home** — shortcuts to tree and members
- **Members** — search directory via `/api/mobile/members`
- **Tree** — embedded web tree (`/tree/[code]`) optimized for mobile
- **Account** — sign-in (`kashifyounus@mughals.local` / `mughal`)

## Prerequisites

1. Web app running with PostgreSQL seeded (`npm run dev` from repo root).
2. Mobile API routes under `app/api/mobile/*` (included in monorepo).

## Configure API URL

```bash
cp .env.example .env
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

## Build APK (EAS — recommended)

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

## Tech stack

- Expo Router tabs
- `expo-secure-store` for auth token
- `react-native-webview` for the family tree canvas
