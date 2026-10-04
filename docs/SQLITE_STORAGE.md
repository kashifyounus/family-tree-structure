# Mobile SQLite storage (Kuriosity Family Tree)

## Database files (live / demo split)

The Expo app uses **two** on-device SQLite files (`family-tree-app/lib/db/database.ts`):

| Lane | File | Purpose |
|------|------|---------|
| **Live** | `kuriosity_live.db` | Your real family records (`is_fixture = 0` only in normal use) |
| **Demo** | `kuriosity_demo.db` | Sample / testing trees (`is_fixture = 1` imports) |

The active lane is stored in AsyncStorage (`kuriosity_archive_lane`) and switched from **Account → On-device archive**.

Device sign-in sessions are **per lane** (`mughals_local_account_id_live` vs `mughals_local_account_id_demo` in SecureStore).

## Legacy migration

- **Oldest:** `mughals_family.db` → copied to `kuriosity_family.db` on upgrade.
- **Single-file → live:** `kuriosity_family.db` is copied to `kuriosity_live.db` when live does not exist yet, then the single-file DB is removed (`lib/db/legacyDatabaseMigration.ts`).

## Clearing data

- **Live:** Account (while on Live lane) → *Erase all private archive data*.
- **Demo:** Account (while on Demo lane) → *Clear demo & start again* (wipes demo file + demo onboarding).

## Code layout

- **Lane selection:** `lib/db/archiveLane.ts`
- **Core CRUD:** `lib/db/localRepository.ts`
- **Genealogy mutations:** `lib/db/localRepository.ext.ts`
- **Kinship reads:** `lib/db/kinshipLoader.ts`

## Related docs

- Product requirements: [`REQUIREMENTS_FAMILY_TREE_MAP.md`](./REQUIREMENTS_FAMILY_TREE_MAP.md)
- Migration history: [`SQLITE_MIGRATION_PLAN.md`](./SQLITE_MIGRATION_PLAN.md)
- Local-first product rules: [`ARCHITECTURE_SYNC.md`](./ARCHITECTURE_SYNC.md)
