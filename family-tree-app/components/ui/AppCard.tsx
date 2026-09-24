import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

import { Card } from "@/components/ui/card";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
};

export function AppCard({ children, className, style }: AppCardProps) {
  return (
    <Card className={`border border-border mb-4 ${className ?? ""}`} style={style}>
      {children}
    </Card>
  );
}

export function AppCardContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View className="p-4 gap-3" style={style}>{children}</View>;
}

/** @deprecated use AppCard + children — shim for migrated screens */
export const PaperCardShim = {
  Content: AppCardContent,
};
