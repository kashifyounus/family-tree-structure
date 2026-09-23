import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";

import { space } from "@/theme/tokens";

type AppDialogFormProps = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitTestID?: string;
  cancelLabel: string;
  children: ReactNode;
  loading?: boolean;
};

export function AppDialogForm({
  visible,
  title,
  onDismiss,
  onSubmit,
  submitLabel,
  submitTestID,
  cancelLabel,
  children,
  loading,
}: AppDialogFormProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scroll}>
          <View style={styles.body}>{children}</View>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>{cancelLabel}</Button>
          <Button testID={submitTestID} mode="contained" onPress={onSubmit} loading={loading}>
            {submitLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 420, paddingHorizontal: 0 },
  body: { gap: space.md, paddingHorizontal: space.xxl, paddingVertical: space.sm },
});
