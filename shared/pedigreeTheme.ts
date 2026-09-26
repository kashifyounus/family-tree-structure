import {
  PEDIGREE_CARD_H,
  PEDIGREE_CARD_W,
  PEDIGREE_CONNECTOR_STROKE,
  PEDIGREE_COUPLE_GAP,
  PEDIGREE_GENERATION_GAP,
  PEDIGREE_SPOUSE_BAR,
} from "./pedigreeLayoutTokens";

/** Kuriosity pedigree canvas + connector tokens (mobile tree + showcase). */
export const kuriosityPedigreeTheme = {
  canvasBackground: "#F6F1E7",
  cardSurface: "#FFFDF8",
  connector: "#8A9E94",
  primaryAccent: "#1B4332",
  cardWidth: PEDIGREE_CARD_W,
  cardHeight: PEDIGREE_CARD_H,
  coupleGap: PEDIGREE_COUPLE_GAP,
  generationGap: PEDIGREE_GENERATION_GAP,
  connectorStroke: PEDIGREE_CONNECTOR_STROKE,
  spouseBar: PEDIGREE_SPOUSE_BAR,
  focalRing: "#1B4332",
  focalFill: "#E8F5EE",
};
