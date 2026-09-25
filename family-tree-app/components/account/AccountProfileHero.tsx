import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Badge, BadgeText } from "@/components/ui/badge";
import { showcaseUser } from "@/lib/mock/kuriosityShowcase";

type AccountProfileHeroProps = {
  displayName?: string;
  email?: string;
};

export function AccountProfileHero({ displayName, email }: AccountProfileHeroProps) {
  const name = displayName ?? showcaseUser.displayName;
  const mail = email ?? showcaseUser.email;

  return (
    <View className="items-center py-6 mb-2">
      <View className="h-24 w-24 rounded-full bg-primary/15 items-center justify-center mb-3">
        <AppText variant="headlineSmall" className="text-primary font-semibold">
          {showcaseUser.initials}
        </AppText>
      </View>
      <AppText variant="titleLarge" className="font-semibold text-foreground">
        {name}
      </AppText>
      <AppText variant="bodyMedium" className="text-muted-foreground mt-1">
        {mail}
      </AppText>
      <Badge className="mt-3">
        <BadgeText>Archive owner</BadgeText>
      </Badge>
    </View>
  );
}
