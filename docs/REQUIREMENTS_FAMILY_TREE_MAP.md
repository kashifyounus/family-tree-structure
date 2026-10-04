# Family tree map — product requirements (stakeholder)

Captured from product owner (Oct 2026). Use this with [`GAPS.md`](./GAPS.md) for implementation tracking.

## Tree map layout (when a person is focal)

| # | Requirement | Implementation notes |
|---|-------------|----------------------|
| 1 | Person + spouse cards centered on the marriage row | `shared/marriageTreeLayout.ts` → `layoutMarriageCentricGraph` |
| 2 | Children below the couple | Same layout module; union childships |
| 3 | Person’s siblings on the person’s left wing | `placeSiblingWing(..., "left")` on husband/ego side |
| 4 | Spouse’s siblings on the spouse’s right wing | `placeSiblingWing(..., "right")` on wife/spouse side |
| 5 | Person’s parents above person’s side; spouse’s parents above spouse’s side | `placeParentsAbove` left/right; spouse parents included in graph via `collectIncludedPersonIds` |
| 6 | Load more relations (expand graph) | Tree tab → parents / siblings / children buttons (`LocalFamilyTree`) |
| 7 | Fresh empty database to start | SQLite starts empty; **Account → Erase all private archive data** |
| 8 | Onboarding with full user info, no hardcoded defaults | Private archive registration form; no pre-filled Kay/demo identity |
| 9 | Sample data must be genealogically complete (all relations) | Curated Hassan–Khan fixture (`buildCuratedPedigreeDemo`) |
| 10 | Settings option to remove sample data only | **Account → Remove sample data only** → `wipeFixtureDataset()` |
| 11 | Manually added people are not deleted when clearing sample | `persons.is_fixture = 0` retained; only `is_fixture = 1` removed |
| 12 | Sample rows identifiable | `persons.is_fixture` column (SQLite migration `20260924_person_is_fixture`) |
| 13 | End-to-end verification | Jest (`shared`, `family-tree-app`) + Maestro smoke where available |

## Genealogy / business rules

- **Focal person** = whose tree you are viewing (tap person → center tree on their family code).
- **Marriage row** may include multiple spouses (serial marriages); primary union drives children column.
- **Half/step siblings** follow union childships and relationship type in SQLite (see domain notes in `GAPS.md`).
- **Unknown co-parent** placeholder supported for single-parent lines (not required for curated sample).

## Open questions for product owner

1. Should **online / family cloud** tree use the same marriage-centric layout as local SQLite, or keep web React Flow parity only?
2. When clearing sample data, if the signed-in focal person was part of the sample, should we auto-pick another member or force re-onboarding? (Current: re-point account to oldest non-fixture person, or sign out if none.)
3. Is the **2,500-person huge demo** still needed in Account, or should only the curated pedigree remain?
