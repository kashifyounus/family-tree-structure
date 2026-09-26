export type KinshipGender = "MALE" | "FEMALE" | "OTHER" | null | undefined;

export type KinshipLabelStep = {
  relation: string;
  toGender?: KinshipGender;
};

function parentLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Mother";
  if (gender === "MALE") return "Father";
  return "Parent";
}

function childLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Daughter";
  if (gender === "MALE") return "Son";
  return "Child";
}

function spouseLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Wife";
  if (gender === "MALE") return "Husband";
  return "Spouse";
}

function siblingLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Sister";
  if (gender === "MALE") return "Brother";
  return "Sibling";
}

function grandparentLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Grandmother";
  if (gender === "MALE") return "Grandfather";
  return "Grandparent";
}

function grandchildLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Granddaughter";
  if (gender === "MALE") return "Grandson";
  return "Grandchild";
}

function auntUncleLabel(
  side: "paternal" | "maternal",
  gender: KinshipGender,
): string {
  const role = gender === "FEMALE" ? "Aunt" : "Uncle";
  const prefix = side === "paternal" ? "Paternal" : "Maternal";
  return `${prefix} ${role}`;
}

function stepParentLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Stepmother";
  if (gender === "MALE") return "Stepfather";
  return "Step-parent";
}

/**
 * Returns a short kinship label for common BFS paths, or null when no simple label exists.
 */
export function humanKinshipLabelFromSteps(
  steps: KinshipLabelStep[],
): string | null {
  if (steps.length === 0) return "Same person";

  const relations = steps.map((s) => s.relation);
  const targetGender = steps[steps.length - 1]?.toGender;

  if (relations.length === 1) {
    const rel = relations[0];
    if (rel === "child") return parentLabel(targetGender);
    if (rel === "parent") return childLabel(targetGender);
    if (rel === "spouse") return spouseLabel(targetGender);
    return null;
  }

  if (relations.length === 2) {
    const [a, b] = relations;
    if (a === "child" && b === "child") {
      return grandparentLabel(targetGender);
    }
    if (a === "parent" && b === "parent") {
      return grandchildLabel(targetGender);
    }
    if (a === "child" && b === "parent") {
      return siblingLabel(targetGender);
    }
    if (a === "child" && b === "spouse") {
      return stepParentLabel(targetGender);
    }
    if (a === "spouse" && b === "parent") {
      if (targetGender === "FEMALE") return "Stepdaughter";
      if (targetGender === "MALE") return "Stepson";
      return "Stepchild";
    }
    return null;
  }

  if (relations.length === 3) {
    const [a, b, c] = relations;
    if (a === "child" && b === "child" && c === "parent") {
      const parentGender = steps[0]?.toGender;
      const side = parentGender === "FEMALE" ? "maternal" : "paternal";
      return auntUncleLabel(side, targetGender);
    }
    return null;
  }

  return null;
}

/** Shown when BFS finds a path but no simple English label is defined (e.g. cousins). */
export const KINSHIP_LABEL_FALLBACK =
  "Relative (see family tree for the full connection)";
