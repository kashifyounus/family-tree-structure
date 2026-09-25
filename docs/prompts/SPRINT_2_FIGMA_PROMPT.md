# Sprint 2 — Members list + Person detail (Margaret Khan)

Paste for a **second pass** after Sprint 1 (Home + tabs).

---

Implement **Sprint 2** of Kuriosity Figma (`12fvzMXqrDJ9JtbCiBT2P9`) in `family-tree-app/`.

**Scope (only):**
1. **Members tab** — title “Members” + count (e.g. **48 people**), 48px search “Search members”, filter chips **All** (active) / **Living** / **Generations**, list rows (avatar initials, name, relation subtitle, chevron). Sample rows: Kay Hassan, Emma, Ali, Sara, **Margaret Khan**, Omar, Fatima, Rashid…
2. **Person detail** — Margaret Khan: back **Members** | **Edit**; avatar **MK**; “1962 — · Living”; badge **Aunt**; segments **About** (active) / **Photos** / **Stories**; detail fields (born, parents, sibling, generation); bio card (real copy); bottom **Edit** (outline) + **Add relation** (primary pill).
3. **Mock data** — extend `lib/mock/kuriosityShowcase.ts` with `showcaseMemberRows`, `margaretKhanProfile`, stable id `showcase-margaret-khan`.
4. **Navigation** — Members row → `/member/showcase-margaret-khan` (or equivalent); story segment links to Lahore story when present.

**Out of scope:** Account screen, Add member sheet redesign, Tree pedigree names, replacing full local member CRUD UI for non-showcase profiles.

**Stack:** Gluestack v5 + NativeWind; reuse `SegmentedControl`, `PersonRow`, `PrimaryPillButton`.

**Verify:** Tap Margaret from Members → segments switch; Photos/Stories non-empty states; `npm test`.

**Reference PNG:** `docs/ui-samples/hd/kuriosity-hd-members.png` (if present)
