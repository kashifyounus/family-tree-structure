import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { space } from "@/theme/tokens";

export type FormBottomSheetProps = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitTestID?: string;
  cancelLabel?: string;
  children: ReactNode;
  loading?: boolean;
  /** Hide footer when selection-only sheets handle their own actions */
  hideActions?: boolean;
  maxHeightRatio?: number;
};

/**
 * Reusable keyboard-aware bottom sheet for all create/edit forms.
 */
export function FormBottomSheet({
  visible,
  title,
  onDismiss,
  onSubmit,
  submitLabel = "Save",
  submitTestID,
  cancelLabel = "Cancel",
  children,
  loading,
  hideActions,
  maxHeightRatio = 0.92,
}: FormBottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityLabel="Close" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
        keyboardVerticalOffset={insets.bottom}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom, space.md),
              maxHeight: `${maxHeightRatio * 100}%`,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {!hideActions && onSubmit ? (
            <View style={styles.actions}>
              <Button onPress={onDismiss} disabled={loading}>{cancelLabel}</Button>
              <Button
                testID={submitTestID}
                mode="contained"
                onPress={onSubmit}
                loading={loading}
              >
                {submitLabel}
              </Button>
            </View>
          ) : (
            <View style={styles.actions}>
              <Button onPress={onDismiss}>{cancelLabel}</Button>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  keyboard: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginBottom: space.sm,
  },
  title: {
    fontWeight: "700",
    marginBottom: space.md,
  },
  scrollContent: {
    gap: space.md,
    paddingBottom: space.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: space.sm,
    paddingTop: space.sm,
  },
});
