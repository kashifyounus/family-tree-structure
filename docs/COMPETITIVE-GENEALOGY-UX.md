# Competitive genealogy UX — Family Gem, MyHeritage, Kuriosity

**Audience:** product owner and agents prioritizing Kuriosity mobile + shared `shared/` behavior.

**Companion:** requirement IDs and test files live in [`docs/TESTING-REQUIREMENTS.md`](./TESTING-REQUIREMENTS.md). This doc does not replace acceptance criteria in GitHub `[GAP]` issues; it explains *why* we ship or defer features relative to common alternatives.

---

## 1. Purpose

We use this checklist to:

1. **Prioritize** — compare Kuriosity against apps families already know (simple on-device tools vs cloud-heavy suites).
2. **Avoid scope creep** — mark DNA, smart-match crawlers, and full cloud sync as explicit non-goals until architecture supports them (`docs/ARCHITECTURE_SYNC.md`).
3. **Map to tests** — every matrix row ties to a **requirement ID** (`F-*` forms/profile, `T-*` tree/find-relation, `R-*` reports) and the Jest/Maestro file that should lock behavior.

When debating a feature, ask: *Which competitor sets the expectation?* *Is Kuriosity **shipped**, **partial**, **planned**, or **out of scope**?* *Which test row must turn green in the same PR?*

---

## 2. Family Gem (mobile — simplicity benchmark)

Family Gem targets genealogists who want a **private, on-device** tree without a subscription cloud. Typical strengths:

| Area | Family Gem behavior (market norm) | Kuriosity today | Gap / note |
|------|-----------------------------------|-----------------|------------|
| **Storage** | Local database on phone; optional export | **Local-first SQLite** (`kuriosity_family.db`); exclusive local vs online read session | Matches intent; no merged sync (by design) |
| **GEDCOM** | Import/export for backup and desktop tools | **Planned P1** (backup slice in GAPS U2); import path not productized | Gap vs Gem power users |
| **Tree** | Simple **pedigree** with pan/zoom | **Cream pedigree canvas**, husband/wife wings, v7 orthogonal connectors (`shared/marriageTreeLayout`, `shared/pedigreeConnectors`) | **Shipped** — richer layout than Gem’s minimal chart |
| **Edit model** | Person-centric: tap person → edit | **Person profile** + sheets (`AddRelationSheet`, `PersonFields`); Tree CTA from profile | **Shipped**; P0 polish on shared fields ongoing |
| **Couples / parents** | Basic parent links | **Couple parent picker**, unknown co-parent, single-parent (`shared/unknownCoParent`) | **Shipped** — more explicit than Gem |
| **Reports** | Small set of list/stat reports | **Reports tab** with KPI strip, presets, custom AND query (`shared/archiveQuery`) | **Partial** — KPI SQLite tests still gap |
| **Find relation** | Often absent or basic | **Multi-path** enumerator + truncation + tree highlight | **Ahead of Gem** |
| **Cloud** | Usually none | **Read-mostly online** via Next.js API | Intentional differentiator vs Gem-only users |

**Takeaway:** Kuriosity already matches or exceeds Family Gem on tree clarity and relationship tools. Main Gem gaps to close: **GEDCOM/backup** (P1) and **reports test hardening** (P1).

---

## 3. MyHeritage (cloud suite — relationship clarity benchmark)

MyHeritage sets expectations for **synced trees**, discovery, and rich media. Kuriosity deliberately does not compete on the full suite.

| Area | MyHeritage behavior | Kuriosity | Classification |
|------|---------------------|-----------|----------------|
| **Cloud sync** | Automatic multi-device tree | **No background sync**; local XOR online read | **Intentional gap** — document in UI (`cloudReadOnly` copy) |
| **Tree views** | Pedigree, fan, descendants, etc. | **Pedigree + list mode**; WebView canvas local / embed online | **Partial** — fewer view modes |
| **Smart matches** | Record + tree suggestions | **Out of scope** | P2+ only if product bets on discovery |
| **Media** | Photos, scanners, tagging | **Limited** on mobile profile | **Partial** — not a P0 parity target |
| **Relationship finder** | Paths + labels | **Find relation** multi-path, human labels (`shared/humanKinshipLabel`) | **Shipped** core; distant cousin framing still open (GAPS) |
| **DNA** | Kits, ethnicity, matches | **Out of scope** | Not on roadmap |
| **Reports** | Large report gallery | **Local KPI + custom AND**; web has household reporting | **Partial** mobile vs rich web |
| **Hints / research** | Historical records integration | **Out of scope** for mobile v1 | Web/ecosystem separate |

