# Mobile HTTP API (`family-tree-app` ↔ Next.js)

Base URL: configured in **Account → family website address** (`EXPO_PUBLIC_API_URL` in dev).

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
| `person` | Profile header, `PersonFacts`, edit (local only) |
| `unions` | Marriages section, children links |
| `parentLinks` | Parents in `KinshipSections` |
| `computed` | Siblings, aunts/uncles lists (with real `id` for navigation) |

### On the wire, not shown in mobile UI yet

| Wire field | Notes |
|------------|--------|
| `household` | Husband/wife household report (mobile **Reports** tab + web reports) |
| `person.photoUrl`, `privacyLevel`, `motherTongue`, `permanentCity` | Available for future profile UI |
| `children[].relationshipType`, `unionId` | Available for future labels |

## Other mobile routes

- `GET /api/mobile/health` — connection test  
- `POST /api/mobile/auth/login` — bearer token  
- `GET /api/mobile/members` — directory search (`fatherName` / `motherName` from birth union when known)  
- `POST /api/mobile/members/create` — new person (role-checked server-side)  
- `GET /api/mobile/graph/[familyCode]` — tree graph JSON  
- `GET /api/mobile/reports/[familyCode]` — insights (`household` includes wives/children counts; focal wife resolves to husband server-side)  

There are **no** mobile mutation routes for marriages, parents, or profile updates; those remain **local SQLite** or the **web app**.
