# Genealogy business processes

Code for kinship features should follow these **processes** (user journeys), not one-off screen logic.

## Process: View a member’s family tree

1. User picks a person (profile **Family tree**, tree sheet **Center tree**, or `familyCode` deep link).
2. **View focal** = that person’s `familyCode` (graph ego), not the registered “you” unless no other choice.
3. Persist **last viewed tree focal** per archive lane (`live` / `demo`).
4. **Registered focal** (`session.focalFamilyCode`) is only the default when there is no deep link and no last viewed.

Implementation: `lib/tree/focalFamilyCode.ts`, `app/(tabs)/tree.tsx`, `buildLocalFamilyGraph`.

## Process: Mutual relationship between two people

1. User selects person A and person B.
2. System finds kinship **A → B** and **B → A** (shortest paths).
3. UI shows both directional labels and the **link chain** on the shortest path (parent / child / spouse steps).
4. Optional: open tree centered on A with path highlighted.

Implementation: `shared/genealogy/mutualRelationship.ts`, `lib/kinship/mutualRelationshipProcess.ts`, `app/find-relation.tsx`.

## Process: Add member with relationship

See add-member flow in `AddMemberBottomSheet` and `linkNewMemberToAnchors`.

## Account focal vs view focal

| Concept | Meaning |
|--------|---------|
| Account focal | Person who registered; “relation to me” on profiles |
| View focal | Who the marriage-row tree is built around |

Do not reset view focal to account focal when opening another member’s tree.