**Takeaway:** Borrow **relationship clarity** (clear paths, plain-language kinship) without promising **sync, DNA, or record matching**. P2 “web parity” means read surfaces and shared domain rules—not cloning MyHeritage’s discovery stack.

---

## 4. Feature matrix

Status key: **Shipped** · **Partial** · **Planned** · **Out of scope**

| Feature | Family Gem | MyHeritage | Kuriosity |
|---------|------------|------------|-----------|
| Tree pedigree (focal person chart) | Shipped | Shipped | **Shipped** |
| Couple layout (husband left / wife right) | Partial / simple | Shipped | **Shipped** (`T-01`) |
| Sibling wings (sibs on partner side) | Partial | Shipped | **Shipped** (`T-01`) |
| Parent assign via **couple** picker | Basic | Shipped | **Shipped**; assign SQLite integration **Partial** (`F-10`) |
| Single parent + **unknown co-parent** | Varies | Shipped | **Shipped** (`F-11`) |
| **Find relation** multi-path + cap | Rare | Shipped | **Shipped** (`T-04`, `T-05`) |
| Find relation → tree path highlight | — | Shipped | **Shipped** (purple 6px; Maestro **Partial**) |
| **Local-first** mutations | Shipped | Partial (cloud) | **Shipped** |
| **Cloud read-only** online mode | — | Shipped | **Shipped** (`F-05`) |
| Reports KPI strip | Minimal | Shipped | **Partial** (`R-01` test gap) |
| Custom query **AND** filters | — | Shipped (richer) | **Shipped** (`R-02`) |
| **Nickname** create + search | Varies | Shipped | **Partial** (`F-04`) |
| Gender on create/edit | Varies | Shipped | **Partial** (`F-02`) |
| Shared **PersonFields** on add flows | — | — | **Partial** (`F-03`) |
| Add parent **link-only** (no inline create) | — | — | **Partial** (`F-01`; Maestro) |
| **GEDCOM** / full backup export | Shipped | Shipped | **Planned P1** (U2) |
| Tree **v7 connectors** + cream tokens | — | — | **Shipped** (`T-02`, `T-03`) |
| Data refresh after edit (`dataRevision`) | — | — | **Partial** (manual QA; test gap) |
| **Maestro** smoke (onboarding, add member, tree) | — | — | **Partial** (contracts covered) |
| Smart matches / record hints | — | Shipped | **Out of scope** |
| DNA | — | Shipped | **Out of scope** |
| Multi-tree / merge sync | Export only | Shipped | **Out of scope** (until API merge spec) |
| Fan / descendant-only views | Some | Shipped | **Planned P2** |
| Web household reports parity | — | Shipped | **Partial** (web **Shipped**; mobile local only) |

---

## 5. Kuriosity roadmap buckets

