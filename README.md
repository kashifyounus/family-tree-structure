# Kinship Graph (family-tree-structure)

Modern family tree web application built with **Next.js 15**, **TypeScript**, **PostgreSQL**, **Prisma**, **Tailwind CSS**, and **React Flow**.

## Features

- **Union-based model** — multiple spouses per person, children linked to a specific union (full vs half siblings).
- **Computed kinship** — paternal/maternal uncles and aunts, siblings, and path finding between any two members.
- **Focal tree view** — pan/zoom graph with horizontal spouse layout and member detail drawer.
- **Search** — by family code, name, or birth year.

## Quick start

```bash
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and use sample code **FAM-10004** (Kwame Mensah).

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
