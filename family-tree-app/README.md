# Kuriosity Family Tree — Android (Expo)

React Native **Expo SDK 57** app (`family-tree-app`) by **Kuriosity Engineering**. On-device SQLite is `kuriosity_family.db` (legacy `mughals_family.db` is migrated away on launch). Android package id remains `com.mughals.familytree`; see [`docs/SQLITE_STORAGE.md`](../docs/SQLITE_STORAGE.md).

Cursor agents: open `[GAP]` backlog at [`/docs/GAPS.md`](../docs/GAPS.md) (repo root).

## UI

**Gluestack UI v5** + **NativeWind v5** with heritage tokens (`theme/appTheme.ts`, `theme/tokens.ts`, `theme/motion.ts`). React Native Paper was removed in Phase C — see [`docs/GLUESTACK_MIGRATION.md`](../docs/GLUESTACK_MIGRATION.md).

## Figma / mockups

Agent prompts: [`docs/prompts/KURIOSITY_FIGMA_IMPLEMENTATION_PROMPT.md`](../docs/prompts/KURIOSITY_FIGMA_IMPLEMENTATION_PROMPT.md) (full), Sprints [`1`](../docs/prompts/SPRINT_1_FIGMA_PROMPT.md)–[`5`](../docs/prompts/SPRINT_5_FIGMA_PROMPT.md). Status: [`docs/FIGMA_IMPLEMENTATION_STATUS.md`](../docs/FIGMA_IMPLEMENTATION_STATUS.md). Showcase copy lives in `lib/mock/kuriosityShowcase.ts`; HD PNGs in `docs/ui-samples/hd/`.

| Area | Path |
|------|------|
| Home (Figma layout) | `app/(tabs)/index.tsx`, `components/home/*` |
| Members (Figma) | `app/(tabs)/members.tsx`, `components/members/PersonRow.tsx` |
| Person profile | `app/member/[personId].tsx`, `lib/members/useMemberProfileScreen.ts`, `components/members/profile/*` |
| Person showcase | `components/members/ShowcasePersonDetail.tsx`, id `showcase-margaret-khan` |
| Account (Figma) | `components/account/*`, `app/(tabs)/account.tsx` |
| Add member sheet | `components/members/AddMemberBottomSheet.tsx`, route `app/add-member.tsx` |
| Archive settings | `app/archive-settings.tsx` |
| Tree showcase | `components/tree/ShowcasePedigreeTree.tsx` (empty local DB) |
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
