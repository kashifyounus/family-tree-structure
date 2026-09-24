import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";

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
 * Gluestack Actionsheet wrapper for keyboard-aware create/edit forms.
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
  const insets = useSafeAreaInsets();
  const maxHeightPercent = Math.round(maxHeightRatio * 100);

  return (
    <Actionsheet isOpen={visible} onClose={onDismiss}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        className="pb-2"
        style={{ maxHeight: `${maxHeightPercent}%`, paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <Text className="text-xl font-bold text-foreground w-full mb-3">{title}</Text>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%", flexShrink: 1 }}
          keyboardVerticalOffset={insets.bottom}
        >
          <ActionsheetScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          >
            {children}
          </ActionsheetScrollView>
        </KeyboardAvoidingView>

        {!hideActions && onSubmit ? (
          <View className="flex-row justify-end gap-2 w-full pt-2">
            <Button variant="ghost" onPress={onDismiss} disabled={loading}>
              <ButtonText>{cancelLabel}</ButtonText>
            </Button>
            <Button testID={submitTestID} onPress={onSubmit} disabled={loading}>
              {loading ? <ButtonSpinner /> : null}
              <ButtonText>{submitLabel}</ButtonText>
            </Button>
          </View>
        ) : hideActions ? (
          <View className="flex-row justify-end w-full pt-2">
            <Button variant="ghost" onPress={onDismiss}>
              <ButtonText>{cancelLabel}</ButtonText>
            </Button>
          </View>
        ) : null}
      </ActionsheetContent>
    </Actionsheet>
  );
}
