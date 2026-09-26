# Reports UX notes

Mobile Reports tab (`family-tree-app/app/(tabs)/reports.tsx`):

- **KPI strip:** Members, Living, Married, Divorces, Male, Female (local SQLite).
- **Quick filters:** Preset chips route to custom report with AND-only filters (`shared/archiveQuery.ts`).
- **Custom report:** `app/reports-custom.tsx` — combine filters; results use `PersonRow` with nickname chips.
- **Charts:** City + age buckets (existing `SimpleBarChart`).
- **Tokens:** primary `#1B4332`, cream `#F6F1E7`, cards `#FFFDF8`.

Find relation → Tree: pass `pathNodes`, `highlightA`, `highlightB`; tree draws purple `#7828A0` @ 6px path overlay.
