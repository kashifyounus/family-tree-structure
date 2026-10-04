import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { getParentNamesForPerson } from "@/lib/db/parentDisplay";
import { getLocalUnionsForPerson } from "@/lib/db/localRepository";
import { getDatabase } from "@/lib/db/database";

export type LiveChecklistStepId = "spouse" | "parents" | "children" | "tree";

export type LiveChecklistStep = {
  id: LiveChecklistStepId;
  done: boolean;
};

export type LiveArchiveProgress = {
  steps: LiveChecklistStep[];
  checklistComplete: boolean;
  generationSpan: number;
  marriageCount: number;
};

function hasRecordedParents(focalPersonId: string): boolean {
  const parents = getParentNamesForPerson(focalPersonId);
  return Boolean(parents.fatherName || parents.motherName);
}

function hasSpouseOrPartner(focalPersonId: string): boolean {
  return getLocalUnionsForPerson(focalPersonId).length > 0;
}

function hasChildren(focalPersonId: string): boolean {
  const unions = getLocalUnionsForPerson(focalPersonId);
  return unions.some((u) => u.children.length > 0);
}

/** Max ancestor + descendant hops from focal (capped) using union graph. */
export function estimateGenerationSpan(focalPersonId: string): number {
  const { allUnions } = loadKinshipDataset();
  const childToUnion = new Map<string, string[]>();
  const unionChildren = new Map<string, string[]>();
  for (const u of allUnions) {
    unionChildren.set(
      u.id,
      u.childships.map((c) => c.childId),
    );
    for (const c of u.childships) {
      const list = childToUnion.get(c.childId) ?? [];
      list.push(u.id);
      childToUnion.set(c.childId, list);
    }
  }

  function partnersOf(personId: string): string[] {
    const partners = new Set<string>();
    for (const u of allUnions) {
      if (u.partner1Id === personId) partners.add(u.partner2Id);
      if (u.partner2Id === personId) partners.add(u.partner1Id);
    }
    return [...partners];
  }

  function walkUp(personId: string, depth: number, seen: Set<string>): number {
    if (depth >= 12 || seen.has(`u-${personId}`)) return depth;
    seen.add(`u-${personId}`);
    let max = depth;
    const parentUnions = childToUnion.get(personId) ?? [];
    for (const unionId of parentUnions) {
      const u = allUnions.find((x) => x.id === unionId);
      if (!u) continue;
      for (const parentId of [u.partner1Id, u.partner2Id]) {
        max = Math.max(max, walkUp(parentId, depth + 1, seen));
      }
    }
    return max;
  }

  function walkDown(personId: string, depth: number, seen: Set<string>): number {
    if (depth >= 12 || seen.has(`d-${personId}`)) return depth;
    seen.add(`d-${personId}`);
    let max = depth;
    for (const spouseId of partnersOf(personId)) {
      max = Math.max(max, walkDown(spouseId, depth, seen));
    }
    for (const u of allUnions) {
      if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
      for (const childId of unionChildren.get(u.id) ?? []) {
        max = Math.max(max, walkDown(childId, depth + 1, seen));
      }
    }
    return max;
  }

  const up = walkUp(focalPersonId, 0, new Set());
  const down = walkDown(focalPersonId, 0, new Set());
  return Math.max(1, up + down + 1);
}

export function countLocalMarriages(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM unions",
  );
  return row?.count ?? 0;
}

export function evaluateLiveArchiveProgress(
  focalPersonId: string | null | undefined,
  options?: { treeMapOpened?: boolean },
): LiveArchiveProgress {
  const treeMapOpened = options?.treeMapOpened ?? false;
  const marriageCount = countLocalMarriages();
  if (!focalPersonId) {
    return {
      steps: [
        { id: "spouse", done: false },
        { id: "parents", done: false },
        { id: "children", done: false },
        { id: "tree", done: false },
      ],
      checklistComplete: false,
      generationSpan: 1,
      marriageCount,
    };
  }

  const spouseDone = hasSpouseOrPartner(focalPersonId);
  const parentsDone = hasRecordedParents(focalPersonId);
  const childrenDone = hasChildren(focalPersonId);
  const treeDone = treeMapOpened;

  const steps: LiveChecklistStep[] = [
    { id: "spouse", done: spouseDone },
    { id: "parents", done: parentsDone },
    { id: "children", done: childrenDone },
    { id: "tree", done: treeDone },
  ];

  return {
    steps,
    checklistComplete:
      spouseDone && parentsDone && childrenDone && treeMapOpened,
    generationSpan: estimateGenerationSpan(focalPersonId),
    marriageCount,
  };
}
