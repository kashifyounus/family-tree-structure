# SQLite rename migration plan (spike)

**Status:** Plan only — production still uses `mughals_family.db`. See [`SQLITE_STORAGE.md`](./SQLITE_STORAGE.md).

## Target state (future)

| Artifact | Current | Proposed |
|----------|---------|----------|
| On-device DB file | `mughals_family.db` | `kuriosity_family.db` (example) |
| Cache export prefix | `mughals_family_` | keep or alias both during transition |
| AsyncStorage keys | `@mughals/*`, `mughals_*` | migrate key-by-key with read fallback |

## Migration algorithm (sketch)

1. On app start, if `kuriosity_family.db` missing and `mughals_family.db` exists:
   - Copy file with `expo-file-system` / SQLite backup API (not `INSERT` replay — preserve indices).
   - Set flag `kuriosity_db_migrated_v1` in secure storage.
2. Open only the new filename once copy verifies (`PRAGMA user_version` or row count spot-check).
3. Keep reading old filename for one release if copy fails; log non-fatal telemetry in dev.
4. Update `exportDatabase` / Drive backup names in a follow-up PR.

## Out of scope for spike

- No automatic rename in this repo until QA signs off on dual-file rollback.
- No change to Android `applicationId` / iOS bundle id.

## Implementation hook

`family-tree-app/lib/db/databaseIdentity.ts` exports stable constants and `plannedKuriosityDatabaseName` for tests/docs alignment. Wire `getDatabase()` to a migration runner in a dedicated PR.

## Verification checklist (when implemented)

- [ ] Upgrade test: seed `mughals_family.db` fixture → launch app → data visible, same focal person.
- [ ] Fresh install uses new name only.
- [ ] Backup restore round-trip still works.
- [ ] Maestro smoke on private archive after migration.
