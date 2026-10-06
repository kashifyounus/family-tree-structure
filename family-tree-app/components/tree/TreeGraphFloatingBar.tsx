import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ButtonText } from "@/components/ui/button";
import { copy } from "@/content/businessCopy";

type TreeGraphFloatingBarProps = {
  canLoadMore: boolean;
  onLoadMore: () => void;
  onLoadFull: () => void;
  onOpenFineTune?: () => void;
  fineTuneOpen?: boolean;
  canLoadParents: boolean;
  canLoadChildren: boolean;
  canLoadSiblings: boolean;
  onLoadParents: () => void;
  onLoadChildren: () => void;
  onLoadSiblings: () => void;
};

export function TreeGraphFloatingBar({
  canLoadMore,
  onLoadMore,
  onLoadFull,
  onOpenFineTune,
  fineTuneOpen,
  canLoadParents,
  canLoadChildren,
  canLoadSiblings,
  onLoadParents,
  onLoadChildren,
  onLoadSiblings,
}: TreeGraphFloatingBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}
      pointerEvents="box-none"
    >
      <View style={styles.panel}>
        <View style={styles.primaryRow}>
          <Button
            testID="tree-expand"
            size="sm"
            className="flex-1 rounded-full"
            disabled={!canLoadMore}
            onPress={onLoadMore}
          >
            <ButtonText>{copy.tree.loadMore}</ButtonText>
          </Button>
          <Button
            testID="tree-expand-max"
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={!canLoadMore}
            onPress={onLoadFull}
          >
            <ButtonText>{copy.tree.expandTreeMax}</ButtonText>
          </Button>
        </View>
        {fineTuneOpen ? (
          <View style={styles.fineRow}>
            <Button
              testID="tree-load-parents"
              size="sm"
              variant="ghost"
              disabled={!canLoadParents}
              onPress={onLoadParents}
            >
              <ButtonText>{copy.tree.loadParents}</ButtonText>
            </Button>
            <Button
              testID="tree-load-siblings"
              size="sm"
              variant="ghost"
              disabled={!canLoadSiblings}
              onPress={onLoadSiblings}
            >
              <ButtonText>{copy.tree.loadSiblings}</ButtonText>
            </Button>
            <Button
              testID="tree-load-children"
              size="sm"
              variant="ghost"
              disabled={!canLoadChildren}
              onPress={onLoadChildren}
            >
              <ButtonText>{copy.tree.loadChildren}</ButtonText>
            </Button>
          </View>
        ) : null}
        {onOpenFineTune ? (
          <Button size="sm" variant="ghost" onPress={onOpenFineTune}>
            <ButtonText>
              {fineTuneOpen ? copy.tree.hideFineTune : copy.tree.showFineTune}
            </ButtonText>
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
  },
  panel: {
    backgroundColor: "rgba(255, 253, 248, 0.96)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(27, 67, 50, 0.12)",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 4,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  primaryRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  fineRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
});
