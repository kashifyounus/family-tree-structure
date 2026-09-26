# Kuriosity / family-tree-structure — agent gap backlog

> Cursor coding agents: **pick open GitHub issues titled `[GAP]…`**, prefer **`[GAP][P0]`** first, one PR per issue (or tightly related pair). Link the issue in the PR. Keep Kuriosity tokens: primary `#1B4332`, bg `#F6F1E7`, surface `#FFFDF8`.

Epic: https://github.com/kashifyounus/family-tree-structure/issues/10

## How to work

1. Read this file and the target issue acceptance criteria.
2. Investigate before changing; shared domain logic belongs in `shared/` when web + mobile both need it.
3. Do not invent a new visual language. Reuse Gluestack / existing sheets (`AddRelationSheet`, `DatePickerField`, `PersonCardRow`).
4. Run relevant tests (`shared` Jest, `family-tree-app` Jest) before opening the PR.
5. When done, check off acceptance criteria in the issue comment and close if fully met.

## Open work

| Issue | Title |
|------:|-------|
| [#10](https://github.com/kashifyounus/family-tree-structure/issues/10) | Epic — close when backlog is empty |

### P0 wave (forms / tree / find-relation) — partial in `1.0.7`

**Shipped in app 1.0.7:** Add parent link-only; gender chips; shared `PersonFields` on add child/spouse/member; nickname on create + picker search; tree v7 connector colors + name-only canvas; Reports tab visible; Find relation entry screen; `docs/APP_ID_MIGRATION.md`.

**Still open (follow-up PRs):** Full v6 tree placement + marriage ghost labels; Find relation canvas subgraph + purple 6px multi-path on tree; `shared/archiveQuery.ts` + Reports KPI/custom AND query; Google Drive backup (U2); package id migration (U1 code).

**1.0.8 slice:** Profile edit uses `PersonFields` (nickname, gender, death); Members + profile nickname chips; Find relation multi-path chips + path count; `relationPaths` enumerator.

### Engineering follow-ups (no issue yet)

- Kinship “once removed” and other asymmetric paths may still use `KINSHIP_LABEL_FALLBACK`

## Recently shipped (do not re-implement)

| Issue | Title |
|------:|-------|
| [#11](https://github.com/kashifyounus/family-tree-structure/issues/11) | Single-parent and unknown co-parent support |
| [#12](https://github.com/kashifyounus/family-tree-structure/issues/12) | Half/step siblings and child relationship type |
| [#13](https://github.com/kashifyounus/family-tree-structure/issues/13) | Hide family codes from profile marriage children lists |
| [#14](https://github.com/kashifyounus/family-tree-structure/issues/14) | Child create sheet — date of birth field |
| [#15](https://github.com/kashifyounus/family-tree-structure/issues/15) | Cream pedigree canvas + tokenized connectors |
| [#16](https://github.com/kashifyounus/family-tree-structure/issues/16) | Human kinship labels + shared kinship module |
| [#17](https://github.com/kashifyounus/family-tree-structure/issues/17) | Local-first vs cloud mutations — see `docs/ARCHITECTURE_SYNC.md` |
| [#19](https://github.com/kashifyounus/family-tree-structure/issues/19) | Hide family codes from primary UI labels |
| [#20](https://github.com/kashifyounus/family-tree-structure/issues/20) | Person profile: one Tree CTA + Home-style action hierarchy |
| [#21](https://github.com/kashifyounus/family-tree-structure/issues/21) | Tree list mode aligned with Kuriosity cards |
| [#22](https://github.com/kashifyounus/family-tree-structure/issues/22) | Home: archive vs showcase honesty + search labels |
| [#23](https://github.com/kashifyounus/family-tree-structure/issues/23) | Refresh docs/GAPS.md (this file) |
| [#18](https://github.com/kashifyounus/family-tree-structure/issues/18) | Split member screen + SQLite/branding notes (`docs/SQLITE_STORAGE.md`) |

### Kinship labeling (remaining)

- First/second/third cousins, niece/nephew, and common in-laws are labeled in `shared/humanKinshipLabel.ts`. Distant or asymmetric paths still use `KINSHIP_LABEL_FALLBACK`.

## Domain notes (for implementers)

- **Parents:** A child may have one recorded parent, two parents, or an **Unknown** co-parent placeholder when only one side is known (`shared/unknownCoParent.ts`, `family-tree-app/lib/db/unknownCoParent.ts`). Do not require two parents or a union before attaching a child.
- **Siblings:** `full|half|step` degrees and `BIOLOGICAL|ADOPTED|STEP` child types are modeled and surfaced on the mobile profile (siblings tables, marriage children).
- **Family codes:** Internal `FAM-…` identifiers remain for search, graph routing, and **Account → Advanced → member reference** (and Tree overflow menu). They must not be the primary subtitle under a person’s name in Members, Home, Tree list, or Tree title.
- **Mobile online mode** is read-mostly; mutations are local SQLite — see `docs/ARCHITECTURE_SYNC.md`.
- **Tree layout:** Parent placement (husband left / wife right) lives in `shared/marriageTreeLayout.ts`. Pedigree canvas uses cream tokens from `shared/pedigreeTheme.ts`.
- **Home tab** is the visual source of truth for cards, pills, and spacing (`PrimaryPillButton`, `PersonRow`, cream surfaces).

## Design system pointer

Mobile tokens: `family-tree-app/theme/appTheme.ts`, `family-tree-app/lib/design/kuriosityDesignSystem.ts`.
