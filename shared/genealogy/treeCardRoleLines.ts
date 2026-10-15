import { KINSHIP_LABEL_FALLBACK } from "../humanKinshipLabel";

/** English role text that fits small pedigree cards (focal-relative). */
export function shortenTreeRoleEnglish(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "";
  if (trimmed === KINSHIP_LABEL_FALLBACK || trimmed.startsWith("Relative (see")) {
    return "Relative";
  }
  if (trimmed.length > 32) {
    const cut = trimmed.split("(")[0]?.trim();
    if (cut && cut.length <= 32) return cut;
    return "Relative";
  }
  return trimmed;
}

function normalizeRole(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Avoid duplicate EN/UR lines on canvas cards; drop band fallback when it duplicates English.
 */
export function treeCardRoleLines(
  roleEn: string,
  roleUr: string,
  bandUrFallback: string,
): { roleLineEn: string; roleLineUr: string } {
  const roleLineEn = shortenTreeRoleEnglish(roleEn);
  let roleLineUr = (roleUr || "").trim();
  if (!roleLineUr && bandUrFallback.trim()) {
    roleLineUr = bandUrFallback.trim();
  }
  if (roleLineUr && normalizeRole(roleLineUr) === normalizeRole(roleLineEn)) {
    roleLineUr = "";
  }
  if (roleLineUr && /^[a-z\s\-']+$/i.test(roleLineUr) && roleLineEn) {
    if (normalizeRole(roleLineUr) === normalizeRole(roleLineEn)) {
      roleLineUr = "";
    }
  }
  return { roleLineEn, roleLineUr };
}
