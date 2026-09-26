# Mobile SQLite storage (Kuriosity Family Tree)

## Database file name

The Expo app opens a single on-device database via `expo-sqlite`:

- **Active file:** `kuriosity_family.db` (`family-tree-app/lib/db/database.ts` → `DB_NAME`)
- **Legacy file:** `mughals_family.db` — removed on first launch after upgrade when empty or copied into the new file (`lib/db/legacyDatabaseMigration.ts`, runs in `StorageProvider` before `getDatabase()`).

## Legacy naming elsewhere

Android package id `com.mughals.familytree` and some AsyncStorage keys still use the `mughals_` prefix. User-facing brand is **Kuriosity**; those identifiers are unchanged to avoid store / install breakage.

## If you had real data on an old build

On upgrade, the app copies `mughals_family.db` → `kuriosity_family.db` when the old file has people, then deletes the legacy file. If both files existed, the legacy file is dropped (Kuriosity file wins).

## Code layout

- **Core CRUD:** `lib/db/localRepository.ts`
- **Genealogy mutations:** `lib/db/localRepository.ext.ts`
- **Kinship reads:** `lib/db/kinshipLoader.ts`

## Related docs

- Migration history: [`SQLITE_MIGRATION_PLAN.md`](./SQLITE_MIGRATION_PLAN.md)
- Local-first product rules: [`ARCHITECTURE_SYNC.md`](./ARCHITECTURE_SYNC.md)
