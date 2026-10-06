# Genealogy business processes

Code for kinship features should follow these **processes** (user journeys), not one-off screen logic.

## Process: View a member’s family tree

1. User picks a person (profile **Family tree**, tree sheet **Center tree**, tap on graph, or `familyCode` deep link).
2. **View focal** = that person’s `familyCode` (graph ego), not the registered “you” unless no other choice.
3. Persist **last viewed tree focal** per archive lane (`live` / `demo`).
4. **Registered focal** (`session.focalFamilyCode`) is only the default when there is no deep link and no last viewed.
5. **Tap** a person on the graph to recenter the tree on them; **long press** opens profile and relation actions.
6. **List view** on tree: tap a child name to recenter on that person (switches to graph focal).
7. **Default expansion** shows about two generations; **Load more** / **Load full tree** (and fine-tune parents, siblings, children) widen inclusion per `shared/genealogy/treeExpansion.ts` and cousin-degree rules in `shared/genealogy/cousinInclusion.ts`.
8. **Cousin-network presentation** (canvas cards): generation/side color bands (GGP, GP, paternal, maternal, focal), bilingual name lines, English kinship role from focal when the archive loads, dashed red marriage connectors, marriage heart band, and a **purple path** when the primary spouse is also a cousin (same rule as Find relation). Legend appears on immersive graph when the cousin link applies.

Implementation: `lib/tree/focalFamilyCode.ts`, `app/(tabs)/tree.tsx`, `buildLocalFamilyGraph`, `buildPedigreeCanvasPayload`, `GraphWebView`, `TreeLegendBar`, `shared/genealogy/pedigreeNodePresentation.ts`, `shared/pedigreeBandTheme.ts`.

## Process: Mutual relationship between two people

1. User opens **Tools → Find relation** (legacy “Compare” redirects here).
2. User selects person A and person B.
3. System finds kinship **A → B** and **B → A** (shortest paths).
4. UI shows both directional labels and the **link chain** on the shortest path.
5. User picks whose tree to center on, then **View path on tree**.

Implementation: `shared/genealogy/mutualRelationship.ts`, `lib/kinship/mutualRelationshipProcess.ts`, `app/find-relation.tsx`.

## Process: Add member with relationship

1. Choose relationship role (parent / child / spouse / sibling).
2. Enter person fields (first name required; Pakistan place pickers optional).
3. Pick anchor member(s) from a **filtered** list with relation-aware subtitles.
4. Save creates the person and links via `linkNewMemberToAnchors` (SQLite kinship rules).

Implementation: `AddMemberBottomSheet`, `addMemberRelationCandidates.ts`, `linkNewMemberToAnchor.ts`.

## Process: Edit member profile

1. Open profile → Edit.
2. `PersonFields` + Pakistan province/city pickers for birth, living city, home town.
3. Save writes formatted `"City, Province"` strings to SQLite.

Implementation: `useMemberProfileScreen`, `pakistanPlaceForm.ts`, `MemberProfileSections`.

## Process: Unlink relationships

From member profile: unlink parents, marriage, or child from union (`localRepository.ext` + profile sections).

## Account focal vs view focal

| Concept | Meaning |
|--------|---------|
| Account focal | Person who registered; “relation to me” on profiles |
| View focal | Who the marriage-row tree is built around |

Do not reset view focal to account focal when opening another member’s tree.
