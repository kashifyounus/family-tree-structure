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

function nieceNephewLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Niece";
  if (gender === "MALE") return "Nephew";
  return "Nibling";
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

function parentInLawLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Mother-in-law";
  if (gender === "MALE") return "Father-in-law";
  return "Parent-in-law";
}

function childInLawLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Daughter-in-law";
  if (gender === "MALE") return "Son-in-law";
  return "Child-in-law";
}

function siblingInLawLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Sister-in-law";
  if (gender === "MALE") return "Brother-in-law";
  return "Sibling-in-law";
}

function lineageSideFromParentStep(step: KinshipLabelStep | undefined): "paternal" | "maternal" {
  return step?.toGender === "FEMALE" ? "maternal" : "paternal";
}

function sidePrefix(side: "paternal" | "maternal"): string {
  return side === "paternal" ? "Paternal " : "Maternal ";
}

function cousinOrdinal(degree: number): string {
  switch (degree) {
    case 1:
      return "First cousin";
    case 2:
      return "Second cousin";
    case 3:
      return "Third cousin";
    default:
      return `${degree}th cousin`;
  }
}

/** Up via `child` edges, then down via `parent` edges (BFS kinship graph). */
function isUpDownPath(relations: string[], up: number, down: number): boolean {
  if (relations.length !== up + down) return false;
  for (let i = 0; i < up; i++) {
    if (relations[i] !== "child") return false;
  }
  for (let i = up; i < relations.length; i++) {
    if (relations[i] !== "parent") return false;
  }
  return true;
}

function labelCousinPath(steps: KinshipLabelStep[], up: number): string | null {
  if (!isUpDownPath(steps.map((s) => s.relation), up, up) || up < 2) {
    return null;
  }
  const degree = up - 1;
  const side = lineageSideFromParentStep(steps[0]);
  const base = cousinOrdinal(degree);
  return `${sidePrefix(side)}${base}`;
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
    if (a === "parent" && b === "spouse") {
      return childInLawLabel(targetGender);
    }
    if (a === "spouse" && b === "child") {
      return parentInLawLabel(targetGender);
    }
    return null;
  }

  if (relations.length === 3) {
    const [a, b, c] = relations;
    if (a === "child" && b === "child" && c === "parent") {
      const side = lineageSideFromParentStep(steps[0]);
      return auntUncleLabel(side, targetGender);
    }
    if (a === "child" && b === "parent" && c === "parent") {
      return nieceNephewLabel(targetGender);
    }
    if (a === "spouse" && b === "child" && c === "parent") {
      return siblingInLawLabel(targetGender);
    }
    return null;
  }

  if (relations.length >= 4 && relations.length % 2 === 0) {
    const half = relations.length / 2;
    const cousin = labelCousinPath(steps, half);
    if (cousin) return cousin;
  }

  return null;
}

/** Shown when BFS finds a path but no simple English label is defined. */
export const KINSHIP_LABEL_FALLBACK =
  "Relative (see family tree for the full connection)";
