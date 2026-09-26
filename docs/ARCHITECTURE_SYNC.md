# Kuriosity mobile — local-first genealogy mutations

## Product decision (current)

Kuriosity Family Tree on mobile is **local-first** for genealogy editing:

- **Private archive (SQLite on device)** — full create/update flows: people, marriages, parents, children, focal person, backup/import.
- **Online / shared family website mode** — **read-mostly**: browse members, person profiles, tree graph, and reports from the Next.js API. Creating a new person via `POST /api/mobile/members/create` is allowed when the server grants the role; **marriages, parent links, child links, and profile edits are not exposed** on mobile HTTP routes today.

There is **no background sync** between SQLite and the cloud catalog. Switching storage mode is an **exclusive choice** per session (local XOR online read), not a merged replica.

## Why

- Offline reliability for field research and family gatherings.
- Simpler trust model: the device archive is clearly “yours”; the website is the shared canonical tree when online.
- Server mutations require auth, validation, and audit — shipped incrementally on the web first.

## Roadmap (agent-ready, not implemented)

When mutation APIs are added, prefer this order:

1. **Profile patch** — `PATCH /api/mobile/person/[personId]` (name, dates, privacy fields).
2. **Union create** — `POST /api/mobile/unions` (spouse link + optional marriage date).
3. **Child link** — `POST /api/mobile/unions/[unionId]/children` (existing or new person id + `relationshipType`).
4. **Parent assign** — `POST /api/mobile/person/[personId]/parents` (slot + optional co-parent / unknown co-parent flags).

Each write should:

- Return the same `MobilePersonDetails` shape as read routes (see `shared/mobilePersonDetails.ts`).
- Enforce the same rules as `shared/relationshipRules.ts` / web Prisma layer.
- Document idempotency and conflict behavior before any “sync” label is used in the UI.

## UX expectations

- Online mode surfaces **cloud read-only** messaging when the user attempts a local-only mutation (see `copy.profile.cloudReadOnly` in `family-tree-app/content/businessCopy.ts`).
- Do not promise “sync” in UI until bidirectional merge exists.

## Related docs

- HTTP contract: `docs/MOBILE_API.md`
- Agent backlog: `docs/GAPS.md` (epic [#10](https://github.com/kashifyounus/family-tree-structure/issues/10))
