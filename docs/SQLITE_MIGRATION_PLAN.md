# SQLite rename migration

**Status:** Implemented in app code (`migrateLegacyDatabaseIfNeeded`).

## What ships

1. New installs use **`kuriosity_family.db`** only.
2. Upgrades with **`mughals_family.db`**:
   - If Kuriosity file already exists → delete legacy file.
   - Else if legacy has people → SQLite backup into Kuriosity file, then delete legacy.
   - Else → delete empty legacy file.
3. Cache export / Drive backup filenames use `kuriosity_family_*` / `kuriosity-family-*`.

## Not migrated (by design)

- AsyncStorage keys (`mughals_storage_mode`, etc.)
- Android `applicationId` / iOS bundle identifier

## Verification

- Unit tests: `legacyDatabaseMigration.test.ts`, `databaseIdentity.test.ts`
- Manual: install over old build with demo data → members still visible; only one DB file remains.
