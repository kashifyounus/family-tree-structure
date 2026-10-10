import {
  humanKinshipLabelFromSteps,
  type KinshipGender,
  type KinshipLabelStep,
} from "../humanKinshipLabel";
import type { KinshipLabelLocale } from "../kinshipLabelLocale";

export type StructuralKinshipUnion = {
  partner1Id: string;
  partner2Id: string;
  childships: { childId: string; relationshipType?: string }[];
};

function genderOf(
  peopleById: Map<string, { gender?: KinshipGender }>,
  personId: string,
): KinshipGender {
  return peopleById.get(personId)?.gender ?? null;
}

function labelSteps(
  steps: KinshipLabelStep[],
  locale: KinshipLabelLocale,
): string | null {
  return humanKinshipLabelFromSteps(steps, locale);
}

function partnersOf(
  personId: string,
  unions: readonly StructuralKinshipUnion[],
): string[] {
  const out = new Set<string>();
  for (const u of unions) {
    if (u.partner1Id === personId) out.add(u.partner2Id);
    if (u.partner2Id === personId) out.add(u.partner1Id);
  }
  return [...out];
}

function parentsOf(
  personId: string,
  unions: readonly StructuralKinshipUnion[],
): string[] {
  const out = new Set<string>();
  for (const u of unions) {
    if (!u.childships.some((c) => c.childId === personId)) continue;
    if (u.partner1Id !== personId) out.add(u.partner1Id);
    if (u.partner2Id !== personId) out.add(u.partner2Id);
  }
  return [...out];
}

function childrenOf(
  personId: string,
  unions: readonly StructuralKinshipUnion[],
): string[] {
  const out: string[] = [];
  for (const u of unions) {
    if (u.partner1Id !== personId && u.partner2Id !== personId) continue;
    for (const cs of u.childships) out.push(cs.childId);
  }
  return out;
}

function childRelationshipType(
  focalId: string,
  childId: string,
  unions: readonly StructuralKinshipUnion[],
): string | undefined {
  for (const u of unions) {
    if (u.partner1Id !== focalId && u.partner2Id !== focalId) continue;
    const cs = u.childships.find((c) => c.childId === childId);
    if (cs) return cs.relationshipType;
  }
  return undefined;
}

/**
 * Direct family roles for tree cards (focal-relative), before graph-path kinship.
 */
export function structuralKinshipLabelForLocale(
  focalId: string,
  personId: string,
  peopleById: Map<string, { id: string; gender?: KinshipGender }>,
  unions: readonly StructuralKinshipUnion[],
  locale: KinshipLabelLocale,
): string | null {
  if (focalId === personId) {
    return locale === "ur" ? "آپ" : "You";
  }

  const targetGender = genderOf(peopleById, personId);

  const focalParents = parentsOf(focalId, unions);
  const theirParents = parentsOf(personId, unions);

  if (focalParents.includes(personId)) {
    return labelSteps([{ relation: "child", toGender: targetGender }], locale);
  }

  if (partnersOf(focalId, unions).includes(personId)) {
    return labelSteps([{ relation: "spouse", toGender: targetGender }], locale);
  }

  if (childrenOf(focalId, unions).includes(personId)) {
    const relType = childRelationshipType(focalId, personId, unions);
    if (relType === "STEP") {
      return labelSteps(
        [
          { relation: "spouse", toGender: null },
          { relation: "parent", toGender: targetGender },
        ],
        locale,
      );
    }
    return labelSteps([{ relation: "parent", toGender: targetGender }], locale);
  }

  const sharedParents = focalParents.filter((p) => theirParents.includes(p));
  if (sharedParents.length > 0) {
    return labelSteps(
      [
        { relation: "child", toGender: genderOf(peopleById, sharedParents[0]) },
        { relation: "parent", toGender: targetGender },
      ],
      locale,
    );
  }

  for (const childId of childrenOf(focalId, unions)) {
    if (childrenOf(childId, unions).includes(personId)) {
      return labelSteps(
        [
          { relation: "parent", toGender: genderOf(peopleById, childId) },
          { relation: "parent", toGender: targetGender },
        ],
        locale,
      );
    }
  }

  for (const parentId of focalParents) {
    for (const auntUncleId of childrenOf(parentId, unions)) {
      if (auntUncleId === focalId) continue;
      if (childrenOf(auntUncleId, unions).includes(personId)) {
        return labelSteps(
          [
            { relation: "child", toGender: genderOf(peopleById, parentId) },
            { relation: "child", toGender: genderOf(peopleById, auntUncleId) },
            { relation: "parent", toGender: targetGender },
          ],
          locale,
        );
      }
    }
  }

  return null;
}

export function structuralKinshipLabelsForTree(
  focalId: string,
  personId: string,
  peopleById: Map<string, { id: string; gender?: KinshipGender }>,
  unions: readonly StructuralKinshipUnion[],
): { en: string; ur: string } | null {
  const en = structuralKinshipLabelForLocale(
    focalId,
    personId,
    peopleById,
    unions,
    "en",
  );
  const ur = structuralKinshipLabelForLocale(
    focalId,
    personId,
    peopleById,
    unions,
    "ur",
  );
  if (!en && !ur) return null;
  return { en: en ?? "Relative", ur: ur ?? "رشتہ دار" };
}
