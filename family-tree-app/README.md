# Kuriosity Family Tree — Android (Expo)

React Native **Expo SDK 57** app (`family-tree-app`) by **Kuriosity Engineering**.

## UI

**Gluestack UI v5** + **NativeWind v5** with heritage tokens (`theme/appTheme.ts`, `theme/tokens.ts`, `theme/motion.ts`). React Native Paper was removed in Phase C — see [`docs/GLUESTACK_MIGRATION.md`](../docs/GLUESTACK_MIGRATION.md).

## Navigation

| Tab bar | Route | Notes |
|---------|--------|--------|
| Home | `/(tabs)/` | Search, shortcuts to tree, directory, insights |
| Tree | `/(tabs)/tree` | Local SQLite graph or online WebView / native graph |
| Members | `/(tabs)/members` | Directory (private archive or family cloud) |
| Account | `/(tabs)/account` | Mode, API URL, household profile, backup |

**Reports** and **Tools** open from Home (not on the tab bar).

## Data modes

- **Private archive** — SQLite on device; full local CRUD (members, marriages, children, parents, link-existing spouse/child).
- **Family cloud** — read + create member via Next.js mobile API; edits on web. Contract: [`docs/MOBILE_API.md`](../docs/MOBILE_API.md).

## Tests

```bash
npm test
npm run test:maestro:contracts   # Maestro YAML + testID cross-check (CI)
npm run test:e2e:smoke             # Device/emulator + Maestro CLI
```

Maestro flows and CI behaviour: [`maestro/README.md`](./maestro/README.md).

## Download APK (GitHub)

See **[RELEASE.md](./RELEASE.md)**.

## Build APK (local Gradle)

```bash
chmod +x scripts/build-apk-local.sh
./scripts/build-apk-local.sh
```

Output: `dist/Kuriosity-Family-Tree-<version>-release.apk`
