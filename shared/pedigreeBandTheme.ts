/** Visual bands for cousin-network tree (stakeholder mockup). */

export type PedigreeVisualBand =
  | "ggp"
  | "gp"
  | "paternal"
  | "maternal"
  | "focal"
  | "spouse"
  | "child";

export const PEDIGREE_BAND_COLORS: Record<PedigreeVisualBand, string> = {
  ggp: "#E6B428",
  gp: "#B83C3C",
  paternal: "#328C50",
  maternal: "#D46B8A",
  focal: "#1B4332",
  spouse: "#B83C3C",
  child: "#328C50",
};

export const PEDIGREE_BAND_LABELS: Record<
  PedigreeVisualBand,
  { en: string; ur: string }
> = {
  ggp: { en: "Great-grandparents", ur: "پردادا / پردادی" },
  gp: { en: "Grandparents", ur: "دادا / دادی" },
  paternal: { en: "Paternal line", ur: "والد کی طرف" },
  maternal: { en: "Maternal line", ur: "والدہ کی طرف" },
  focal: { en: "You", ur: "آپ" },
  spouse: { en: "Spouse", ur: "شریک حیات" },
  child: { en: "Children", ur: "اولاد" },
};

export const PEDIGREE_OVERLAY_COUSIN_COLOR = "#7828A0";
