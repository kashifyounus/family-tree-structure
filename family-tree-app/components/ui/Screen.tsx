import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const contentStyle = [
    padded && styles.padded,
    { paddingBottom: Math.max(insets.bottom, 16) },
    style,
  ];

  const body = (
    <Animated.View entering={FadeInDown.duration(320)} style={contentStyle}>
      {children}
    </Animated.View>
  );

  return (
    <View
      testID={testID}
      style={[styles.root, { backgroundColor: theme.colors.background }]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollGrow}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollGrow: { flexGrow: 1 },
  padded: { paddingHorizontal: 20, paddingTop: 12 },
});
