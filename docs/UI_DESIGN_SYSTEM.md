# Kuriosity mobile UI design system (Gluestack)

**App:** `family-tree-app` · Gluestack UI v5 + NativeWind · tokens in `global.css` and `theme/appTheme.ts`.

## Principles

1. **One brand** — forest green `#1B4332`, warm cream surfaces (`#f6f1e7` / `#fffdf8`), brown secondary accents.
2. **Sheets, not dialogs** — create/edit flows use `FormBottomSheet` (Actionsheet): full width, top radius only, sticky footer.
3. **Forms** — `FormTextInput` (min height 48, `rounded-xl`, muted fill) + `GenderField` (Gluestack `RadioGroup`).
4. **Pedigree** — light canvas `#f3f4f6`, `PedigreePersonCard` / canvas tree share gender stripe + initials + focal ring.
5. **Navigation** — tab screens use `Screen` + `PageHeader`; lists use `ListRow`; primary actions use Gluestack `Button`.

## Code map

| Concern | Location |
|--------|----------|
| Design tokens (JS) | `family-tree-app/lib/design/kuriosityDesignSystem.ts` |
| CSS variables | `family-tree-app/global.css` |
| Live mockups (real components) | `family-tree-app/app/design-gallery.tsx` |
| Mockup compositions | `family-tree-app/components/design/DesignGalleryMockups.tsx` |
| Pedigree card | `family-tree-app/components/tree/PedigreePersonCard.tsx` |
| Bottom sheet forms | `family-tree-app/components/ui/FormBottomSheet.tsx` |

## View mockups in the app

1. Run the app (`npx expo start` in `family-tree-app`).
2. **Account** → **UI / UX gallery (Gluestack mockups)**  
   Or open route: `/design-gallery`.

Screens included: onboarding, home, tree, members, member profile, bottom-sheet form, account, and primitive strip.

## Static HTML (legacy)

`docs/ui-samples/mobile-ui-preview.html` — quick browser sketch; prefer **design-gallery** for accurate Gluestack rendering.

## Export screenshots

With the app on web or device, scroll the gallery and capture frames. Optional: add Maestro flow targeting `testID="design-gallery"` and child `mockup-*` IDs.
