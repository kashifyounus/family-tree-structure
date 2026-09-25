# Sprint 1 — Figma Kuriosity (tabs + Home only)

Paste this for a **small first pass** before all 8 screens.

---

Implement **Sprint 1** of Kuriosity Family Tree Figma (`12fvzMXqrDJ9JtbCiBT2P9`, node `10:10`) in the existing Expo app at `family-tree-app/`.

**Scope (only):**
1. **Theme** — ensure `#F6F1E7` / `#FFFDF8` / `#1B4332` / `#DDD3C4` in `global.css` + `appTheme.ts` (no new palette).
2. **Tab bar** — 4 tabs: Home, Tree, Members, Account; active tint `#1B4332`; optional 4px dot under active icon.
3. **Home screen** — match Figma Home (`6:4`): header (tree logo + Kuriosity / Family Tree, avatar **KH**, bell badge **2**), “Good morning, Kay”, stats row (**48 Members**, **12 Generations**, **6 Stories**), 48px search “Search people or stories”, Recent activity (3 rows), primary pill **Add family member**.
4. **Mock data** — `lib/mock/kuriosityShowcase.ts` (typed): stats, activity lines, display name Kay; wire stats to real `localMemberCount` when > 0.
5. **Navigation** — bell → `/notifications` (skeleton screen with title only); Add member → existing members create flow or `/members` with create open.

**Out of scope:** Tree pedigree redesign, Members chips, Account redesign, Story detail, Person detail tabs, Gluestack v2 migration.

**Stack:** Gluestack v5 + NativeWind already in repo — extend, do not replace with v2.

**Verify:** `npm test` in `family-tree-app`; Home matches cream background and 20px padding; tab Home active.

**Reference PNG:** `docs/ui-samples/hd/kuriosity-hd-home.png`
