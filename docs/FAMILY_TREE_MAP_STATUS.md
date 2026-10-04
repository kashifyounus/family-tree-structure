# Family tree map program — status tracker

**Branch:** `cursor/family-tree-map-requirements-c2cc`  
**PR:** [#24](https://github.com/kashifyounus/family-tree-structure/pull/24)  
**Last updated:** 2026-10-04

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
| R13 | Verification | in_work | Automated tests green; PO device sign-off pending |

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
| T8 | WebView pixel layout E2E | pending | |

---

## QA & CI (P3)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| Q1 | `marriageTreeLayout` + app Jest | done | 61+ tests |
| Q2 | `treeLayoutContract.test.ts` | done | |
| Q3 | Maestro flows 01, 09–12, 06, 07 | done | Contracts in CI |
| Q4 | Mobile `tsc --noEmit` in CI | done | `npm run typecheck` + contract test Gender fix |
| Q5 | Emulator Maestro on PR | pending | Runs on `main` job only |
| Q6 | `wipeFixtureDataset` UI | pending | Not product path |

---

## Ship

| ID | Item | Status | Notes |
|----|------|--------|-------|
| S1 | All CI green on PR | done | Web + mobile + Maestro contracts |
| S2 | PR ready for review | done | Draft cleared when CI green |
| S3 | Merge to `main` | in_work | Squash merge when CI green |
| S4 | PO device smoke | pending | Human |

---

## Out of scope (this phase)

| ID | Item | Status |
|----|------|--------|
| O1 | Cloud / online mutations | pending (deferred) |
| O2 | GAPS epic #10 (Drive, package id, v6 tree, …) | pending |
