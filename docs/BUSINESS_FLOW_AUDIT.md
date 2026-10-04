# Business flow audit — local archive

**Scope:** Local SQLite only (no cloud). Aligns with [`REQUIREMENTS_FAMILY_TREE_MAP.md`](./REQUIREMENTS_FAMILY_TREE_MAP.md) and dual DB [`SQLITE_STORAGE.md`](./SQLITE_STORAGE.md).  
**Last updated:** post PR #24 (`cursor/family-tree-map-requirements-c2cc`).

---

## Intended journeys

```mermaid
flowchart TD
  subgraph onboarding [Onboarding]
    A[App launch] --> B{Lane onboarding complete?}
    B -->|No| C[Onboarding screen]
    C --> D[Private archive → Live DB + register]
    C --> E[Kay / Load demo → Demo DB + seed]
    B -->|Yes| F[(tabs)]
  end

  subgraph live [Live lane - kuriosity_live.db]
    D --> F
    F --> G[Add members / relations]
    G --> H[Tree focal = session or tapped person]
    F --> I[Backup export/import]
  end

  subgraph demo [Demo lane - kuriosity_demo.db]
    E --> F
    F --> J[Load curated or huge sample]
    J --> H
    F --> K[Clear demo → empty demo DB + onboarding]
  end

  F --> L[Account: switch Live | Demo]
  L --> M{Other lane onboarded?}
  M -->|No| C
  M -->|Yes| F
```

---

## Shipped flows

| Flow | Implementation |
|------|----------------|
| Live registration (no prefill) | Onboarding → private → `registerLocalAccount` (live lane only) |
| Demo seed (curated / huge) | Demo lane + `is_fixture` import |
| Tree marriage-row layout + load more | `marriageTreeLayout` + `LocalFamilyTree` |
| Live vs demo SQLite files | `kuriosity_live.db` / `kuriosity_demo.db` |
| Per-lane session + onboarding flags | SecureStore + AsyncStorage keys |
| Clear demo & restart | Wipes demo DB → onboarding |
| Erase live archive | Wipes live DB → onboarding |
| Sample guard | Seeds throw if not on demo lane |
| Huge demo relational integrity | Clan-forest only (unit test) |
| Members tab honesty | SQLite-only list; no showcase merge |
| Member profile route | SQLite only (`useMemberProfileScreen`) |
| Lane-scoped recents | `@mughals/recent-people/v1/{live\|demo}` |
| Live-only backup/import | Tools UI + `assertLiveArchiveLane` on import |
| Demo lane chrome | `DemoArchiveBanner` on Home, Members, Tree, Tools |
| Live empty-archive guidance | `LiveArchiveChecklistCard` + tree visit flag |
| Tree focal on lane switch | `tree.tsx` resets `loadedCode` when `archiveLane` changes |
| Local-only phase | Boot forces local mode; cloud onboarding step removed |
| Honest home stats | Members / generations / marriages (no fictional stories) |
| Notifications & stories routes | Empty states (no showcase feed) |

---

## Resolved gaps (P0 / P1 / P3 wave)

| ID | Was | Resolution |
|----|-----|------------|
| P0-1–3 | Showcase members / mock Margaret / inflated counts | Removed from archive tabs and member route |
| P0-4 | Backup/import lane semantics | Live-only import; demo banner on Tools |
| P0-5 | Shared recents | Per-lane AsyncStorage key |
| P1-1 | No demo indicator | `DemoArchiveBanner` |
| P1-2 | Empty live tree | Live archive checklist on Home |
| P1-3 | Stale tree focal after lane switch | `useEffect` on `archiveLane` |
| P1-4 | Cloud onboarding | Removed / disabled for local-only phase |
| P1-5–6 | Fake notifications & story stats | Empty routes; real archive stats |
| P3-1 | Maestro single-DB only | Flows `09`–`12` (see automation notes below) |

**Accepted / not blocking**

| ID | Notes |
|----|--------|
| P1-7 | Manual demo adds stay `is_fixture=0`; **clear demo** wipes entire demo DB (locked decision). |
| P1-8 | Demo via Kay/onboarding seed paths only (no separate “demo sign-in”). |

---

## Open follow-ups

### P2 — Tree map & genealogy depth (verify with PO / manual QA)

| # | Topic | Notes |
|---|--------|--------|
| P2-1 | Focal = wife | Canvas `fitView` anchors on `focalPersonId`; parent framing includes both wings; focal ring only on ego. |
| P2-2 | Multiple spouses | Child columns centered under each focal+spouse pair (`marriageTreeLayout`). |
| P2-3 | Sibling load-more | `siblingSteps` expands hop depth (ego + spouse seeds). |
| P2-4 | Unknown co-parent on canvas | `pedigreeCanvasPayload` shows “Unknown” / “Parent” labels. |
| P2-5 | `ShowcasePedigreeTree` | **Removed** (showcase data remains in `kuriosityShowcase` for design tests). |

### P3 — QA & automation

| # | Topic | Notes |
|---|--------|--------|
| P3-2 | E2E tree layout | `treeLayoutContract.test.ts` + `marriageTreeLayout` Jest; Maestro `12` exercises all load-more buttons (no canvas pixel asserts). |
| P3-3 | `wipeFixtureDataset` | Unused in UI; full demo reset is the product path. |
| P3-4 | Maestro CI runtime | Emulator bundle: `01`, `09`, `10`, `11`, `12`, `06`, `07` (see `mobile-maestro.yml`). Longer CI time on main emulator job. |

### Engineering / out of scope (this phase)

- **Cloud / online mode** — code paths remain in tree/reports/account but mode is forced **local** at boot; see [`MOBILE_AUDIT_GAPS.md`](./MOBILE_AUDIT_GAPS.md).
- **Showcase modules** — `kuriosityShowcase.ts` retained for design parity tests, not archive UI.
- **Epic backlog** — see [`GAPS.md`](./GAPS.md) (v6 tree, Drive backup, package id, etc.).

---

## Product decisions (locked)

1. **Demo lane** — sample data **plus add/edit** (sandbox).
2. **Backup / import** — **live archive only** (hard guard in UI + `importLocalDatabaseJson`).
3. **Demo Account** — **curated** and **huge ~2,500** loaders (relational).
4. **Clear demo** — full wipe → **onboarding**.

---

## Implementation waves (complete)

| Wave | Status |
|------|--------|
| P0 showcase / dual DB / live-only backup | **Done** |
| P1 live checklist, home stats, notifications/stories, force local | **Done** |
| P3 Maestro dual-archive (flows + contract CI) | **Done** |
| Web graph types (`sibling` edges) | **Done** (`types/family.ts`) |
