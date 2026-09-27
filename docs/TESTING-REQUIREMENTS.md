# Testing requirements (Kuriosity / family-tree-structure)

This guide maps **product behavior** from `docs/GAPS.md` and Kuriosity slices to **automated checks** so you can validate functional processes without manually tapping every screen.

## Test pyramid for this repo

```
                    ┌─────────────┐
                    │   Maestro   │  Device E2E (smoke flows, testID contracts)
                    └──────┬──────┘
               ┌───────────┴───────────┐
               │  family-tree-app Jest │  Mobile lib, mappers, kinship, form logic
               └───────────┬───────────┘
          ┌────────────────┴────────────────┐
          │  Root Jest (`npm test`)         │  `shared/` pure layout, archive, kinship
          └────────────────┬────────────────┘
     ┌───────────────────┴───────────────────┐
     │  Next.js / Prisma tests (same root)   │  Web reporting, household, huge demo
     └───────────────────────────────────────┘
```

| Layer | Command | What belongs here |
|-------|---------|-------------------|
| **Shared unit** | `npm test` (repo root) | `shared/marriageTreeLayout.ts`, `shared/archiveQuery.ts`, `shared/pedigreeConnectors.ts`, `shared/humanKinshipLabel.ts`, `shared/unknownCoParent.ts` |
| **Mobile unit** | `cd family-tree-app && npm test` | `lib/kinship/*`, `lib/rules/*`, `lib/data/*` mappers, `lib/members/*` form mapping, Maestro contract test |
| **Maestro E2E** | `cd family-tree-app && npm run test:e2e:smoke` | Onboarding, add member, tree navigation — needs emulator/device |
| **Typecheck** | `npm run typecheck` (root), `cd family-tree-app && npx tsc --noEmit` | Catches broken imports between `shared/` and mobile |

### What **not** to unit test

- **Gluestack / NativeWind pixel layout** — spacing, shadows, and theme tokens are covered by design review and Maestro smoke, not Jest snapshots of RN views.
- **Full SQLite migrations** in every PR — use targeted repository tests when an in-memory or fixture DB exists; otherwise test pure functions extracted to `shared/` or `lib/rules/`.
- **Expo Router screen wiring** — prefer testing the hook/service the screen calls (`useMemberProfileScreen` logic lives in `personService`, `parentAssignService`, kinship modules).

---

## Kuriosity requirement → test mapping

Statuses: **Covered** = existing test file locks behavior; **Gap** = critical path with no dedicated test (add when fixing bugs).

| Priority | Kuriosity requirement | Primary code | Test(s) | Status |
|----------|----------------------|--------------|---------|--------|
| P0 | Add parent **link-only** (no inline create) | `lib/data/parentAssignService.ts`, profile/tree sheets | `family-tree-app/__tests__/parentAssignService.test.ts` (unknown co-parent pairing) | Partial — UI flow is Maestro |
| P0 | **Gender** chips on create/edit | `PersonFields`, `memberProfileEditForm` | `memberProfileEditForm.test.ts`, `memberPickerSubtitle.test.ts` | Partial |
| P0 | Shared **PersonFields** on add child/spouse/member | `components/forms/*` | `addChildBirthDate.test.ts`, `memberProfileEditForm.test.ts` | Partial |
| P0 | **Nickname** on create + picker search | `onlinePersonMapper`, members list | `onlinePersonMapper.test.ts`, `normalizeMobilePersonDetails.test.ts` | Partial |
| P0 | **Online** read/create mapping | `lib/data/onlinePersonMapper.ts` | `onlinePersonMapper.test.ts` | Covered |
| P0 | Tree **wing layout** (husband left, wife right; sibs on partner wing) | `shared/marriageTreeLayout.ts` | `shared/marriageTreeLayout.test.ts` | Covered |
| P0 | Tree **v7 connectors** (orthogonal spouse/parent lines) | `shared/pedigreeConnectors.ts` | `shared/pedigreeConnectors.test.ts` | Covered |
| P0 | Pedigree **card layout tokens** | `shared/pedigreeLayoutTokens.ts` | `shared/pedigreeTheme.test.ts`, connector tests | Covered |
| P0 | **Find relation** path enumeration | `lib/kinship/relationPaths.ts` | `relationPaths.test.ts`, `computeRelationFinderResult.test.ts` | Covered |
| P0 | Find relation **truncation** + summary message | `enumeratePathsOnGraph`, `computeRelationFinderResult` | `relationPaths.test.ts`, `computeRelationFinderResult.test.ts` | Covered |
| P0 | **Change parents** — couple picker assign | `assignParentsToCouple`, `parentCouples.ts` | `parentCouples.test.ts` (ordering/labels); **Gap:** `assignParentsToCouple` + SQLite write | Partial |
| P0 | **Unknown co-parent** when one parent known | `shared/unknownCoParent.ts` | `shared/unknownCoParent.test.ts`, `parentAssignService.test.ts` | Covered |
| P0 | Parent slots (father/mother merge) | `lib/rules/parentSlots.ts` | `parentSlots.test.ts` | Covered |
| P1 | Reports **custom AND query** | `shared/archiveQuery.ts` | `shared/archiveQuery.test.ts` | Covered |
| P1 | Reports **KPI strip** (Members, Living, Married, Divorces, Male, Female) | `lib/db/localReports.ts` | **Gap** — no `localReports.test.ts` yet | Gap |
| P1 | Reports filter application on SQLite list | `lib/reports/archiveMembers.ts` | **Gap** — needs in-memory DB or extracted pure KPI builder | Gap |
| — | **Data refresh** after mutations | `bumpDataRevision`, `LocalFamilyTree` `useMemo` deps | **Gap** — no React test; manual: edit person → tree key changes | Gap |
| — | Mobile graph build from local DB | `lib/graph/buildLocalFamilyGraph.ts` | **Gap** — integration-only today | Gap |
| — | Web household reports | `lib/household.ts` | `actions/reporting.test.ts` (root) | Covered (web) |

