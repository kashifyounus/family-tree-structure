# Mughal's Family Tree (family-tree-structure)

**Version 1.0.0** · Owner **Kashif Younus** (`kashifyounus@mughals.local`)

Mobile-friendly family tree web application built with **Next.js 15**, **TypeScript**, **PostgreSQL**, **Prisma**, **Tailwind CSS**, and **React Flow**.

## Features

- **Union-based model** — multiple spouses per person, children linked to a specific union (full vs half siblings).
- **Computed kinship** — paternal/maternal uncles and aunts, siblings, and path finding between any two members.
- **Focal tree view** — pan/zoom graph with horizontal spouse layout and member detail drawer.
- **Search** — by family code, name, or birth year.

## Mobile app (Expo / Android)

See [`family-tree-app/README.md`](family-tree-app/README.md) for the React Native client (per-device **SQLite** or **online PostgreSQL via API**) and APK build via EAS.

## Quick start

```bash
docker compose up -d
npm install
npx prisma migrate dev --name init_family_tree_v2
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use sample code **FAM-10004** (Hassan Khan). Reports: `/tree/FAM-10004/reports`.

### Demo sign-in (cookie session)

| Email | Password | Role |
|-------|----------|------|
| `kashifyounus@mughals.local` | `mughal` | Owner / admin |
| `contributor@mughals.local` | `contributor` | Add/edit spouses, children, profiles |
| `viewer@mughals.local` | `viewer` | Read-only (living members masked) |

Legacy `@kinship.local` demo accounts remain enabled for older bookmarks.

## Environment

| Variable       | Description                          |
|----------------|--------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string         |

## Project layout

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Person, Union, Childship models |
| `actions/familyTree.ts` | Server actions & kinship API |
| `lib/kinship.ts` | Relationship computation |
| `components/TreeCanvas.tsx` | React Flow visualization |
| `app/tree/[familyCode]/page.tsx` | Focal tree page |

## Scripts

- `npm run db:migrate` — apply migrations
- `npm run db:seed` — load demo polygamous family dataset
- `npm run build` — production build
- `npm run test` — Jest unit tests (kinship, privacy, reporting)
- `npm run test:e2e` — Playwright E2E (requires Postgres + seed via global setup)
- `npm run typecheck` — TypeScript `--noEmit`

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and on pushes to `main`:

| Job | What it does |
|-----|----------------|
| **web-static** | ESLint, `tsc`, Jest (no database) |
| **web-build** | Postgres, Prisma migrate + seed, `next build` |
| **web-e2e** | After build passes: migrate + seed, `next build`, `next start`, Playwright E2E (HTML report uploaded on failure) |
| **mobile** | `family-tree-app` typecheck + Jest (includes Maestro flow file smoke checks) |

Local E2E: `npm run test:e2e` (Playwright global setup starts embedded Postgres or uses `DATABASE_URL`). CI sets `PLAYWRIGHT_USE_START=1` so tests hit the production server, not `next dev`.
