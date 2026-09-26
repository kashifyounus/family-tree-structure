import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { AddRelationSheet } from "@/components/members/AddRelationSheet";
import {
  addChild,
  addSpouse,
  linkChild,
  linkSpouse,
  peopleForPicker,
  unionOptions,
} from "@/lib/data/personService";
import { formatGraphPersonName } from "@/lib/format/displayName";
import type { GraphPersonSummary } from "@/lib/graph/types";
import type { Gender } from "@/lib/data/types";
import { defaultSpouseGender } from "@/lib/rules/relationshipRules";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import { space } from "@/theme/tokens";

type PersonTreeSheetProps = {
  visible: boolean;
  person: GraphPersonSummary | null;
  isLocal: boolean;
  onDismiss: () => void;
  onCenterTree: () => void;
  onFamilyChanged?: () => void;
};

export function PersonTreeSheet({
  visible,
  person,
  isLocal,
  onDismiss,
  onCenterTree,
  onFamilyChanged,
}: PersonTreeSheetProps) {
  const router = useRouter();
  const { mode, bumpDataRevision } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
  const { impactLight } = useAppPreferences();

  const [spouseOpen, setSpouseOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const [chUnionId, setChUnionId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!person) return null;

  const isPrivate = person.treeDisplayIsPrivate === true;
  const canAddLocal = isLocal && !isPrivate && mode === "local";

  const localPeople = canAddLocal ? peopleForPicker(mode) : [];
  const marriageOptions = canAddLocal ? unionOptions(mode, person.id) : [];

  const linkSpouseMember = (spouseId: string) => {
    if (!spouseId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      linkSpouse(mode, { personId: person.id, spouseId });
      setSpouseOpen(false);
      bumpDataRevision();
      onFamilyChanged?.();
      impactLight();
      showSuccess(copy.profile.spouseLinked);
    } catch (e) {
      showError(e);
    }
  };

  const createSpouseMember = (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
    marriageDate?: string;
  }) => {
    const errors: FieldErrors = {
      spFirst: required(payload.firstName, "First name"),
      spLast: required(payload.lastName, "Last name"),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as FieldErrors;
    if (Object.keys(filtered).length > 0) {
      setFieldErrors(filtered);
      showError(new Error(firstFieldError(filtered) ?? copy.errors.validation));
      return;
    }
    setFieldErrors({});
    try {
      addSpouse(mode, {
        relatedPersonId: person.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
        marriageDate: payload.marriageDate,
      });
      setSpouseOpen(false);
      bumpDataRevision();
      onFamilyChanged?.();
      impactLight();
      showSuccess(copy.profile.spouseSaved);
    } catch (e) {
      showError(e);
    }
  };

  const linkChildMember = (childId: string) => {
    const unionId = chUnionId || marriageOptions[0]?.id;
    if (!unionId) {
      showError(copy.profile.needMarriageFirst);
      return;
    }
    if (!childId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      linkChild(mode, { unionId, childId });
      setChildOpen(false);
      bumpDataRevision();
      onFamilyChanged?.();
      impactLight();
      showSuccess(copy.profile.childLinked);
    } catch (e) {
      showError(e);
    }
  };

  const createChildMember = (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
  }) => {
    const unionId = chUnionId || marriageOptions[0]?.id;
    if (!unionId) {
      showError(copy.profile.needMarriageFirst);
      return;
    }
    const errors: FieldErrors = {
      chFirst: required(payload.firstName, "First name"),
      chLast: required(payload.lastName, "Last name"),
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as FieldErrors;
    if (Object.keys(filtered).length > 0) {
      setFieldErrors(filtered);
      showError(new Error(firstFieldError(filtered) ?? copy.errors.validation));
      return;
    }
    setFieldErrors({});
    try {
      addChild(mode, {
        parentPersonId: person.id,
        unionId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
      });
      setChildOpen(false);
      bumpDataRevision();
      onFamilyChanged?.();
      impactLight();
      showSuccess(copy.profile.childSaved);
    } catch (e) {
      showError(e);
    }
  };

  return (
    <>
      <FormBottomSheet
        visible={visible}
        title={formatGraphPersonName(person)}
        onDismiss={onDismiss}
        hideActions
        cancelLabel={copy.reports.cancel}
      >
        <AppText variant="bodySmall" className="text-muted-foreground">
          {person.currentCity ?? copy.tree.sheetProfile}
        </AppText>
        <View style={styles.actions}>
          {!isPrivate && (
            <Button
              onPress={() => {
                onDismiss();
                router.push({
                  pathname: "/member/[personId]",
                  params: { personId: person.id, code: person.familyCode },
                });
              }}
            >
              <ButtonText>{copy.tree.sheetProfile}</ButtonText>
            </Button>
          )}
          {canAddLocal && (
            <Button
              testID="tree-sheet-add-spouse"
              variant="secondary"
              onPress={() => setSpouseOpen(true)}
            >
              <ButtonText>{copy.profile.addSpouse}</ButtonText>
            </Button>
          )}
          {canAddLocal && (
            <Button
              testID="tree-sheet-add-child"
              variant="secondary"
              onPress={() => {
                setChUnionId(marriageOptions[0]?.id ?? "");
                setChildOpen(true);
              }}
            >
              <ButtonText>{copy.profile.addChild}</ButtonText>
            </Button>
          )}
          {!isPrivate && (
            <Button variant="outline" onPress={onCenterTree}>
              <ButtonText>{copy.tree.sheetCenter}</ButtonText>
            </Button>
          )}
        </View>
      </FormBottomSheet>

      <AddRelationSheet
        visible={spouseOpen}
        kind="spouse"
        title={copy.profile.addSpouse}
        members={localPeople}
        excludeIds={[person.id]}
        defaultGender={defaultSpouseGender(person.gender) ?? "MALE"}
        onDismiss={() => setSpouseOpen(false)}
        onSubmitCreate={createSpouseMember}
        onSubmitLink={linkSpouseMember}
        submitTestID="member-spouse-save"
        fieldErrors={fieldErrors}
      />

      <AddRelationSheet
        visible={childOpen}
        kind="child"
        title={copy.profile.addChild}
        members={localPeople}
        excludeIds={[person.id]}
        marriageOptions={marriageOptions}
        selectedUnionId={chUnionId || marriageOptions[0]?.id}
        onUnionChange={setChUnionId}
        onDismiss={() => setChildOpen(false)}
        onSubmitCreate={createChildMember}
        onSubmitLink={linkChildMember}
        submitTestID="member-child-save"
        fieldErrors={fieldErrors}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space.sm, marginTop: space.sm },
});
