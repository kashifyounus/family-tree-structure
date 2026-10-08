# Family tree map program — status tracker

**Program:** merged to `main` via [#24](https://github.com/kashifyounus/family-tree-structure/pull/24)  
**Follow-up:** [#26](https://github.com/kashifyounus/family-tree-structure/pull/26) merged (`caf3bfc`) — T8 tests + smoke doc  
**Last updated:** 2026-10-04  
**Device smoke:** [`DEVICE_SMOKE_FAMILY_TREE.md`](./DEVICE_SMOKE_FAMILY_TREE.md)

Status values: `done` | `in_work` | `pending`

---

## Stakeholder requirements

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| R1 | Marriage row (person + spouse) | done | `marriageTreeLayout` |
| R2 | Children below couple | done | |
| R3 | Person siblings (left wing) | done | |
| R4 | Spouse siblings (right wing) | done | |
| R5 | Parents above each side | done | Both wings on mobile (`phoneSingleParentSide: false`) |
| R6 | Load more relations | done | `tree-load-parents/siblings/children` |
| R7 | Fresh empty DB (live/demo) | done | `kuriosity_live.db` / `kuriosity_demo.db` |
| R8 | Onboarding, no private prefill | done | |
| R9 | Complete sample data | done | Curated + huge relational demo |
| R10 | Clear demo / start again | done | Full wipe → onboarding |
| R11 | Live/demo never mixed | done | Lane guards + separate files |
| R12 | Sample `is_fixture=1` | done | Manual demo adds `is_fixture=0` (accepted) |
| R13 | Verification | in_work | Automated + layout contract tests; PO sign-off via [`DEVICE_SMOKE_FAMILY_TREE.md`](./DEVICE_SMOKE_FAMILY_TREE.md) |

---

## Archive honesty (P0 / P1)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| A1 | SQLite-only Members / profile | done | |
| A2 | Lane-scoped recents | done | |
| A3 | Live-only backup/import | done | |
| A4 | Demo banner | done | |
| A5 | Live checklist + tree visit flag | done | |
| A6 | Tree focal on lane switch | done | |
| A7 | Force local; hide cloud onboarding | done | |
| A8 | Honest home / notifications / stories | done | |

---

## Tree depth & polish (P2)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| T1 | Focal wife + canvas center on ego | done | `fitView` + framing; PO feel-check pending |
| T2 | Multi-spouse child columns | done | |
| T3 | Multi-spouse marriage band labels | done | `focalMarriageBands` / `marriageBands[]` |
| T4 | Sibling load-more depth | done | `siblingSteps` hops |
| T5 | Unknown co-parent on canvas | done | Unknown / Parent labels |
| T6 | Remove `ShowcasePedigreeTree` | done | |
| T7 | Adjacent-only marriage bands (no span across spouse) | done | `marriageBandForPartnerOnRow` |
| T8 | Canvas layout contract (bands/geometry) | done | `pedigreeCanvasLayout.test.ts` (not pixel/WebView E2E) |

---

## QA & CI (P3)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| Q1 | `marriageTreeLayout` + app Jest | done | 61+ tests |
| Q2 | `treeLayoutContract.test.ts` | done | |
| Q3 | Maestro flows 01, 09–12, 06, 07 | done | Contracts in CI |
| Q4 | Mobile `tsc --noEmit` in CI | done | `npm run typecheck` + contract test Gender fix |
| Q5 | Emulator Maestro on `main` push | in_work | [`QA_MAESTRO_Q5.md`](./QA_MAESTRO_Q5.md); NavigationGate overlay fix + flow 08 after 09 in CI; KVM/device for stable emu |
| Q6 | `wipeFixtureDataset` UI | deferred | Full demo wipe is product path |

---

## Ship

| ID | Item | Status | Notes |
|----|------|--------|-------|
| S1 | All CI green on PR | done | Web + mobile + Maestro contracts |
| S2 | PR ready for review | done | Draft cleared when CI green |
| S3 | Merge to `main` | done | `5362339` squash merge PR #24 |
| S4a | Automated smoke (`npm run test:smoke` + CI) | done | See [`DEVICE_SMOKE_FAMILY_TREE.md`](./DEVICE_SMOKE_FAMILY_TREE.md) |
| S4 | PO device smoke (manual checklist) | pending | Human sign-off table in smoke doc |

---

## Out of scope (this phase)

| ID | Item | Status |
|----|------|--------|
| O1 | Cloud / online mutations | pending (deferred) |
| O2 | GAPS epic #10 (Drive, package id, v6 tree, …) | pending |
