# Kuriosity Figma implementation status

Design reference: [Figma file](https://www.figma.com/design/12fvzMXqrDJ9JtbCiBT2P9) · HD PNGs: `docs/ui-samples/hd/`

| # | Screen | Status | Primary routes / components |
|---|--------|--------|---------------------------|
| 1 | Home | Done | `app/(tabs)/index.tsx`, `components/home/*` |
| 2 | Tree | Done (showcase ≤1 local member) | `ShowcasePedigreeTree`, `app/(tabs)/tree.tsx` |
| 3 | Members | Done | `app/(tabs)/members.tsx`, `PersonRow`, chips |
| 4 | Account | Done | `AccountProfileHero`, `AccountFigmaSections` |
| 5 | Add member | Done | `AddMemberBottomSheet`, `/add-member` |
| 6 | Person detail | Done (Margaret showcase) | `ShowcasePersonDetail`, `showcase-margaret-khan` |
| 7 | Notifications | Done | `app/notifications.tsx` |
| 8 | Story detail | Done | `app/story/[storyId].tsx` |

**Design system:** `global.css`, `theme/appTheme.ts`, `lib/design/kuriosityDesignSystem.ts` — primary `#1B4332`, background `#F6F1E7`, surface `#FFFDF8`.

**E2E:** `maestro/flows/08-figma-kuriosity-smoke.yaml`

**Agent prompts:** `docs/prompts/SPRINT_1` … `SPRINT_5`, full prompt in `KURIOSITY_FIGMA_IMPLEMENTATION_PROMPT.md`.
