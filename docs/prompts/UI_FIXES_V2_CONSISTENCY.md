# Kuriosity Family Tree — UI Fixes v2 (consistency-first)

Paste to coding agents. **This repo uses Gluestack UI v5 + expo-router** (not v2 / React Navigation filenames).

Figma: https://www.figma.com/design/12fvzMXqrDJ9JtbCiBT2P9  
Mockups: `docs/ui-samples/hd/` (v2 folder when available)  
Visual source of truth: **Home** tab (`app/(tabs)/index.tsx`).

## Consistency rules (non-negotiable)

1. Theme tokens only — extend `global.css`, `theme/appTheme.ts`, `lib/design/kuriosityDesignSystem.ts` once.
2. Reuse shared components; no per-screen one-off styles.
3. Spacing: screen padding **20**, section gaps **12–16**, card padding **14**.
4. Radii: cards/inputs **xl (~16)**, pills **full**, avatars **circle**.
5. Heights: inputs/search **48**, primary CTA **48**, chips **36–40**.
6. Typography: title ~22 semibold, section ~15 semibold, body 15, labels 13 medium, captions 11–12 secondary.
7. Chrome: cream `#F6F1E7`, surface `#FFFDF8`, border `#DDD3C4`, primary `#1B4332`, body `#1A1814`, secondary `#5C5346`.
8. Soft shadows as Home/cards only.
9. Child / spouse / parent → **one** `AddRelationSheet` (Create | Link existing).
10. Dates → **one** `DatePickerField`; display `14 Mar 1975`, store ISO.

## Tokens

| Token | Value |
|--------|--------|
| Selected row | `#E8F0EA` |
| Husband lineage (tree) | soft blue top border |
| Wife lineage (tree) | soft pink top border |

## Fixes

1. **Tree** — married couple: his parents left, hers right, couple center + married pill, children below.
2. **Add relations** — shared sheet; empty last name on create; gender radios; wedding date for spouse; father/mother chips for parent; link list cards with green selection.
3. **Person profile** — spouse pill, parent pair cards, siblings table, clean About.
4. **Dates** — unified picker everywhere.

## Shared components

`Screen`, `SearchField`, `PrimaryButton`, `OutlineChip`, `PersonCardRow`, `SegmentedControl` / `ProfileSegmentBar`, `AddRelationSheet`, `DatePickerField`, `ParentPairCards`, `SiblingsTable`, `SpousePill`

## Done when

All fixes work; tree/profile/sheets match Home; no last-name autofill; searchable link lists; file list in PR.

Do not redesign Home / Members / Account / tabs unless aligning tokens.
