# Mobile SQLite storage (Kuriosity Family Tree)

## Database file name

The Expo app opens a single on-device database via `expo-sqlite`:

- **File name:** `mughals_family.db` (`family-tree-app/lib/db/database.ts` → `DB_NAME`)
- **Legacy naming:** The filename and several AsyncStorage keys still use the `mughals_` prefix from an earlier product name. **Kuriosity** is the user-facing brand; do not rename storage identifiers in a drive-by refactor.

## Migration caution

Renaming `DB_NAME` or moving the database path **without a copy/migrate step** will present users with an **empty** archive on upgrade. Any rename must:

1. Open the old file if it exists, copy or `ATTACH` + export into the new file, then switch `DB_NAME`.
2. Keep backup/export filenames documented (`lib/backup/exportDatabase.ts` uses `mughals_family_*.db` for cache exports).
3. Ship behind a one-time migration in `database.ts` with tests on a fixture DB.

Until that migration exists, treat `mughals_family.db` as the stable production identifier.

**Future rename:** step-by-step plan in [`SQLITE_MIGRATION_PLAN.md`](./SQLITE_MIGRATION_PLAN.md). Runtime hook stub: `family-tree-app/lib/db/databaseIdentity.ts`.

## Code layout

- **Core CRUD:** `lib/db/localRepository.ts`
- **Genealogy mutations (child, spouse, parents):** `lib/db/localRepository.ext.ts`
- **Kinship reads:** `lib/db/kinshipLoader.ts`

Prefer new local mutations in `.ext` when they touch unions/children, unless a consolidation effort is explicitly scoped.

## Related docs

- Local-first product rules: `docs/ARCHITECTURE_SYNC.md`
- Agent backlog: `docs/GAPS.md`