Epic and open slices: [`docs/GAPS.md`](./GAPS.md).

---

## How to run tests

From repository root:

```bash
npm test                 # shared/ + web lib tests (jest.config.mjs ignores family-tree-app/)
npm run typecheck        # Next.js / root TypeScript
```

Mobile app:

```bash
cd family-tree-app
npm test                 # __tests__/*.test.ts
npx tsc --noEmit         # Expo app + shared imports
npm run test:maestro:contracts   # testIDs referenced in Maestro flows exist
npm run test:e2e:smoke   # Maestro (device/emulator required)
```

CI expectation: both root and `family-tree-app` Jest suites pass on PRs that touch those trees.

---

## How to add a test when fixing a bug (red → green)

1. **Reproduce in a test first** — smallest surface: a pure function in `shared/` or `lib/kinship/` before a full screen.
2. **Use fixtures**, not production SQLite:
   - **Kinship graph:** build `KinshipPerson` + `KinshipUnionRecord` arrays (see `family-tree-app/__tests__/relationPaths.test.ts`).
   - **Layout graph:** minimal `unions` + `people` `Map` (see `shared/marriageTreeLayout.test.ts`).
   - **Archive filters:** plain person objects (see `shared/archiveQuery.test.ts`).
   - **Maestro:** add/extend flow YAML under `family-tree-app/maestro/flows/`; `maestroFlows.test.ts` guards testID drift.
3. **Mock dataset loaders** when testing find-relation orchestration:

```typescript
jest.mock("@/lib/db/kinshipLoader", () => ({
  loadKinshipDataset: () => ({ peopleById, allUnions }),
}));
```

4. Run the narrowest command, then both suites before push.

### Example tests to copy

| Scenario | File to copy |
|----------|----------------|
| Husband/wife wings and sibling X positions | `shared/marriageTreeLayout.test.ts` |
| Path DFS + truncation cap | `family-tree-app/__tests__/relationPaths.test.ts` |
| Find-relation message + summaries | `family-tree-app/__tests__/computeRelationFinderResult.test.ts` |
| Parent slot merge / gender split | `family-tree-app/__tests__/parentSlots.test.ts` |
| Reports AND clauses | `shared/archiveQuery.test.ts` |
| Couple picker row order (husband · wife) | `family-tree-app/__tests__/parentCouples.test.ts` |
| Maestro testID contract | `family-tree-app/__tests__/maestroFlows.test.ts` |

---

## Unit vs integration

| Approach | When to use |
|----------|-------------|
| **Pure unit (`shared/`, kinship graph)** | Default for layout, kinship labels, archive AND logic, unknown co-parent rules. Fast, no native modules. |
| **Mobile unit with mocks** | `computeRelationFinderResult`, `relationshipPath` — mock `loadKinshipDataset`. |
| **Repository / SQLite** | `listParentCoupleRows`, `assignLocalPersonToCouple`, `buildLocalReports` — prefer in-memory SQLite if/when the project adds a test helper (see `legacyDatabaseMigration.test.ts` for migration patterns). Until then, extract counting/filter logic to testable pure functions. |
| **Maestro** | End-to-end “user can complete flow” after unit coverage exists for the underlying rules. |

---

## Audit summary (gaps to close over time)

| Area | Risk | Suggested next test |
|------|------|---------------------|
| `family-tree-app/lib/db/parentCouples.ts` | `listParentCoupleRows` SQL + filters | SQLite fixture DB with 2 unions |
| `assignParentsToCouple` / `assignLocalPersonToCouple` | Wrong union attached to child | Integration test on fixture DB |
| `buildLocalFamilyGraph` | Tree screen wrong nodes after load | Mock `loadKinshipDataset` + assert node ids |
| `buildLocalReports` KPI math | Reports strip wrong counts | Extract `computeReportStats(rows)` or fixture DB test |
| `bumpDataRevision` | Stale tree after profile save | Component test on `LocalFamilyTree` memo deps or shallow hook test |
| `CoupleParentPickerSheet` | Presentation only | Maestro + `parentCouples` pure helpers |

When a Kuriosity issue is **P0**, add or extend a row in the mapping table above in the same PR as the fix.
