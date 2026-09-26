import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useAppTheme } from "@/theme/useAppTheme";
import { layout } from "@/theme/tokens";
import { motion } from "@/theme/motion";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Inset content below the status bar (tab roots and full-screen flows). Off for stack screens with a native header. */
  safeTop?: boolean;
  keyboardAvoiding?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
  bottomInset?: number;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  safeTop = false,
  keyboardAvoiding = true,
  style,
  testID,
  bottomInset = 0,
  animated = true,
}: ScreenProps) {
  const theme = useAppTheme();
  const prefs = useAppPreferences();
  const textScale = prefs.textScale === "large" ? 1.12 : 1;
  const insets = useSafeAreaInsets();
  const contentStyle = [
    padded && styles.padded,
    !scroll && styles.fill,
    safeTop && {
      paddingTop: insets.top + layout.screenPaddingTop,
    },
    {
      paddingBottom: Math.max(insets.bottom, 16) + bottomInset,
      transform: textScale === 1 ? undefined : [{ scale: textScale }],
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
  fill: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  padded: {
    paddingHorizontal: layout.screenPaddingX,
  },
});
