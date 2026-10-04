import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import type { LiveChecklistStepId } from "@/lib/archive/liveArchiveProgress";
import { useAppTheme } from "@/theme/useAppTheme";

type StepView = {
  id: LiveChecklistStepId;
  done: boolean;
};

type LiveArchiveChecklistCardProps = {
  steps: StepView[];
  focalPersonId: string;
  focalFamilyCode: string;
};

export function LiveArchiveChecklistCard({
  steps,
  focalPersonId,
  focalFamilyCode,
}: LiveArchiveChecklistCardProps) {
  const theme = useAppTheme();
  const router = useRouter();

  const onStep = (id: LiveChecklistStepId) => {
    switch (id) {
      case "tree":
        router.push({
          pathname: "/(tabs)/tree",
          params: { familyCode: focalFamilyCode },
        });
        break;
      case "spouse":
      case "parents":
      case "children":
        router.push({
          pathname: "/member/[personId]",
          params: { personId: focalPersonId, code: focalFamilyCode },
        });
        break;
      default: {
        const _exhaustive: never = id;
        return _exhaustive;
      }
    }
  };

  return (
    <View testID="live-archive-checklist" className="mb-5">
    <AppCard className="rounded-2xl border-border">
      <AppCardContent style={{ gap: 12 }}>
        <AppText variant="titleMedium" className="font-semibold">
          {copy.home.checklistTitle}
        </AppText>
        <AppText variant="bodySmall" className="text-muted-foreground leading-5">
          {copy.home.checklistBody}
        </AppText>
        {steps.map((step) => {
          const labels = copy.home.checklistSteps[step.id];
          return (
            <Pressable
              key={step.id}
              onPress={() => onStep(step.id)}
              accessibilityRole="button"
              className="flex-row items-center gap-3 py-2"
              testID={`live-checklist-${step.id}`}
            >
              <MaterialCommunityIcons
                name={step.done ? "check-circle" : "circle-outline"}
                size={22}
                color={step.done ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <View className="flex-1">
                <AppText
                  variant="bodyMedium"
                  className={step.done ? "text-muted-foreground line-through" : "text-foreground"}
                >
                  {labels.title}
                </AppText>
                <AppText variant="labelSmall" className="text-muted-foreground mt-0.5">
                  {labels.hint}
                </AppText>
              </View>
              {!step.done ? (
                <AppText variant="labelMedium" className="text-primary">
                  {labels.action}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </AppCardContent>
    </AppCard>
    </View>
  );
}
