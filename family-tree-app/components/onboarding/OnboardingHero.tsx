import { View } from "react-native";

import { BrandLogo } from "@/components/BrandLogo";
import { AppText } from "@/components/ui/AppText";

type OnboardingHeroProps = {
  title?: string;
  subtitle?: string;
};

export function OnboardingHero({
  title = "Your private family archive",
  subtitle = "Document relatives, stories, and photos — on this device or with family you trust.",
}: OnboardingHeroProps) {
  return (
    <View className="items-center gap-2 mb-4">
      <BrandLogo size={88} showTitle={false} />
      <AppText variant="titleLarge" className="text-primary font-semibold text-center">
        Kuriosity
      </AppText>
      <AppText variant="labelMedium" className="text-muted-foreground">
        Family Tree
      </AppText>
      <AppText variant="titleMedium" className="text-foreground font-semibold text-center mt-3 px-2">
        {title}
      </AppText>
      <AppText variant="bodyMedium" className="text-muted-foreground text-center px-1 leading-6">
        {subtitle}
      </AppText>
    </View>
  );
}
