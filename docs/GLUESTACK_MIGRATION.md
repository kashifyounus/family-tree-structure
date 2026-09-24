# Gluestack UI (React Native) — compatibility notes

**Target:** Kuriosity Family Tree (`family-tree-app`, Expo SDK 57, React Native 0.79+).

## Current status

The app still uses **React Native Paper (MD3)** for production screens. New shared primitives (for example `FormBottomSheet`) use React Native core layout plus Paper actions until Gluestack is wired globally.

## Latest Gluestack (2026)

| Package | Role |
|---------|------|
| `gluestack-ui` v5 | CLI / project scaffolding |
| `@gluestack-ui/themed` | Pre-styled components (older v1 track) |
| Gluestack v2+ | **NativeWind** + copy-paste components |

Expo 57 is compatible with **NativeWind v4** and Gluestack’s NativeWind-based kits, but migration is **not a drop-in**: it requires `tailwind.config`, babel plugin, `GluestackUIProvider`, and replacing Paper tokens across ~40 screens.

## Recommended migration path

1. **Phase A — Provider only:** Add NativeWind + `GluestackUIProvider` beside Paper; new components use Gluestack.
2. **Phase B — Sheets & lists:** Replace `FormBottomSheet` internals with Gluestack `Actionsheet` / `Modal`.
3. **Phase C — Remove Paper:** Switch theme, inputs, buttons, and lists screen-by-screen (Account → Members → Profile → Tree).

## Risk

- Bundle size increases until Paper is removed.
- Maestro tests rely on `testID`s — preserve them when swapping components.

## Decision

Proceed with **phased migration** after UX sheets and parent picker ship on Paper. Revisit when you want a dedicated UI-only sprint.
