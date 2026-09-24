# Gluestack UI (React Native) — migration

**App:** `family-tree-app` · Expo SDK 57 · **Gluestack UI v5 alpha** + **NativeWind v5**.

## Phase A — complete

- CLI init, `global.css`, Metro + Babel, `GluestackThemeProvider` beside Paper
- `components/ui/button` sample on Account

## Phase B — complete

| Area | Change |
|------|--------|
| **Sheets** | `FormBottomSheet` → Gluestack **Actionsheet** (+ backdrop, drag indicator, scroll) |
| **Fields** | `FormTextInput` → Gluestack **Input** / **InputField** (all call sites) |
| **Members** | `MembersSearchField` replaces Paper `Searchbar` |
| **Onboarding** | Register / cloud steps use Gluestack **Button** for primary actions |
| **Components** | `npx gluestack-ui add actionsheet input` |

Sheets still exposed as `FormBottomSheet` / `AppDialogForm` so screens did not need renames.

### Add more components

```bash
cd family-tree-app
npx gluestack-ui add checkbox radio -y --use-npm
```

## Phase C (next)

- `GenderField`, lists (`MemberCard`), tabs chrome → Gluestack
- Remove `react-native-paper` when coverage is complete

## Notes

- Jest mocks `@/global.css`; devDependency `@react-native/jest-preset` pinned for jest-expo.
- Preserve Maestro `testID`s when swapping controls.
