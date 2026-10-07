import {
  PEDIGREE_CARD_BIG_W,
  PEDIGREE_COUPLE_OFFSET,
} from "../pedigreeLayoutTokens";
import type { MarriageLayoutUnion } from "../marriageTreeLayout";
import { maternalWingPersonIds } from "./maternalWingIds";

const POSTER_ANCESTOR_SPREAD = 1.32;
const POSTER_ROW_SPREAD = 1.12;

/**
 * Widen paternal (left) and maternal (right) wings for landscape cousin-network poster view.
 */
export function applyCousinNetworkPosterSpread(
  positions: Map<string, { x: number; y: number }>,
  focalId: string,
  focalPartnerIds: readonly string[],
  unions: readonly MarriageLayoutUnion[],
  included: ReadonlySet<string>,
  focalRowY: number,
): void {
  const maternalIds = maternalWingPersonIds(
    focalId,
    focalPartnerIds,
    unions,
    included,
  );
  const focalPos = positions.get(focalId);
  if (!focalPos) return;

  const partnerId = focalPartnerIds[0];
  const partnerPos = partnerId ? positions.get(partnerId) : undefined;
  const husbandX =
    partnerPos && partnerPos.x < focalPos.x ? focalPos.x : focalPos.x;
  const wifeX =
    partnerPos && partnerPos.x > focalPos.x
      ? partnerPos.x
      : focalPos.x + PEDIGREE_COUPLE_OFFSET;
  const centerX = (Math.min(focalPos.x, husbandX, wifeX) +
    Math.max(
      focalPos.x + PEDIGREE_CARD_BIG_W,
      husbandX + PEDIGREE_CARD_BIG_W,
      wifeX + PEDIGREE_CARD_BIG_W,
    )) / 2;

  for (const [personId, pos] of positions) {
    if (!included.has(personId)) continue;
    const dx = pos.x - centerX;
    const isAncestor = pos.y < focalRowY - 2;
    const onMarriageRow = Math.abs(pos.y - focalRowY) < 2;
    let factor = 1;
    if (isAncestor) factor = POSTER_ANCESTOR_SPREAD;
    else if (onMarriageRow) factor = POSTER_ROW_SPREAD;

    const maternal = maternalIds.has(personId);
    if (maternal && dx >= 0) {
      positions.set(personId, { x: centerX + dx * factor, y: pos.y });
    } else if (!maternal && dx <= 0) {
      positions.set(personId, { x: centerX + dx * factor, y: pos.y });
    } else if (personId === focalId || personId === partnerId) {
      positions.set(personId, { x: centerX + dx * (onMarriageRow ? 1 : factor), y: pos.y });
    }
  }
}
