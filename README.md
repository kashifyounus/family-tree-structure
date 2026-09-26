# Mughal's Family Tree (family-tree-structure)

**Version 1.0.0** · Owner **Kashif Younus** (`kashifyounus@mughals.local`)

Mobile-friendly family tree web application built with **Next.js 15**, **TypeScript**, **PostgreSQL**, **Prisma**, **Tailwind CSS**, and **React Flow**.

## Agent backlog

Cursor agents: see [`docs/GAPS.md`](docs/GAPS.md) and root [`AGENTS.md`](AGENTS.md) for open `[GAP]` work (issues [#11](https://github.com/kashifyounus/family-tree-structure/issues/11)–[#18](https://github.com/kashifyounus/family-tree-structure/issues/18)). Epic: [#10](https://github.com/kashifyounus/family-tree-structure/issues/10).

## Features

- **Union-based model** — multiple spouses per person, children linked to a specific union (full vs half siblings).
- **Computed kinship** — paternal/maternal uncles and aunts, siblings, and path finding between any two members.
- **Focal tree view** — pan/zoom graph with horizontal spouse layout and member detail drawer.
- **Search** — by family code, name, or birth year.

## Mobile app (Expo / Android)

See [`family-tree-app/README.md`](family-tree-app/README.md) and [`family-tree-app/RELEASE.md`](family-tree-app/RELEASE.md) for the Android app (SQLite or online via API) and **downloadable APK** builds from GitHub Actions.

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
- `npm run db:seed:huge` — replace DB with ~2,500-person generated demo tree (unique names, cities, mixed relationships)
- `npm run demo:export` — write `family-tree-app/assets/demo/huge-demo.bundle.json` for offline import/inspection
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
| **mobile** | `family-tree-app` typecheck + Jest + `npm run test:maestro:contracts` |
| **mobile-maestro** (`.github/workflows/mobile-maestro.yml`) | PR: Maestro flow contracts; **main** / manual: Android emulator onboarding smoke |

Local E2E: `npm run test:e2e` (Playwright global setup starts embedded Postgres or uses `DATABASE_URL`). CI sets `PLAYWRIGHT_USE_START=1` so tests hit the production server, not `next dev`.

Mobile Maestro on device: `cd family-tree-app && npm run test:e2e:smoke` (see `family-tree-app/maestro/README.md`).
