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

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboardAvoiding?: boolean;
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

  const body = (
    <Animated.View entering={FadeInDown.duration(320)} style={contentStyle}>
      {children}
    </Animated.View>
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
      {body}
    </ScrollView>
  );

  const inner = scroll ? scrollView : body;

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
  padded: { paddingHorizontal: 20, paddingTop: 12 },
});
