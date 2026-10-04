# Device smoke — family tree map & dual archive

Use after releases touching `family-tree-app/` or `shared/marriageTreeLayout.ts`.  
Automated overlap: Maestro flows on **`main`** (see `.github/workflows/mobile-maestro.yml`).

**Status property:** track in [`FAMILY_TREE_MAP_STATUS.md`](./FAMILY_TREE_MAP_STATUS.md) → **S4** (human), **S4a** (automated).

---

## Automated gate (CI / local)

Runs on every PR and `main` push (mobile job + Maestro flow contracts). Locally:

```bash
cd family-tree-app
npm run test:smoke
```

When this passes, **S4a** is satisfied. **S4** still requires the manual steps below on a device or emulator.

---

## Quick path (~10 min)

| Step | Action | Pass criteria |
|------|--------|----------------|
| 1 | Fresh install → **Private archive** onboarding | No Kay prefill; lands on Home with live lane |
| 2 | **Account** → switch to **Demo** (complete Kay onboarding if prompted) | Demo banner on Home |
| 3 | **Tree** → tap **Load siblings / parents / children** | Graph reloads; no crash |
| 4 | Tap a person card → profile opens | SQLite profile, not showcase |
| 5 | **Account** → **Clear demo & start again** | Returns to onboarding |
| 6 | **Tools** on **live** lane | Export works; import blocked on demo |

---

## Maestro parity (CI on `main`)

| Flow | Covers |
|------|--------|
| `01-onboarding-private-archive` | Live registration |
| `09-demo-onboarding-kay` | Demo seed |
| `10-archive-lane-switch` | Live ↔ demo + banner |
| `11-demo-clear-restart` | Clear demo |
| `12-tree-load-more` | All three load-more buttons |

Local:

```bash
cd family-tree-app
npm run test:e2e:smoke   # requires Maestro + emulator/device
```

---

## Sign-off

| Role | Date | Build / commit | OK |
|------|------|----------------|----|
| PO / QA | | | ☐ |

When signed, set **S4** → `done` in `FAMILY_TREE_MAP_STATUS.md`.
