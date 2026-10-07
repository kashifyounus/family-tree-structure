import {
  DEFAULT_KINSHIP_LABEL_LOCALE,
  type KinshipLabelLocale,
} from "./kinshipLabelLocale";

export type KinshipGender = "MALE" | "FEMALE" | "OTHER" | null | undefined;

export type { KinshipLabelLocale } from "./kinshipLabelLocale";
export { DEFAULT_KINSHIP_LABEL_LOCALE } from "./kinshipLabelLocale";

export type KinshipLabelStep = {
  relation: string;
  toGender?: KinshipGender;
};

function parentLabel(
  gender: KinshipGender,
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string {
  if (locale === "ur") {
    if (gender === "FEMALE") return "والدہ";
    if (gender === "MALE") return "والد";
    return "والدین";
  }
  if (locale === "en-PK") {
    if (gender === "FEMALE") return "Ammi";
    if (gender === "MALE") return "Abbu";
    return "Parent";
  }
  if (gender === "FEMALE") return "Mother";
  if (gender === "MALE") return "Father";
  return "Parent";
}

function childLabel(
  gender: KinshipGender,
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string {
  if (locale === "ur") {
    if (gender === "FEMALE") return "بیٹی";
    if (gender === "MALE") return "بیٹا";
    return "اولاد";
  }
  if (locale === "en-PK") {
    if (gender === "FEMALE") return "Beti";
    if (gender === "MALE") return "Beta";
    return "Child";
  }
  if (gender === "FEMALE") return "Daughter";
  if (gender === "MALE") return "Son";
  return "Child";
}

function spouseLabel(
  gender: KinshipGender,
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string {
  if (locale === "ur") {
    if (gender === "FEMALE") return "بیوی";
    if (gender === "MALE") return "شوہر";
    return "شریک حیات";
  }
  if (locale === "en-PK") {
    if (gender === "FEMALE") return "Biwi";
    if (gender === "MALE") return "Shohar";
    return "Spouse";
  }
  if (gender === "FEMALE") return "Wife";
  if (gender === "MALE") return "Husband";
  return "Spouse";
}

function siblingLabel(
  gender: KinshipGender,
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string {
  if (locale === "ur") {
    if (gender === "FEMALE") return "بہن";
    if (gender === "MALE") return "بھائی";
    return "بہن / بھائی";
  }
  if (locale === "en-PK") {
    if (gender === "FEMALE") return "Behan";
    if (gender === "MALE") return "Bhai";
    return "Sibling";
  }
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

function greatGrandparentLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Great-grandmother";
  if (gender === "MALE") return "Great-grandfather";
  return "Great-grandparent";
}

function greatGrandchildLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Great-granddaughter";
  if (gender === "MALE") return "Great-grandson";
  return "Great-grandchild";
}

function nieceNephewLabel(gender: KinshipGender): string {
  if (gender === "FEMALE") return "Niece";
  if (gender === "MALE") return "Nephew";
  return "Nibling";
}

function auntUncleLabel(
  side: "paternal" | "maternal",
  gender: KinshipGender,
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string {
  if (locale === "ur") {
    if (side === "paternal") {
      return gender === "FEMALE" ? "پھپھو" : "چچا";
    }
    return gender === "FEMALE" ? "خالہ" : "ماموں";
  }
  if (locale === "en-PK") {
    if (side === "paternal") {
      return gender === "FEMALE" ? "Phuppo" : "Chacha";
    }
    return gender === "FEMALE" ? "Khala" : "Mama";
  }
  const role = gender === "FEMALE" ? "Aunt" : "Uncle";
  const prefix = side === "paternal" ? "Paternal" : "Maternal";
  return `${prefix} ${role}`;
}

function greatAuntUncleLabel(
  side: "paternal" | "maternal",
  gender: KinshipGender,
): string {
  const role = gender === "FEMALE" ? "Great-aunt" : "Great-uncle";
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

function removedSuffix(times: number): string {
  if (times === 1) return " once removed";
  if (times === 2) return " twice removed";
  return ` ${times} times removed`;
}

/** Up via `child` edges, then down via `parent` edges (BFS kinship graph). */
function parseUpDownPath(relations: string[]): { up: number; down: number } | null {
  let up = 0;
  while (up < relations.length && relations[up] === "child") up += 1;
  let down = 0;
  while (down < relations.length - up && relations[relations.length - 1 - down] === "parent") {
    down += 1;
  }
  if (up + down !== relations.length) return null;
  return { up, down };
}

function labelCousinPath(
  steps: KinshipLabelStep[],
  up: number,
  down: number,
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string | null {
  const relations = steps.map((s) => s.relation);
  const parsed = parseUpDownPath(relations);
  if (!parsed || parsed.up !== up || parsed.down !== down) return null;
  if (up < 2 || down < 2) return null;

  const degree = Math.min(up, down) - 1;
  const removed = Math.abs(up - down);
  const side = lineageSideFromParentStep(steps[0]);
  const base = cousinOrdinal(degree);
  const label = removed === 0 ? base : `${base}${removedSuffix(removed)}`;
  if (locale === "ur") {
    const ord =
      degree === 1
        ? "پہلا کزن"
        : degree === 2
          ? "دوسرا کزن"
          : degree === 3
            ? "تیسرا کزن"
            : `${degree}واں کزن`;
    const sideUr =
      side === "paternal" ? "والد کی طرف" : "والدہ کی طرف";
    const rem =
      removed === 0
        ? ""
        : removed === 1
          ? " (ایک بار ہٹ)"
          : ` (${removed} بار ہٹ)`;
    return `${sideUr} — ${ord}${rem}`;
  }
  if (locale === "en-PK") {
    const sa = removed === 0 ? `${base} (cousin)` : `${base}${removedSuffix(removed)}`;
    return `${side === "paternal" ? "Chacha line — " : "Khala/Mama line — "}${sa}`;
  }
  return `${sidePrefix(side)}${label}`;
}

function labelUpDownKinship(
  steps: KinshipLabelStep[],
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string | null {
  const relations = steps.map((s) => s.relation);
  const parsed = parseUpDownPath(relations);
  if (!parsed) return null;
  const { up, down } = parsed;
  const targetGender = steps[steps.length - 1]?.toGender;

  if (down === 0 && up >= 2) {
    if (up === 2) {
      const side = lineageSideFromParentStep(steps[0]);
      if (locale === "ur") {
        if (side === "maternal") {
          return targetGender === "FEMALE" ? "نانی" : "نانا";
        }
        return targetGender === "FEMALE" ? "دادی" : "دادا";
      }
      if (locale === "en-PK") {
        if (side === "maternal") {
          return targetGender === "FEMALE" ? "Nani" : "Nana";
        }
        return targetGender === "FEMALE" ? "Dadi" : "Dada";
      }
      return grandparentLabel(targetGender);
    }
    if (up === 3) {
      if (locale === "ur") {
        return targetGender === "FEMALE" ? "پردادی" : "پردادا";
      }
      return greatGrandparentLabel(targetGender);
    }
    return null;
  }
  if (up === 0 && down >= 2) {
    if (down === 2) return grandchildLabel(targetGender);
    if (down === 3) return greatGrandchildLabel(targetGender);
    return null;
  }

  if (up >= 2 && down >= 2) {
    return labelCousinPath(steps, up, down, locale);
  }

  return null;
}

/**
 * Returns a short kinship label for common BFS paths, or null when no simple label exists.
 */
export function humanKinshipLabelFromSteps(
  steps: KinshipLabelStep[],
  locale: KinshipLabelLocale = DEFAULT_KINSHIP_LABEL_LOCALE,
): string | null {
  if (steps.length === 0) {
    return locale === "ur" ? "آپ" : "Same person";
  }

  const relations = steps.map((s) => s.relation);
  const targetGender = steps[steps.length - 1]?.toGender;

  if (relations.length === 1) {
    const rel = relations[0];
    if (rel === "child") return parentLabel(targetGender, locale);
    if (rel === "parent") return childLabel(targetGender, locale);
    if (rel === "spouse") return spouseLabel(targetGender, locale);
    return null;
  }

  if (relations.length === 2) {
    const [a, b] = relations;
    if (a === "child" && b === "child") {
      const side = lineageSideFromParentStep(steps[0]);
      if (locale === "ur") {
        if (side === "maternal") {
          return targetGender === "FEMALE" ? "نانی" : "نانا";
        }
        return targetGender === "FEMALE" ? "دادی" : "دادا";
      }
      if (locale === "en-PK") {
        if (side === "maternal") {
          return targetGender === "FEMALE" ? "Nani" : "Nana";
        }
        return targetGender === "FEMALE" ? "Dadi" : "Dada";
      }
      return grandparentLabel(targetGender);
    }
    if (a === "parent" && b === "parent") {
      return grandchildLabel(targetGender);
    }
    if (a === "child" && b === "parent") {
      return siblingLabel(targetGender, locale);
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
      return auntUncleLabel(side, targetGender, locale);
    }
    if (a === "child" && b === "parent" && c === "parent") {
      return nieceNephewLabel(targetGender);
    }
    if (a === "spouse" && b === "child" && c === "parent") {
      return siblingInLawLabel(targetGender);
    }
    if (a === "child" && b === "child" && c === "child") {
      return greatGrandparentLabel(targetGender);
    }
    if (a === "parent" && b === "parent" && c === "parent") {
      return greatGrandchildLabel(targetGender);
    }
    return null;
  }

  if (relations.length === 4) {
    const [a, b, c, d] = relations;
    if (a === "child" && b === "child" && c === "child" && d === "parent") {
      const side = lineageSideFromParentStep(steps[0]);
      return greatAuntUncleLabel(side, targetGender);
    }
  }

  const upDownLabel = labelUpDownKinship(steps, locale);
  if (upDownLabel) return upDownLabel;

  if (relations.length >= 4 && relations.length % 2 === 0) {
    const half = relations.length / 2;
    const cousin = labelCousinPath(steps, half, half, locale);
    if (cousin) return cousin;
  }

  if (relations.length >= 5) {
    const parsed = parseUpDownPath(relations);
    if (parsed && parsed.up >= 2 && parsed.down >= 2) {
      return labelCousinPath(steps, parsed.up, parsed.down, locale);
    }
  }

  return null;
}

/** Shown when BFS finds a path but no simple English label is defined. */
export const KINSHIP_LABEL_FALLBACK =
  "Relative (see family tree for the full connection)";
