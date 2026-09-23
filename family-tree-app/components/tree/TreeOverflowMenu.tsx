import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Divider, Modal, Portal, Text, useTheme } from "react-native-paper";

import { copy } from "@/content/businessCopy";
import { space } from "@/theme/tokens";

type TreeOverflowMenuProps = {
  visible: boolean;
  familyCode: string;
  focalFamilyCode?: string;
  onDismiss: () => void;
  onCenterMarriage: () => void;
  onReload: () => void;
  listLayout?: boolean;
  onToggleListLayout?: () => void;
};

export function TreeOverflowMenu({
  visible,
  familyCode,
  focalFamilyCode,
  onDismiss,
  onCenterMarriage,
  onReload,
  listLayout,
  onToggleListLayout,
}: TreeOverflowMenuProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.sheet,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text variant="titleMedium">{copy.tree.menuTitle}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          {familyCode}
        </Text>
        <Divider style={styles.divider} />
        <View style={styles.actions}>
          <Button icon="heart" mode="outlined" onPress={onCenterMarriage}>
            {copy.tree.menuCenterMarriage}
          </Button>
          <Button icon="refresh" mode="outlined" onPress={onReload}>
            {copy.tree.menuReload}
          </Button>
          {onToggleListLayout ? (
            <Button
              testID="tree-menu-list-toggle"
              icon={listLayout ? "graph" : "format-list-bulleted"}
              mode="outlined"
              onPress={onToggleListLayout}
            >
              {listLayout ? copy.tree.menuShowGraph : copy.tree.menuShowList}
            </Button>
          ) : null}
          <Button
            testID="tree-menu-kinship"
            icon="account-switch"
            mode="outlined"
            onPress={() => {
              onDismiss();
              router.push({
                pathname: "/(tabs)/tools",
                params: focalFamilyCode
                  ? { compareA: focalFamilyCode }
                  : undefined,
              });
            }}
          >
            {copy.tree.menuKinship}
          </Button>
          <Button
            icon="chart-bar"
            mode="outlined"
            onPress={() => {
              onDismiss();
              router.push("/(tabs)/reports");
            }}
          >
            {copy.home.insights}
          </Button>
          <Button
            testID="tree-menu-more-tools"
            icon="toolbox"
            mode="contained-tonal"
            onPress={() => {
              onDismiss();
              router.push("/(tabs)/tools");
            }}
          >
            {copy.tree.menuMoreTools}
          </Button>
          <Button onPress={onDismiss}>{copy.reports.cancel}</Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: space.lg,
    marginBottom: space.xl,
    padding: space.lg,
    borderRadius: 16,
  },
  divider: { marginVertical: space.md },
  actions: { gap: space.sm },
});
