import { StyleSheet, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
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
      <Button size="sm" variant="outline" disabled={!canLoadParents} onPress={onLoadParents}>
        <ButtonText>{copy.tree.loadParents}</ButtonText>
      </Button>
      <Button size="sm" variant="outline" disabled={!canLoadSiblings} onPress={onLoadSiblings}>
        <ButtonText>{copy.tree.loadSiblings}</ButtonText>
      </Button>
      <Button size="sm" variant="outline" disabled={!canLoadChildren} onPress={onLoadChildren}>
        <ButtonText>{copy.tree.loadChildren}</ButtonText>
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
