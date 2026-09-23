import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";

import { copy } from "@/content/businessCopy";

type TreeGraphExpandBarProps = {
  canLoadParents: boolean;
  canLoadChildren: boolean;
  canLoadSiblings: boolean;
  onLoadParents: () => void;
  onLoadChildren: () => void;
  onLoadSiblings: () => void;
};

export function TreeGraphExpandBar({
  canLoadParents,
  canLoadChildren,
  canLoadSiblings,
  onLoadParents,
  onLoadChildren,
  onLoadSiblings,
}: TreeGraphExpandBarProps) {
  return (
    <View style={styles.row}>
      <Button compact mode="outlined" disabled={!canLoadParents} onPress={onLoadParents}>
        {copy.tree.loadParents}
      </Button>
      <Button compact mode="outlined" disabled={!canLoadSiblings} onPress={onLoadSiblings}>
        {copy.tree.loadSiblings}
      </Button>
      <Button compact mode="outlined" disabled={!canLoadChildren} onPress={onLoadChildren}>
        {copy.tree.loadChildren}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
