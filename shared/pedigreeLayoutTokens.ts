/** Locked v4 pedigree layout tokens (web + mobile). */
export const PEDIGREE_CARD_W = 128;
export const PEDIGREE_CARD_H = 112;

export const PEDIGREE_COUPLE_GAP = 28;
export const PEDIGREE_GENERATION_GAP = 72;
export const PEDIGREE_STEM_CLEARANCE = 20;
export const PEDIGREE_CONNECTOR_STROKE = 2;
export const PEDIGREE_SPOUSE_BAR = 3;
export const PEDIGREE_MIN_L_JOG = 16;
export const PEDIGREE_CHEVRON_OFFSET = 8;

/** Horizontal step between sibling / child columns (card + breathing room). */
export const PEDIGREE_COLUMN_STEP = PEDIGREE_CARD_W + PEDIGREE_MIN_L_JOG;

/** Marriage-row offset: second partner sits card-width + couple gap from first. */
export const PEDIGREE_COUPLE_OFFSET = PEDIGREE_CARD_W + PEDIGREE_COUPLE_GAP;

/** Vertical step between generation rows (card + generation gap). */
export const PEDIGREE_ROW_STEP = PEDIGREE_CARD_H + PEDIGREE_GENERATION_GAP;
