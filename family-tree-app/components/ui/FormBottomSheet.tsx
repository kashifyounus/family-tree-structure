import type { ReactNode } from "react";
import { Dimensions, Platform, Text, View } from "react-native";
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
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";

export type FormBottomSheetProps = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitTestID?: string;
  cancelLabel?: string;
  cancelTestID?: string;
  children: ReactNode;
  loading?: boolean;
  /** Hide footer when selection-only sheets handle their own actions */
  hideActions?: boolean;
  maxHeightRatio?: number;
  /** Cancel | centered title | Save row (Figma add-member header) */
  figmaNavBar?: boolean;
  navSaveLabel?: string;
  navSaveTestID?: string;
  sheetTestID?: string;
};

const windowHeight = Dimensions.get("window").height;

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
  figmaNavBar,
  navSaveLabel = "Save",
  navSaveTestID,
  cancelTestID,
  sheetTestID,
}: FormBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const maxSheetHeight = Math.round(windowHeight * maxHeightRatio);
  const footerPad = Math.max(insets.bottom, 12);
  const scrollBottomPad = keyboardHeight > 0 ? keyboardHeight - footerPad + 16 : 16;

  return (
    <Actionsheet isOpen={visible} onClose={onDismiss} isKeyboardDismissable>
      <ActionsheetBackdrop />
      <ActionsheetContent
        testID={sheetTestID}
        className="px-0 pt-2 pb-0 gap-0"
        style={{
          maxHeight: maxSheetHeight,
          width: "100%",
        }}
      >
        {figmaNavBar ? (
          <View className="w-full flex-row items-center justify-between px-4 pb-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onPress={onDismiss}
              disabled={loading}
              testID={cancelTestID}
            >
              <ButtonText>{cancelLabel}</ButtonText>
            </Button>
            <Text className="text-base font-semibold text-foreground">{title}</Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={onSubmit}
              disabled={loading || !onSubmit}
              testID={navSaveTestID}
            >
              {loading ? <ButtonSpinner /> : null}
              <ButtonText>{navSaveLabel}</ButtonText>
            </Button>
          </View>
        ) : null}
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        {!figmaNavBar ? (
          <View className="w-full px-5 pb-1">
            <Text className="text-lg font-semibold text-foreground tracking-tight">{title}</Text>
          </View>
        ) : null}

        <ActionsheetScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentContainerStyle={{
            gap: 14,
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: scrollBottomPad,
          }}
          style={{ width: "100%", flexGrow: 0, flexShrink: 1 }}
        >
          {children}
        </ActionsheetScrollView>

        {!hideActions && onSubmit ? (
          <View
            className="w-full flex-row justify-end gap-2 border-t border-border bg-background px-5 pt-3"
            style={{ paddingBottom: footerPad + (keyboardHeight > 0 ? 4 : 0) }}
          >
            <Button variant="ghost" onPress={onDismiss} disabled={loading}>
              <ButtonText>{cancelLabel}</ButtonText>
            </Button>
            <Button testID={submitTestID} onPress={onSubmit} disabled={loading}>
              {loading ? <ButtonSpinner /> : null}
              <ButtonText>{submitLabel}</ButtonText>
            </Button>
          </View>
        ) : hideActions ? (
          <View
            className="w-full flex-row justify-end border-t border-border bg-background px-5 pt-3"
            style={{ paddingBottom: footerPad }}
          >
            <Button variant="ghost" onPress={onDismiss}>
              <ButtonText>{cancelLabel}</ButtonText>
            </Button>
          </View>
        ) : null}
      </ActionsheetContent>
    </Actionsheet>
  );
}
