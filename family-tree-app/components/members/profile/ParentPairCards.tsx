import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import type { KinshipPerson } from "@/lib/kinship/types";
import { memberInitials } from "@/lib/members/memberPickerSubtitle";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";

type ParentPairCardsProps = {
  father?: KinshipPerson | null;
  mother?: KinshipPerson | null;
  onPressParent?: (personId: string, familyCode: string) => void;
};

function ParentCard({
  label,
  person,
  onPress,
}: {
  label: string;
  person?: KinshipPerson | null;
  onPress?: () => void;
}) {
  const name = person ? `${person.firstName} ${person.lastName}`.trim() : "Not recorded";
  return (
    <Pressable
      onPress={onPress}
      disabled={!person || !onPress}
      className="flex-1 rounded-xl border border-border bg-card"
      style={{ padding: kuriosityDesign.colors.cardPadding }}
    >
      <AppText variant="labelSmall" className="text-muted-foreground mb-2">
        {label}
      </AppText>
      <View className="flex-row items-center gap-2">
        <Avatar className="h-10 w-10 bg-primary/10">
          <AvatarFallbackText className="text-xs text-primary font-semibold">
            {person ? memberInitials(name) : "—"}
          </AvatarFallbackText>
        </Avatar>
        <AppText variant="bodyMedium" className="font-medium text-foreground flex-1" numberOfLines={2}>
          {name}
        </AppText>
      </View>
    </Pressable>
  );
}

export function ParentPairCards({ father, mother, onPressParent }: ParentPairCardsProps) {
  return (
    <View className="flex-row gap-3">
      <ParentCard
        label="Father"
        person={father}
        onPress={
          father && onPressParent
            ? () => onPressParent(father.id, father.familyCode)
            : undefined
        }
      />
      <ParentCard
        label="Mother"
        person={mother}
        onPress={
          mother && onPressParent
            ? () => onPressParent(mother.id, mother.familyCode)
            : undefined
        }
      />
    </View>
  );
}
