import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppTheme } from "@/theme/useAppTheme";

type EmptyStateProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "folder-open-outline",
  title,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View className="items-center justify-center py-12 px-6 gap-3">
      <MaterialCommunityIcons name={icon} size={48} color={theme.colors.onSurfaceVariant} />
      <AppText variant="bodyMedium" className="text-center text-muted-foreground">
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Button variant="outline" onPress={onAction}>
          <ButtonText>{actionLabel}</ButtonText>
        </Button>
      ) : null}
    </View>
  );
}
