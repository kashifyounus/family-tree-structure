# Kuriosity app id migration (U1)

**Current:** `com.mughals.familytree`  
**Target:** `com.kuriosity.engineering`

## Plan (do not ship id change without user backup)

1. **Pre-migration:** Export private archive (JSON) via Tools / Archive settings; verify restore on a test device.
2. **Android:** Change `applicationId` in `app.json` / Gradle; new Play listing or staged rollout; users reinstall or use backup restore.
3. **iOS:** New bundle identifier; TestFlight + App Store Connect new app record if required.
4. **SecureStore / local keys:** Audit `mughals_*` key prefixes; migrate read-once from old keys on first launch after upgrade.
5. **Maestro / CI:** Update package name in flows and `test-android-env.sh`.
6. **Backup filenames:** Rename `mughals-family-backup.json` → `kuriosity-family-backup.json` with backward-compatible import.
7. **Google OAuth (U2):** Register new SHA-1 for release + debug keystores against the target package when id changes.

This wave documents the plan only; package id remains `com.mughals.familytree` until a dedicated migration release.
