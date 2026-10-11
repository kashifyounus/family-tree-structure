import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import {
  PEDIGREE_BAND_COLORS,
  type PedigreeVisualBand,
} from "../../../shared/pedigreeBandTheme";
import {
  PEDIGREE_COLOR_CHILD,
  PEDIGREE_COLOR_PARENT,
  PEDIGREE_COLOR_SPOUSE,
} from "../../../shared/pedigreeLayoutTokens";

const LEGEND_BANDS: PedigreeVisualBand[] = [
  "ggp",
  "gp",
  "paternal",
  "maternal",
  "focal",
];

type TreeLegendBarProps = {
  showCousinLink?: boolean;
  showSharedAncestor?: boolean;
  showGhostHint?: boolean;
};

export function TreeLegendBar({
  showCousinLink,
  showSharedAncestor,
  showGhostHint,
}: TreeLegendBarProps) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <AppText variant="labelSmall" style={styles.title}>
        {copy.tree.legendTitle}
      </AppText>
      <View style={styles.row}>
        {LEGEND_BANDS.map((band) => (
          <View key={band} style={styles.chip}>
            <View
              style={[styles.swatch, { backgroundColor: PEDIGREE_BAND_COLORS[band] }]}
            />
            <AppText variant="labelSmall" style={styles.chipText}>
              {copy.tree.legendBand(band)}
            </AppText>
          </View>
        ))}
        <View style={styles.chip}>
          <View style={[styles.lineSwatch, { backgroundColor: PEDIGREE_COLOR_PARENT }]} />
          <AppText variant="labelSmall" style={styles.chipText}>
            {copy.tree.legendConnectorParent}
          </AppText>
        </View>
        <View style={styles.chip}>
          <View style={[styles.lineSwatch, { backgroundColor: PEDIGREE_COLOR_CHILD }]} />
          <AppText variant="labelSmall" style={styles.chipText}>
            {copy.tree.legendConnectorChild}
          </AppText>
        </View>
        <View style={styles.chip}>
          <View style={[styles.lineSwatch, styles.marriageDash]} />
          <AppText variant="labelSmall" style={styles.chipText}>
            {copy.tree.legendConnectorMarriage}
          </AppText>
        </View>
        {showCousinLink ? (
          <View style={styles.chip}>
            <View style={[styles.swatch, styles.cousinDash]} />
            <AppText variant="labelSmall" style={styles.chipText}>
              {copy.tree.legendCousinLink}
            </AppText>
          </View>
        ) : null}
        {showSharedAncestor ? (
          <View style={styles.chip}>
            <View style={[styles.swatch, styles.sharedAnc]} />
            <AppText variant="labelSmall" style={styles.chipText}>
              {copy.tree.legendSharedAncestor}
            </AppText>
          </View>
        ) : null}
        {showGhostHint ? (
          <View style={styles.chip}>
            <View style={[styles.swatch, styles.ghostSwatch]} />
            <AppText variant="labelSmall" style={styles.chipText}>
              {copy.tree.legendGhostBranch}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 253, 248, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(27, 67, 50, 0.08)",
  },
  title: { color: "#4b5563", marginBottom: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4 },
  swatch: { width: 14, height: 8, borderRadius: 2 },
  lineSwatch: { width: 18, height: 4, borderRadius: 2 },
  marriageDash: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: PEDIGREE_COLOR_SPOUSE,
    borderStyle: "dashed",
    height: 0,
    marginVertical: 2,
  },
  cousinDash: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#7828A0",
    borderStyle: "dashed",
    width: 18,
  },
  sharedAnc: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: PEDIGREE_COLOR_PARENT,
  },
  ghostSwatch: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    borderStyle: "dashed",
  },
  chipText: { color: "#374151", fontSize: 10 },
});
