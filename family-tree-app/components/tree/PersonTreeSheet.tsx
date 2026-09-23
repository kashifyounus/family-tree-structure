import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";

import { formatGraphPersonName } from "@/lib/format/displayName";
import type { GraphPersonSummary } from "@/lib/graph/types";
import { copy } from "@/content/businessCopy";
import { space } from "@/theme/tokens";

type PersonTreeSheetProps = {
  visible: boolean;
  person: GraphPersonSummary | null;
  onDismiss: () => void;
  onCenterTree: () => void;
};

export function PersonTreeSheet({
  visible,
  person,
  onDismiss,
  onCenterTree,
}: PersonTreeSheetProps) {
  const theme = useTheme();
  const router = useRouter();

  if (!person) return null;

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
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {formatGraphPersonName(person)}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 4 }}>
          {person.familyCode}
        </Text>
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="account"
            onPress={() => {
              onDismiss();
              router.push({
                pathname: "/member/[personId]",
                params: { personId: person.id, code: person.familyCode },
              });
            }}
          >
            {copy.tree.sheetProfile}
          </Button>
          <Button mode="outlined" icon="target" onPress={onCenterTree}>
            {copy.tree.sheetCenter}
          </Button>
          <Button mode="text" onPress={onDismiss}>
            {copy.reports.cancel}
          </Button>
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
  actions: { marginTop: space.lg, gap: space.sm },
});
