# Family tree map — product requirements (stakeholder)

Captured from product owner (Oct 2026). Use this with [`GAPS.md`](./GAPS.md) for implementation tracking.  
**Live status table:** [`FAMILY_TREE_MAP_STATUS.md`](./FAMILY_TREE_MAP_STATUS.md) (`done` | `in_work` | `pending`).

## Tree map layout (when a person is focal)

| # | Requirement | Implementation notes |
|---|-------------|----------------------|
| 1 | Person + spouse cards centered on the marriage row | `shared/marriageTreeLayout.ts` → `layoutMarriageCentricGraph` |
| 2 | Children below the couple | Same layout module; union childships |
| 3 | Person’s siblings on the person’s left wing | `placeSiblingWing(..., "left")` on husband/ego side |
| 4 | Spouse’s siblings on the spouse’s right wing | `placeSiblingWing(..., "right")` on wife/spouse side |
| 5 | Person’s parents above person’s side; spouse’s parents above spouse’s side | `placeParentsAbove` left/right; spouse parents included in graph via `collectIncludedPersonIds` |
| 6 | Load more relations (expand graph) | Tree tab → parents / siblings / children buttons (`LocalFamilyTree`) |
| 7 | Fresh empty database to start | **Live:** `kuriosity_live.db` starts empty; **Demo:** `kuriosity_demo.db` for samples only |
| 8 | Onboarding with full user info, no hardcoded defaults | Private archive registration form; no pre-filled Kay/demo identity |
| 9 | Sample data must be genealogically complete (all relations) | Curated Hassan–Khan fixture (`buildCuratedPedigreeDemo`) |
| 10 | Settings option to clear demo / start again | **Account → Demo lane → Clear demo & start again** |
| 11 | Live data never mixed with demo | Separate SQLite files; sample import only on demo lane |
| 12 | Sample rows identifiable | `persons.is_fixture = 1` in demo DB |
| 13 | End-to-end verification | Jest (`shared`, `family-tree-app`) + Maestro smoke where available |

## Genealogy / business rules

- **Focal person** = whose tree you are viewing (tap person → center tree on their family code).
- **Marriage row** may include multiple spouses (serial marriages); primary union drives children column.
- **Half/step siblings** follow union childships and relationship type in SQLite (see domain notes in `GAPS.md`).
- **Unknown co-parent** placeholder supported for single-parent lines (not required for curated sample).

## Resolved product decisions

- **No cloud work** for this phase — local SQLite only.
- **Two databases:** live vs demo (see [`SQLITE_STORAGE.md`](./SQLITE_STORAGE.md)).
- **Huge ~2,500 demo** stays on the demo lane; generator only adds people via clan forests (union + child links), same relational rules as curated pedigree.
- **Clear demo** wipes the demo database and returns to onboarding for a fresh sample run.