IDs reference the [requirement → test table](./TESTING-REQUIREMENTS.md#kuriosity-requirement--test-mapping). Add or extend that table when IDs change.

### P0 — polish (ship confidence; mostly tests + UI completeness)

| ID | Theme | Competitive driver |
|----|-------|-------------------|
| F-01 | Add parent link-only | MyHeritage parent UX without inline noise |
| F-02 | Gender chips | Table stakes vs both competitors |
| F-03 | Shared `PersonFields` on add child/spouse/member | Consistency (internal bar above Gem) |
| F-04 | Nickname create + picker search | MyHeritage-style discoverability |
| F-05 | Online read/create mapping | Cloud browse without false “sync” promise |
| F-10 | Change parents — couple assign + SQLite write tests | MyHeritage parent clarity |
| F-11 | Unknown co-parent | Single-parent families (Gem + MH) |
| F-12 | Parent slots merge | Correct father/mother display |
| T-01 | Wing layout + siblings | Pedigree readability |
| T-02 | v7 orthogonal connectors | Professional tree (above Gem) |
| T-03 | Pedigree card tokens | Brand consistency |
| T-04 | Find relation path enumeration | MyHeritage relationship finder |
| T-05 | Truncation + summary copy | Large-tree safety |
| — | Maestro smoke flows | Regression vs competitor “it just works” |

**Still open from GAPS:** v6 placement + marriage ghost labels; distant-cousin subgraph framing on find-relation → tree.

### P1 — reports & backup (Family Gem parity + trust)

| ID | Theme | Competitive driver |
|----|-------|-------------------|
| R-01 | Reports KPI strip on SQLite | Gem minimal reports + MH stats |
| R-02 | Custom AND query (already coded) | Power users |
| — | `localReports` / archive list tests | Close test gaps in TESTING-REQUIREMENTS |
| — | **Google Drive backup** (U2) | Gem GEDCOM/export expectation |
| — | GEDCOM import/export product path | Gem interchange |

### P2 — discovery & parity (optional bets)

| Theme | Notes |
|-------|--------|
| Smart matches / hints | Only if server-side catalog and legal/product review exist |
| Extra tree views (fan, descendants) | MyHeritage multi-view |
| Web ↔ mobile mutation parity | `ARCHITECTURE_SYNC` ordered API rollout |
| Hybrid tree embed when online | `TREE_VISUALIZATION.md` |

### Explicit out of scope (do not slip into P0/P1 without epic)

- DNA kits, ethnicity, genetic matches  
- Historical record subscriptions and automated smart matching  
- Background bidirectional sync / merged replica  
- Competing on media library depth (albums, face tagging)  

---

## 6. Test linkage

Requirement IDs are stable shorthand for the [TESTING-REQUIREMENTS mapping table](./TESTING-REQUIREMENTS.md#kuriosity-requirement--test-mapping).

| Matrix row | Req ID | Primary test file(s) |
|------------|--------|-------------------------|
| Couple layout + sibling wings | T-01 | `shared/marriageTreeLayout.test.ts` |
| Tree v7 connectors | T-02 | `shared/pedigreeConnectors.test.ts` |
| Pedigree card / theme tokens | T-03 | `shared/pedigreeTheme.test.ts` |
| Find relation paths | T-04 | `family-tree-app/__tests__/relationPaths.test.ts`, `computeRelationFinderResult.test.ts` |
| Find relation truncation / message | T-05 | same as T-04 |
| Add parent link-only | F-01 | `parentAssignService.test.ts` + Maestro (gap UI) |
| Gender chips | F-02 | `memberProfileEditForm.test.ts`, `memberPickerSubtitle.test.ts` |
| Shared PersonFields | F-03 | `addChildBirthDate.test.ts`, `memberProfileEditForm.test.ts` |
| Nickname | F-04 | `onlinePersonMapper.test.ts`, `normalizeMobilePersonDetails.test.ts` |
| Online read/create mapping | F-05 | `onlinePersonMapper.test.ts` |
| Change parents couple assign | F-10 | `parentCouples.test.ts` (**gap:** assign + SQLite) |
| Unknown co-parent | F-11 | `shared/unknownCoParent.test.ts`, `parentAssignService.test.ts` |
| Parent slots | F-12 | `parentSlots.test.ts` |
| Reports custom AND | R-02 | `shared/archiveQuery.test.ts` |
| Reports KPI strip | R-01 | **Gap:** add `localReports.test.ts` or pure KPI helper |
| Maestro smoke / testIDs | — | `family-tree-app/__tests__/maestroFlows.test.ts`, `maestro/flows/*` |
| Web household reports | — | `actions/reporting.test.ts` (repo root) |

When a matrix row moves from **Partial** → **Shipped**, update this table and the status column in §4 in the same PR as the test.

---

## 7. UX principles borrowed

**From Family Gem**

- **On-device trust** — the archive on the phone is clearly “mine”; editing works offline without account friction.
- **Small surface area** — one primary tree, person-tap to edit, avoid dashboard sprawl.
- **Export matters** — families expect to leave with their data (GEDCOM/backup is non-negotiable for parity).

**From MyHeritage**

- **Relationship clarity** — show *how* two people are related (multiple paths when needed), with human-readable labels—not internal codes on screen.
- **Couple-centric parents** — assign a child to a parental *pair* when both are known; handle half-siblings and step relations explicitly.
- **Visual pedigree discipline** — consistent spouse lines, parent connectors, and focal-person navigation (we use cream canvas + v7 connectors instead of their skin).

**Kuriosity-specific (keep)**

- **Local-first mutations, cloud read-only honesty** — never imply sync until merge exists.
- **Hide family codes in primary UI** — codes stay in Advanced/search; competitors rarely expose internal IDs.
- **Shared domain in `shared/`** — one layout/kinship/archive ruleset for mobile and web where possible.

---

## Related docs

- Agent backlog: [`docs/GAPS.md`](./GAPS.md)  
- Sync stance: [`docs/ARCHITECTURE_SYNC.md`](./ARCHITECTURE_SYNC.md)  
- Reports UX: [`docs/REPORTS-UX-NOTES.md`](./REPORTS-UX-NOTES.md)  
- Tree tech: [`docs/TREE_VISUALIZATION.md`](./TREE_VISUALIZATION.md)
