# Mobile & cloud functionality audit

Last reviewed against branch `cursor/mobile-ux-sheets-fixture-8fed` (PR #9 scope).

## What is in good shape

| Area | Status |
|------|--------|
| Local SQLite CRUD | Members, marriages, children, parents, link-existing spouse/child |
| Shared relationship rules | `shared/relationshipRules.ts` — web, API, SQLite |
| Cloud read + create member | Person detail, graph, reports, directory search |
| Mobile API contract | `shared/mobilePersonDetails.ts`, `docs/MOBILE_API.md` (partial) |
| UI stack | Gluestack Phase C; focal resolution on tree/home/reports |
| Maestro | Flows 01–07; static contracts on PR; emulator bundle 01/06/07 on `main` |
| CI / APK pipeline | `ci.yml`, `mobile-maestro.yml`, `android-apk.yml`, `build-apk-local.sh` |

## P0 — Security / correctness

1. **Bearer token not applied to privacy masking on read routes**  
   Mobile sends `Authorization` on `apiFetch`, but `getPersonDetails` / graph masking use cookie-only `getAuthContext()`. Signed-in cloud users may still see GUEST-level masking (e.g. living members as “Private”).  
   **Fix:** Resolve viewer from `Authorization` in `app/api/mobile/person/*` and `app/api/mobile/graph/*` (and pass into masking).

2. **`GET /api/mobile/members` lists unmasked names**  
   `listMembersForDashboard` does not apply `maskPersonSummary` / viewer rules.  
   **Fix:** Mask directory rows for GUEST/VIEWER like the web dashboard.

## P1 — Functional gaps

| # | Gap | Notes |
|---|-----|--------|
| 3 | Online create: `birthDate` in UI, not sent to API | `members.tsx` vs `createMemberOnline` |
| 4 | Auth restore: token only, not `role` | VIEWER may see create FAB until re-login (`AuthContext`) |
| 5 | Online tree vs web | No `expandFamilyGraph`; no list layout online; limited depth refetch |
| 6 | WebView `?embed=1` | `tree.tsx` fallback; web tree page has no embed mode |
| 7 | Docs | `MOBILE_API.md` still says `household` unused (Reports uses it) |
| 8 | Maestro | No family-cloud onboarding/sign-in flow; CI skips flows 02–05 |

## P2 — Polish

- Reports: web charts `homeTown` / `birthPlace`; mobile online only `currentCity`
- “Relation to me” on profile: local only
- Online create: no Urdu name fields (API supports them)
- testIDs: cloud onboarding sign-in, tools import, `home-your-branch`
- Graph API returns unused `details` alongside `graph`
- Deprecated shims (`AppDialogForm`, `onlinePersonMapper` aliases)

## Intentional (not gaps)

- Cloud: no mobile edit/delete, marriages, parents, backup (web or local only) — documented in `businessCopy` / `MOBILE_API.md`
- Tools backup/import: local archive only

## Suggested fix order

1. P0 mobile auth + member list masking  
2. P1 birthDate on create + auth role restore  
3. P1 doc sync + Maestro cloud smoke (optional)  
4. P2 reports depth, embed tree, online tree UX
