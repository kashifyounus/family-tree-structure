# Sprint 4 — Sheets polish, archive settings, Maestro

Paste after Sprints 1–3.

---

**Scope:**
1. **Add member** — full **FormBottomSheet** (Cancel | Add member | Save nav + pill **Save member**), transparent modal route; Members FAB uses same flow (no centered dialog).
2. **FormBottomSheet** — optional `figmaNavBar` header; `sheetTestID` for E2E.
3. **Account vs Tools** — **Archive settings** stack screen (`/archive-settings`) for export/backup; Account preferences link here instead of raw Tools tab.
4. **Maestro** — `08-figma-kuriosity-smoke.yaml`: Home → add-member sheet → Members → Margaret profile.
5. **testIDs** — `add-member-sheet`, `members-row-showcase-margaret-khan`, `archive-settings-screen`.

**Out of scope:** Removing Tools tab, full design pixel audit.

**Verify:** `npm test` (includes Maestro testID contract).
