import { StyleSheet, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { copy } from "@/content/businessCopy";

type TreeGraphExpandBarProps = {
  canExpandTree: boolean;
  canLoadParents: boolean;
  canLoadChildren: boolean;
  canLoadSiblings: boolean;
  onExpandTree: () => void;
  onExpandTreeMax?: () => void;
  onLoadParents: () => void;
  onLoadChildren: () => void;
  onLoadSiblings: () => void;
};

export function TreeGraphExpandBar({
  canExpandTree,
  canLoadParents,
  canLoadChildren,
  canLoadSiblings,
  onExpandTree,
  onExpandTreeMax,
  onLoadParents,
  onLoadChildren,
  onLoadSiblings,
}: TreeGraphExpandBarProps) {
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Button
          testID="tree-expand"
          size="sm"
          disabled={!canExpandTree}
          onPress={onExpandTree}
        >
          <ButtonText>{copy.tree.loadMore}</ButtonText>
        </Button>
        {onExpandTreeMax ? (
          <Button
            testID="tree-expand-max"
            size="sm"
            variant="outline"
            disabled={!canExpandTree}
            onPress={onExpandTreeMax}
          >
            <ButtonText>{copy.tree.expandTreeMax}</ButtonText>
          </Button>
        ) : null}
      </View>
      <View style={styles.row}>
        <Button
          size="sm"
          variant="ghost"
          disabled={!canLoadParents}
          onPress={onLoadParents}
        >
          <ButtonText>{copy.tree.loadParents}</ButtonText>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!canLoadSiblings}
          onPress={onLoadSiblings}
        >
          <ButtonText>{copy.tree.loadSiblings}</ButtonText>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!canLoadChildren}
          onPress={onLoadChildren}
        >
          <ButtonText>{copy.tree.loadChildren}</ButtonText>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
});
