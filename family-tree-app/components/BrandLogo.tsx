import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { APP_NAME } from "@/constants/appMeta";
import { useAppTheme } from "@/theme/useAppTheme";

type BrandLogoProps = {
  size?: number;
  showTitle?: boolean;
};

export function BrandLogo({ size = 72, showTitle = true }: BrandLogoProps) {
  const theme = useAppTheme();

  return (
    <View className="items-center gap-2">
      <Image
        source={require("@/assets/images/brand-logo.png")}
        style={{ width: size, height: size, borderRadius: size / 4 }}
        resizeMode="contain"
      />
      {showTitle ? (
        <AppText variant="titleMedium" style={{ color: theme.colors.primary }}>
          {APP_NAME}
        </AppText>
      ) : null}
    </View>
  );
}
