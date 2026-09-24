# Gluestack UI (React Native) — migration

**App:** `family-tree-app` · Expo SDK 57 · **Gluestack UI v5 alpha** + **NativeWind v5** (Tailwind v4).

## Phase A — complete

| Item | Location |
|------|----------|
| CLI init | `npx gluestack-ui init --nativewind -y` |
| Global CSS + tokens | `global.css` (Kuriosity primary `#1B4332`) |
| Metro | `metro.config.js` → `withNativewind` + `../shared` watch folder |
| Babel | `babel.config.js` → `nativewind/babel`, `module-resolver` |
| Provider | `GluestackThemeProvider` wraps Paper in `AppProviders.tsx` |
| Sample component | `components/ui/button` — used on Account → **Remove sample data** |
| Paper coexistence | All existing screens unchanged; new UI should import from `@/components/ui/button` etc. |

### Add more components

```bash
cd family-tree-app
npx gluestack-ui add input actionsheet -y --use-npm
```

### Usage pattern

```tsx
import { Button, ButtonText } from "@/components/ui/button";

<Button variant="default" onPress={onSave}>
  <ButtonText>Save</ButtonText>
</Button>
```

## Phase B (next)

- `FormBottomSheet` → Gluestack Actionsheet / Modal
- Lists & inputs on Members / onboarding

## Phase C (later)

- Remove `react-native-paper` after screen-by-screen port
- Align MD3 tokens fully with `global.css` variables

## Notes

- Init fell back to **NativeWind v5** for Expo (CLI message).
- Jest mocks `@/global.css` in `jest.setup.js`.
- Maestro: keep `testID` when replacing controls.
