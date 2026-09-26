# Kuriosity / family-tree-structure — agent gap backlog

> Cursor coding agents: **pick open GitHub issues titled `[GAP]…`**, prefer **`[GAP][P0]`** first, one PR per issue (or tightly related pair). Link the issue in the PR. Keep Kuriosity tokens: primary `#1B4332`, bg `#F6F1E7`, surface `#FFFDF8`.

Epic: https://github.com/kashifyounus/family-tree-structure/issues/10

## How to work

1. Read this file and the target issue acceptance criteria.
2. Investigate before changing; shared domain logic belongs in `shared/` when web + mobile both need it.
3. Do not invent a new visual language. Reuse Gluestack / existing sheets (`AddRelationSheet`, `DatePickerField`, `PersonCardRow`).
4. Run relevant tests (`shared` Jest, `family-tree-app` Jest) before opening the PR.
5. When done, check off acceptance criteria in the issue comment and close if fully met.

## P0 — correctness / trust

| Issue | Title |
|------:|-------|
| [#11](https://github.com/kashifyounus/family-tree-structure/issues/11) | Single-parent and unknown co-parent support |
| [#12](https://github.com/kashifyounus/family-tree-structure/issues/12) | Surface half/step siblings and child relationship type |
| [#13](https://github.com/kashifyounus/family-tree-structure/issues/13) | Hide family codes from profile marriage children lists |

## P1 — product / architecture

| Issue | Title |
|------:|-------|
| [#14](https://github.com/kashifyounus/family-tree-structure/issues/14) | Child create sheet — date of birth field |
| [#15](https://github.com/kashifyounus/family-tree-structure/issues/15) | Cream pedigree canvas + tokenized connectors |
| [#16](https://github.com/kashifyounus/family-tree-structure/issues/16) | Human kinship labels + shared kinship module |
| [#17](https://github.com/kashifyounus/family-tree-structure/issues/17) | Document local-first vs cloud mutations; refresh MOBILE_API |

## P2 — engineering health

| Issue | Title |
|------:|-------|
| [#18](https://github.com/kashifyounus/family-tree-structure/issues/18) | Split member screen + engineering health notes |

### Kinship labeling (remaining)

- Cousin and in-law degrees beyond simple paths still use the generic fallback (`shared/humanKinshipLabel.ts` → `KINSHIP_LABEL_FALLBACK`) until labeled in a follow-up.

## Domain notes (for implementers)

- Child attach currently requires a **union**; parents require **two** people — see `#11`.
- Sibling degrees `full|half|step` and `BIOLOGICAL|ADOPTED|STEP` exist in data layer but are under-exposed in UI — see `#12`.
- Mobile online mode is read-mostly; mutations are local SQLite — see `#17`.
- Tree parent placement (husband left / wife right) already lives in `shared/marriageTreeLayout.ts`.

## Design system pointer

Mobile tokens: `family-tree-app/theme/appTheme.ts`, `family-tree-app/lib/design/kuriosityDesignSystem.ts`.
