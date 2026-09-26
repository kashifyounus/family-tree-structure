import { View } from "react-native";

import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { copy } from "@/content/businessCopy";

type ProfileMemberChromeProps = {
  canEditLocal: boolean;
  editing: boolean;
  onShowInTree: () => void;
  onToggleEdit: () => void;
  onAddSpouse: () => void;
  onAddChild: () => void;
  onManageParents: () => void;
  parentsRecorded: boolean;
  cloudReadOnlyMessage?: string | null;
};

/**
 * Profile header actions: one Tree CTA + Home-style secondary pills.
 */
export function ProfileMemberChrome({
  canEditLocal,
  editing,
  onShowInTree,
  onToggleEdit,
  onAddSpouse,
  onAddChild,
  onManageParents,
  parentsRecorded,
  cloudReadOnlyMessage,
}: ProfileMemberChromeProps) {
  return (
    <View className="mb-4 gap-3">
      <PrimaryPillButton
        testID="member-show-in-tree"
        label={copy.profile.openInTree}
        onPress={onShowInTree}
      />

      {canEditLocal ? (
        <View className="flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full min-h-11 flex-grow"
            onPress={onToggleEdit}
          >
            <ButtonText>
              {editing ? copy.profile.cancelEdit : copy.profile.editProfile}
            </ButtonText>
          </Button>
          <Button
            testID="member-add-spouse"
            variant="outline"
            className="rounded-full min-h-11 flex-grow"
            onPress={onAddSpouse}
          >
            <ButtonText>{copy.profile.addSpouse}</ButtonText>
          </Button>
          <Button
            testID="member-add-child"
            variant="outline"
            className="rounded-full min-h-11 flex-grow"
            onPress={onAddChild}
          >
            <ButtonText>{copy.profile.addChild}</ButtonText>
          </Button>
          <Button
            testID="member-add-parents"
            variant="outline"
            className="rounded-full min-h-11 flex-grow"
            onPress={onManageParents}
          >
            <ButtonText>
              {parentsRecorded ? copy.profile.changeParents : copy.profile.addParents}
            </ButtonText>
          </Button>
        </View>
      ) : null}

      {cloudReadOnlyMessage ? (
        <AppText variant="bodyMedium" className="text-muted-foreground">
          {cloudReadOnlyMessage}
        </AppText>
      ) : null}
    </View>
  );
}
