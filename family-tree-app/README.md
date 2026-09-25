# Kuriosity Family Tree — Android (Expo)

React Native **Expo SDK 57** app (`family-tree-app`) by **Kuriosity Engineering**.

## UI

**Gluestack UI v5** + **NativeWind v5** with heritage tokens (`theme/appTheme.ts`, `theme/tokens.ts`, `theme/motion.ts`). React Native Paper was removed in Phase C — see [`docs/GLUESTACK_MIGRATION.md`](../docs/GLUESTACK_MIGRATION.md).

## Figma / mockups

Agent prompts: [`docs/prompts/KURIOSITY_FIGMA_IMPLEMENTATION_PROMPT.md`](../docs/prompts/KURIOSITY_FIGMA_IMPLEMENTATION_PROMPT.md) (full), [`SPRINT_1`](../docs/prompts/SPRINT_1_FIGMA_PROMPT.md), [`SPRINT_2`](../docs/prompts/SPRINT_2_FIGMA_PROMPT.md). Showcase copy lives in `lib/mock/kuriosityShowcase.ts`; HD PNGs in `docs/ui-samples/hd/`.

| Area | Path |
|------|------|
| Home (Figma layout) | `app/(tabs)/index.tsx`, `components/home/*` |
| Members (Figma) | `app/(tabs)/members.tsx`, `components/members/PersonRow.tsx` |
| Person showcase | `components/members/ShowcasePersonDetail.tsx`, id `showcase-margaret-khan` |
| Notifications / Story | `app/notifications.tsx`, `app/story/[storyId].tsx` |
| Design tokens | `global.css`, `theme/appTheme.ts`, `lib/design/kuriosityDesignSystem.ts` |

## Navigation

| Tab bar | Route | Notes |
|---------|--------|--------|
| Home | `/(tabs)/` | Stats, activity, search, add member CTA |
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
