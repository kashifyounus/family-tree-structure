import type { ReactNode } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/card";
import { motion } from "@/theme/motion";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
};

export function SectionCard({ title, subtitle, children, delay = 0 }: SectionCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(motion.normal)}>
      <Card className="p-4 gap-3 mb-4">
        {title ? <AppText variant="titleMedium">{title}</AppText> : null}
        {subtitle ? (
          <AppText variant="bodySmall" className="text-muted-foreground">{subtitle}</AppText>
        ) : null}
        <View className="gap-2">{children}</View>
      </Card>
    </Animated.View>
  );
}
