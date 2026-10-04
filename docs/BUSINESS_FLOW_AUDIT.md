# Business flow audit — local archive (pre-implementation)

**Scope:** Local SQLite only (no cloud). Aligns with [`REQUIREMENTS_FAMILY_TREE_MAP.md`](./REQUIREMENTS_FAMILY_TREE_MAP.md) and dual DB [`SQLITE_STORAGE.md`](./SQLITE_STORAGE.md).  
**Branch reviewed:** `cursor/family-tree-map-requirements-c2cc` (PR #24).

---

## Intended journeys (target state)

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

## What already works (✅)

| Flow | Status |
|------|--------|
| Live registration (no prefill) | Onboarding → private → `registerLocalAccount` (live lane only) |
| Demo seed (curated / huge) | Demo lane + `is_fixture` import |
| Tree marriage-row layout + load more | `marriageTreeLayout` + `LocalFamilyTree` |
| Live vs demo SQLite files | `kuriosity_live.db` / `kuriosity_demo.db` |
| Per-lane session + onboarding flags | SecureStore + AsyncStorage keys |
| Clear demo & restart | Wipes demo DB → onboarding |
| Erase live archive | Wipes live DB → onboarding |
| Sample guard | Seeds throw if not on demo lane |
| Huge demo relational integrity | Clan-forest only (unit test) |

---

## P0 — Breaks product honesty or data trust

| # | Gap | Where | Impact |
|---|-----|--------|--------|
| **P0-1** | **Fake Members always listed** | `app/(tabs)/members.tsx` merges `showcaseMemberRows` with SQLite rows on every load | User sees Kay, Margaret, etc. that are **not** in the DB; taps open mock profile or Account. Violates “no dummy mixed with real.” |
| **P0-2** | **Mock Margaret profile route** | `app/member/[personId].tsx` + `ShowcasePersonDetail` | `showcase-margaret-khan` bypasses SQLite entirely. |
| **P0-3** | **Members count inflated** | `showcaseMembersCount()` in members header | Count can reflect showcase defaults, not DB. |
| **P0-4** | **Backup/import ignores lane semantics** | `app/(tabs)/tools.tsx` | Export/import always uses **active** DB with no “Live vs Demo” warning; easy to import demo JSON into live while on wrong lane. |
| **P0-5** | **Recent people shared across lanes** | `lib/recentPeople.ts` single AsyncStorage key | Home “Recently viewed” can link to person IDs that do not exist in the current lane’s DB. |

---

## P1 — Core genealogy flows incomplete or confusing

| # | Gap | Notes |
|---|-----|--------|
| **P1-1** | **No global “you are on Demo” banner** | Lane switch only under Account; Tree/Home/Members look identical. Risk of editing demo thinking it is live. |
| **P1-2** | **Empty live tree guidance** | After register, tree shows one person only; no guided checklist (add spouse → parents → children) tied to tree map req. |
| **P1-3** | **Lane switch + tree focal** | `loadedCode` may stay on previous lane’s family code until user taps “center on my marriage”; needs reset on `setArchiveLane`. |
| **P1-4** | **Onboarding still offers cloud path** | Step `online` + Account “Family cloud” conflict with “no cloud work”; confuses testers. |
| **P1-5** | **Home notifications / stories** | `HomeTopBar` default badge `2`; `/notifications` + `/story/*` use showcase copy, not archive data. |
| **P1-6** | **Stats “Stories” on Home** | `mergeShowcaseStats` derives fictional story count from member count; no stories model in SQLite. |
| **P1-7** | **Manual adds on demo lane** | `createLocalMember` does not set `is_fixture`; user-added demo people are **not** distinguished from sample (`is_fixture=0`). Clear demo wipes **all** rows anyway, but req #12 implied marking sample only. |
| **P1-8** | **Register vs demo account** | Demo uses `seededArchiveSetup` (not `registerLocalAccount`); no in-app “sign in to demo” story—only Kay/demo onboarding paths. |

---

## P2 — Tree map & genealogy depth

| # | Gap | Notes |
|---|-----|--------|
| **P2-1** | **Focal = wife** | Layout uses husband-left / wife-right; ego on wife side is correct but “person always visually center” may feel off—confirm with PO. |
| **P2-2** | **Multiple spouses** | Extra spouses extend marriage row; children column grouping per union—verify UX with 2+ active unions. |
| **P2-3** | **Sibling load-more** | `siblingSteps` expands ring; spouse siblings need both gens + siblingSteps—document in UI or auto-include spouse wing. |
| **P2-4** | **Unknown co-parent on canvas** | Supported in data layer; confirm tree card displays placeholder parent. |
| **P2-5** | **Dead code: ShowcasePedigreeTree** | `shouldShowShowcasePedigree` always false; tree branch still present. |

---

## P3 — QA & automation

| # | Gap | Notes |
|---|-----|--------|
| **P3-1** | **Maestro** | `01-onboarding-private-archive` assumes single DB; no flows for demo lane, lane switch, clear demo, tree load-more. |
| **P3-2** | **No E2E tree layout assertion** | Marriage positions covered in `shared` Jest only, not WebView canvas. |
| **P3-3** | **`wipeFixtureDataset` unused in UI** | Replaced by full demo reset; dead export or repurpose for “remove fixtures keep manual demo edits” (product decision). |

---

## Cloud / web (explicitly out of scope)

Per product: **no cloud implementation now.** Remaining online mode, WebView tree, and items in [`MOBILE_AUDIT_GAPS.md`](./MOBILE_AUDIT_GAPS.md) should be **hidden or read-only disabled** in mobile UI to avoid split-brain testing—not fixed in this phase unless PO asks.

---

## Recommended implementation order (next sprint)

| Wave | Status |
|------|--------|
| P0 showcase / dual DB / live-only backup | **Done** |
| P1 live checklist, home stats, notifications/stories, force local | **Done** |
| P3 Maestro dual-archive | **Done** (flows 09–12 + CI smoke 09/12) |

---

## Product decisions (locked)

1. **Demo lane** — sample data **plus add/edit** (sandbox).
2. **Backup / import** — **live archive only** (hard guard in UI + `importLocalDatabaseJson`).
3. **Demo Account** — keep **curated** and **huge ~2,500** loaders (relational).
4. **Clear demo** — full wipe → **onboarding** (not in-account-only).

---

## Suggested GitHub issues (when implementation starts)

- `[GAP][P0] Remove showcase members/mock profile from local archive UI`
- `[GAP][P0] Lane-aware backup, import, and recent people`
- `[GAP][P1] Demo lane chrome + tree focal reset on lane switch`
- `[GAP][P1] Hide family cloud paths (local-only phase)`
- `[GAP][P3] Maestro: dual archive + tree map smoke`
