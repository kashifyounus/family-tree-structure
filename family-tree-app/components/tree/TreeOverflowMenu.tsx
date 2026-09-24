import { useRouter } from "expo-router";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { copy } from "@/content/businessCopy";

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
  const router = useRouter();

  return (
    <FormBottomSheet
      visible={visible}
      title={copy.tree.menuTitle}
      onDismiss={onDismiss}
      hideActions
      cancelLabel={copy.reports.cancel}
    >
      <AppText variant="bodySmall" className="text-muted-foreground">{familyCode}</AppText>
      <View className="gap-2 mt-2">
        <Button variant="outline" onPress={onCenterMarriage}>
          <ButtonText>{copy.tree.menuCenterMarriage}</ButtonText>
        </Button>
        <Button variant="outline" onPress={onReload}>
          <ButtonText>{copy.tree.menuReload}</ButtonText>
        </Button>
        {onToggleListLayout ? (
          <Button testID="tree-menu-list-toggle" variant="outline" onPress={onToggleListLayout}>
            <ButtonText>{listLayout ? copy.tree.menuShowGraph : copy.tree.menuShowList}</ButtonText>
          </Button>
        ) : null}
        <Button
          testID="tree-menu-kinship"
          variant="outline"
          onPress={() => {
            onDismiss();
            router.push({
              pathname: "/(tabs)/tools",
              params: focalFamilyCode ? { compareA: focalFamilyCode } : undefined,
            });
          }}
        >
          <ButtonText>{copy.tree.menuKinship}</ButtonText>
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            onDismiss();
            router.push("/(tabs)/reports");
          }}
        >
          <ButtonText>{copy.home.insights}</ButtonText>
        </Button>
        <Button
          testID="tree-menu-more-tools"
          variant="secondary"
          onPress={() => {
            onDismiss();
            router.push("/(tabs)/tools");
          }}
        >
          <ButtonText>{copy.tree.menuMoreTools}</ButtonText>
        </Button>
      </View>
    </FormBottomSheet>
  );
}
