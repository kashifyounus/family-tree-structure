/** v6/v7 display tiers (phone) — focal couple largest; others readable at ~13–14px names. */
export const PEDIGREE_CARD_BIG_W = 112;
export const PEDIGREE_CARD_BIG_H = 74;
export const PEDIGREE_CARD_SMALL_W = 88;
export const PEDIGREE_CARD_SMALL_H = 62;

/** Legacy default card (payload fallback). */
export const PEDIGREE_CARD_W = PEDIGREE_CARD_SMALL_W;
export const PEDIGREE_CARD_H = PEDIGREE_CARD_SMALL_H;

export const PEDIGREE_FOCAL_COUPLE_GAP = 48;
export const PEDIGREE_COUPLE_GAP = PEDIGREE_FOCAL_COUPLE_GAP;
export const PEDIGREE_GENERATION_GAP = 88;
export const PEDIGREE_STEM_CLEARANCE = 32;
export const PEDIGREE_CONNECTOR_STROKE = 4;
export const PEDIGREE_SPOUSE_BAR = 5;
export const PEDIGREE_MIN_L_JOG = 22;
export const PEDIGREE_CHEVRON_OFFSET = 8;
export const PEDIGREE_PARENT_OUTER_MARGIN = 20;
export const PEDIGREE_PARENT_MID_GAP = 64;
export const PEDIGREE_EDGE_INSET = 8;

/** v8 connector colors (Pakistani poster tree — green ancestry, orange descent, burgundy marriage) */
export const PEDIGREE_COLOR_PARENT = "#2D6A4F";
export const PEDIGREE_COLOR_SPOUSE = "#8B2E3C";
export const PEDIGREE_COLOR_CHILD = "#E6A817";
export const PEDIGREE_COLOR_SIBLING = "#2D6A4F";
export const PEDIGREE_COLOR_PATH = "#7828A0";
export const PEDIGREE_PATH_STROKE = 6;

export const PEDIGREE_COLUMN_STEP = PEDIGREE_CARD_SMALL_W + PEDIGREE_MIN_L_JOG;
export const PEDIGREE_COUPLE_OFFSET = PEDIGREE_CARD_BIG_W + PEDIGREE_FOCAL_COUPLE_GAP;
export const PEDIGREE_ROW_STEP = PEDIGREE_CARD_BIG_H + PEDIGREE_GENERATION_GAP;
