# Mobile HTTP API (`family-tree-app` ↔ Next.js)

Base URL: configured in **Account → family website address** (`EXPO_PUBLIC_API_URL` in dev).

**Architecture:** Online mode is read-mostly; genealogy mutations live in the on-device SQLite archive unless noted. See `docs/ARCHITECTURE_SYNC.md`.

## Person detail (read)

| Route | Server handler | Wire type |
|-------|----------------|-----------|
| `GET /api/mobile/person/[personId]` | `getPersonDetails` | `MobilePersonDetails` |
| `GET /api/mobile/person/by-code/[familyCode]` | `getPersonDetailsByFamilyCode` | `MobilePersonDetails` |

**Canonical TypeScript contract (no Prisma in the app):** `shared/mobilePersonDetails.ts`  
**Server source of truth:** `types/family.ts` → `PersonDetails`

Keep both shapes aligned when adding fields. After fetching, the app runs `normalizeMobilePersonDetails()` then `mapOnlineDetailsToBundle()` in `family-tree-app/lib/data/onlinePersonMapper.ts`.

### Mapped into the mobile UI (`PersonBundle`)

| Wire field | Mobile use |
|------------|------------|
| `person` | Profile header, `PersonFacts`, edit (**local archive only**) |
| `unions` | Marriages section, `MarriageChildrenList` (children without family codes in lists) |
| `parentLinks` | `ParentPairCards` / parents section on member profile |
| `computed` | `SiblingsTable`, aunts/uncles sections (with real `id` for navigation) |

### On the wire, not shown in mobile UI yet

| Wire field | Notes |
|------------|--------|
| `household` | Husband/wife household report (mobile **Reports** tab + web reports) |
| `person.photoUrl`, `privacyLevel`, `motherTongue`, `permanentCity` | Available for future profile UI |

## Implemented mobile routes

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/mobile/health` | Connection test |
| `POST` | `/api/mobile/auth/login` | Bearer token |
| `GET` | `/api/mobile/members` | Directory search (`fatherName` / `motherName` from birth union when known) |
| `POST` | `/api/mobile/members/create` | New person (role-checked server-side) |
| `GET` | `/api/mobile/person/[personId]` | Person bundle (read) |
| `GET` | `/api/mobile/person/by-code/[familyCode]` | Person bundle by family code (read) |
| `GET` | `/api/mobile/graph/[familyCode]` | Tree graph JSON |
| `GET` | `/api/mobile/reports/[familyCode]` | Insights (`household` includes wives/children counts; focal wife resolves to husband server-side) |

## Missing mutation routes (explicit backlog)

These operations exist in **local SQLite** (`family-tree-app/lib/db/*`, `personService.ts`) but have **no** mobile HTTP equivalent yet:

| Operation | Suggested future route | Notes |
|-----------|----------------------|--------|
| Update person profile | `PATCH /api/mobile/person/[personId]` | Names, dates, privacy fields |
| Create / link marriage | `POST /api/mobile/unions` | Spouse pair + optional marriage date |
| Add child to union | `POST /api/mobile/unions/[unionId]/children` | New or existing child id + `relationshipType` |
| Assign parents | `POST /api/mobile/person/[personId]/parents` | Father/mother slots, unknown co-parent |
| Delete / detach links | TBD | Needs product rules before exposure |

Until these exist, use the **family website** (web app) or switch to the **private archive** on device.
