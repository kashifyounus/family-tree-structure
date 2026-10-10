# Family tree view — loading with clarity

Use this guide when the tree feels crowded or relationship labels look inconsistent.

## Before you expand the tree

1. **Back up your archive** (Account → **Archive settings**):
   - **Export file** — saves `kuriosity-family-backup.json` (share to Drive/WhatsApp/email).
   - **Google Drive backup** — uploads `.json` + `.db` (requires OAuth for `com.kuriosity.engineering`).
2. After any large import or restore, open **Members** and spot-check a few profiles.

## How the tree decides what to show

| Concept | What it means |
|--------|----------------|
| **Focal person** | Who the tree is centered on (green border, “You” when it is you). Tap someone else to recenter. |
| **Primary marriage** | Which spouse sits on the marriage row when someone has more than one union. Set on the member profile (**Show on tree** / primary union). |
| **Default depth** | About **2 generations** up and down, plus limited siblings/cousins. |
| **Load more** | Adds generations, siblings, and cousin bands step by step — prefer this over **Load full tree** on large families. |

## Recommended workflow (large trees like 100+ people)

1. Open **Tree** with yourself or the person you care about as focal (tap them on Home or Members).
2. Confirm **primary spouse** on the profile if they have multiple marriages.
3. Tap **Load more** once or twice until parents, your marriage row, and children look correct.
4. Use **Fine-tune expansion** only when you need a specific branch (parents / siblings / children).
5. Avoid **Load full tree** until labels and spacing look good at partial depth — full tree pulls every cousin wing and collaterals into one canvas.
6. For two people far apart, use **Find relation** (path highlight) instead of expanding the whole tree.

## Reading relationship labels

- Labels are always **relative to the focal person** (not relative to the parent couple on that row).
- **Son / Daughter / Stepson / Stepdaughter** — direct children of the focal person (or step via marriage rules).
- **Brother / Sister / Cousin** — same generation as you or cousin paths.
- **Relative** — still connected, but the path is complex (often a cousin or in-law placed on a crowded row). Tap the person → **Find relation** from Tools for the full path.

If one child shows **Daughter** and another **Relative** on the same row, the second person is usually **not** a child of the focal couple in the data (cousin, niece, or collateral). Check their **parents** on the profile.

## Restore after backup

1. Account → **Archive settings** → paste JSON export → **Import** (replaces local archive — export first).
2. Or restore from Google Drive when that flow is enabled on your build.
3. Re-open the app; tree rebuilds from SQLite automatically.

## When UI still overlaps

- Pinch-zoom out on the tree canvas.
- Reduce expansion (restart from focal + **Load more** in smaller steps).
- Report remaining overlap with focal name + screenshot — layout spacing is tuned in `shared/pedigreeLayoutTokens.ts` and collateral placement.
