# Gluestack UI (React Native) — migration

**App:** `family-tree-app` · Expo SDK 57 · **Gluestack UI v5 alpha** + **NativeWind v5**.

## Phase A — complete

- CLI init, `global.css`, Metro + Babel, `GluestackThemeProvider`
- `components/ui/button` sample on Account

## Phase B — complete

| Area | Change |
|------|--------|
| **Sheets** | `FormBottomSheet` → Gluestack **Actionsheet** (+ backdrop, drag indicator, scroll) |
| **Fields** | `FormTextInput` → Gluestack **Input** / **InputField** (all call sites) |
| **Members** | `MembersSearchField` replaces legacy search bar |
| **Onboarding** | Register / cloud steps use Gluestack **Button** for primary actions |
| **Components** | `npx gluestack-ui add actionsheet input` |

Sheets still exposed as `FormBottomSheet` / `AppDialogForm` so screens did not need renames.

## Phase C — complete

- Removed **react-native-paper**; app root uses `GluestackThemeProvider` only
- Theme: `theme/appTheme.ts` + `useAppTheme()` (replaces Paper `useTheme`)
- Primitives: `AppText`, `AppCard`, `InfoBanner`, `SegmentedControl`, `FloatingActionButton`, `ListRow`, `ProgressBar`, Gluestack **Badge**, **Switch**, **Spinner**, **Divider**
- All tab screens, member/marriage flows, onboarding, tools, reports, tree, and security lock screen migrated

### Add more components

```bash
cd family-tree-app
npx gluestack-ui add checkbox radio -y --use-npm
```

## Notes

- Jest mocks `@/global.css`; devDependency `@react-native/jest-preset` pinned for jest-expo.
- Preserve Maestro `testID`s when swapping controls.
- Mobile HTTP contracts: see `docs/MOBILE_API.md` and `shared/mobilePersonDetails.ts`.
