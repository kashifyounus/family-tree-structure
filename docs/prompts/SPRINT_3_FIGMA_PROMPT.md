# Sprint 3 — Account, Add member sheet, Tree showcase pedigree

Paste after Sprint 1–2.

---

Implement **Sprint 3** Figma Kuriosity (`12fvzMXqrDJ9JtbCiBT2P9`) in `family-tree-app/`.

**Scope (only):**
1. **Account** — large avatar **KH**, **Kay Hassan**, email, **Archive owner** badge; **Archive** section (settings row, **Private archive** toggle ON); **Preferences** (Notifications, Export data, Invite family); **Sign out** (danger text). Keep advanced storage/dev controls below a divider.
2. **Add member** — modal/stack: Cancel | Add member | Save; optional photo row; 48px fields (first/last, relationship, birth year, notes); pill **Save member**; wire Home CTA → this screen; persist via `createMember` when allowed.
3. **Tree** — when private archive has **no members**, show **showcase pedigree**: Omar & Fatima → Rashid & Nadia → **Kay (You)**, Emma, Ali, Sara, **Margaret (Aunt)**; title **Family tree**, filter/zoom actions, hint “3 generations · pinch to zoom”. Real `LocalFamilyTree` when data exists.

**Out of scope:** Full Account removal of dev tools, online tree redesign, all showcase persons’ detail pages.

**Verify:** Empty DB → Tree showcase; Home → Add member sheet; Account toggle + notifications link; `npm test`.
