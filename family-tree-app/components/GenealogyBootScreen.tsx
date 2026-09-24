import { View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { BrandLogo } from "@/components/BrandLogo";
import { CreditFooter } from "@/components/CreditFooter";
import { AppText } from "@/components/ui/AppText";
import { Spinner } from "@/components/ui/spinner";
import { useAppTheme } from "@/theme/useAppTheme";

type GenealogyBootScreenProps = {
  message?: string;
};

export function GenealogyBootScreen({ message = "Loading…" }: GenealogyBootScreenProps) {
  const theme = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: theme.colors.background }}
    >
      <Animated.View entering={FadeInUp.duration(600)}>
        <BrandLogo size={96} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(500)} className="items-center mt-8 gap-3">
        <Spinner size="large" />
        <AppText variant="bodyLarge" className="text-center">{message}</AppText>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(400).duration(500)} className="absolute bottom-10">
        <CreditFooter inverted={theme.mode === "dark"} />
      </Animated.View>
    </View>
  );
}
