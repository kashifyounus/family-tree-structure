# Kuriosity Family Tree — Android (Expo)

React Native **Expo SDK 57** app by **Kuriosity Engineering** (`family-tree-app`).

## UI (React Native Paper)

Gluestack UI + NativeWind with a heritage palette (`theme/appTheme.ts`), layout tokens (`theme/tokens.ts`), and motion timings (`theme/motion.ts`).

## Features

- **6 tabs**: Home, Members, Tree, Reports, Tools, Account
- **Private SQLite** or **shared online** API
- **Configurable family website URL** in Account (no rebuild)
- Credits: **Kuriosity Engineering** · *by Kashif Younus*

## Download APK (GitHub)

See **[RELEASE.md](./RELEASE.md)**.

## Build APK (local Gradle)

```bash
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

Output: `dist/Kuriosity-Family-Tree-<version>-release.apk`
