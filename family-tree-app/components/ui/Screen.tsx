import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { layout } from "@/theme/tokens";
import { motion } from "@/theme/motion";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboardAvoiding?: boolean;
  /** Entrance animation (disable on heavy lists / tab remounts). */
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
  /** Extra bottom padding (e.g. above tab bar + FAB). */
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  keyboardAvoiding = true,
  style,
  testID,
  bottomInset = 0,
  animated = true,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const contentStyle = [
    padded && styles.padded,
    {
      paddingBottom: Math.max(insets.bottom, 16) + bottomInset,
    },
    style,
  ];

  const innerContent = animated ? (
    <Animated.View entering={FadeInDown.duration(motion.screenEnter)} style={contentStyle}>
      {children}
    </Animated.View>
  ) : (
    <View style={contentStyle}>{children}</View>
  );

  const scrollView = (
    <ScrollView
      contentContainerStyle={styles.scrollGrow}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
      nestedScrollEnabled
    >
      {innerContent}
    </ScrollView>
  );

  const inner = scroll ? scrollView : innerContent;

  return (
    <View
      testID={testID}
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  padded: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingTop,
  },
});
