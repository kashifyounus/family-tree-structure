# PR: Kuriosity Figma HD — 8 screens (sprints 1–5)

**Branch:** `cursor/figma-kuriosity-sprint5-8fed` → **`main`**

**Title:** `feat(mobile): Kuriosity Figma HD — 8 screens, sprints 1–5`

---

## Summary

Implements the **Kuriosity Family Tree** mobile UI from Figma ([design file](https://www.figma.com/design/12fvzMXqrDJ9JtbCiBT2P9), HD screens `node-id=10-10`) across **five sprints**. The Expo app uses **Gluestack UI v5 + NativeWind**, cream/forest tokens (`#F6F1E7` / `#1B4332`), and typed showcase data for Kay Hassan’s archive.

**Status checklist:** [`docs/FIGMA_IMPLEMENTATION_STATUS.md`](FIGMA_IMPLEMENTATION_STATUS.md) (all 8 target screens done).

## What’s included

### Sprint 1 — Home + tabs
- Figma-style **Home**: stats, activity, search, notifications bell, add-member CTA
- Tab bar active tint + dot indicator
- Routes: `/notifications`, `/story/lahore-wedding`
- Agent prompts under `docs/prompts/`

### Sprint 2 — Members + Margaret detail
- **Members** header, chips (All / Living / Generations), `PersonRow` + showcase rows
- **Margaret Khan** profile: About / Photos / Stories (`showcase-margaret-khan`)

### Sprint 3 — Account, Tree showcase, Add member
- **Account** hero (KH), archive toggle, preferences, sign out; **Advanced** for dev/storage
- **Tree**: `ShowcasePedigreeTree` when local archive has **≤1** member
- **`/add-member`** from Home

### Sprint 4 — Bottom sheets + archive settings + Maestro
- **Add member** `FormBottomSheet` + Figma nav (`add-member-sheet`)
- **`/archive-settings`**; Maestro `08-figma-kuriosity-smoke.yaml`

### Sprint 5 — Onboarding + polish
- **Start as Kay Hassan (preview)** — password `kuriosity`, email `kay.hassan@kuriosity.engineering`
- `ProfileSegmentBar`, `kuriosityFigmaParity.test.ts`

## Key paths

| Area | Location |
|------|----------|
| Mock data | `family-tree-app/lib/mock/kuriosityShowcase.ts` |
| Home | `family-tree-app/components/home/*` |
| Add member | `family-tree-app/components/members/AddMemberBottomSheet.tsx` |
| Tree showcase | `family-tree-app/components/tree/ShowcasePedigreeTree.tsx` |
| Tokens | `family-tree-app/global.css`, `theme/appTheme.ts`, `lib/design/kuriosityDesignSystem.ts` |

## Test plan

- [x] `cd family-tree-app && npm test`
- [ ] Onboarding → **Start as Kay Hassan** → Home / Tree / Members → Margaret → Story
- [ ] Home → Add member sheet → Save (local)
- [ ] Account → Archive settings
- [ ] `maestro test maestro/flows/08-figma-kuriosity-smoke.yaml` (device)

## Merge (maintainer)

```bash
git fetch origin
git checkout main
git pull origin main
git merge --no-ff origin/cursor/figma-kuriosity-sprint5-8fed -m "feat(mobile): Kuriosity Figma HD UI (sprints 1-5)"
git push origin main
```

Or open a PR on GitHub from `cursor/figma-kuriosity-sprint5-8fed` into `main` and paste this body.
