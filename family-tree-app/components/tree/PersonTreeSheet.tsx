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
import { CoupleParentPickerSheet } from "@/components/parents/CoupleParentPickerSheet";
import {
  addChild,
  addSpouse,
  assignParentSlot,
  assignParentsToCouple,
  createAndAssignParentSlot,
  linkChild,
  linkSpouse,
  parentCouplesForPicker,
  peopleForPicker,
  unionOptions,
} from "@/lib/data/personService";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { getParentsForPerson } from "@/lib/kinship/kinshipCore";
import { formatGraphPersonName } from "@/lib/format/displayName";
import type { GraphPersonSummary } from "@/lib/graph/types";
import type { Gender } from "@/lib/data/types";
import { defaultParentSlotForOpen, type ParentSlot } from "@/lib/rules/parentSlots";
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

function parentsOnTree(personId: string) {
  const { peopleById, unionsAsChildFor } = loadKinshipDataset();
  return getParentsForPerson(personId, unionsAsChildFor(personId), peopleById);
}

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
  const [parentsOpen, setParentsOpen] = useState(false);
  const [coupleParentsOpen, setCoupleParentsOpen] = useState(false);
  const [parentSlot, setParentSlot] = useState<ParentSlot>("father");
  const [parentStaged, setParentStaged] = useState<{
    parentId: string;
    slot: ParentSlot;
  } | null>(null);
  const [parentQuery, setParentQuery] = useState("");
  const [chUnionId, setChUnionId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!person) return null;

  const isPrivate = person.treeDisplayIsPrivate === true;
  const canAddLocal = isLocal && !isPrivate && mode === "local";

  const localPeople = canAddLocal ? peopleForPicker(mode) : [];
  const marriageOptions = canAddLocal ? unionOptions(mode, person.id) : [];
  const existingParents = canAddLocal ? parentsOnTree(person.id) : [];
  const parentCoupleRows =
    canAddLocal && coupleParentsOpen
      ? parentCouplesForPicker(mode, person.id, parentQuery)
      : [];

  const parentStepHint = parentStaged
    ? copy.profile.parentStepHint(
        parentStaged.slot === "father"
          ? copy.profile.parentRoleMother.toLowerCase()
          : copy.profile.parentRoleFather.toLowerCase(),
      )
    : null;

  const parentExcludeIds = [
    person.id,
    ...(parentStaged ? [parentStaged.parentId] : []),
  ];

  const applyParentAssignResult = (
    result: ReturnType<typeof assignParentSlot>,
  ) => {
    if (result.status === "needs_other_parent") {
      setParentStaged({ parentId: result.stagedParentId, slot: result.stagedSlot });
      setParentSlot(result.otherSlot);
      showSuccess(
        result.otherSlot === "mother"
          ? copy.profile.parentSlotStagedFather
          : copy.profile.parentSlotStagedMother,
      );
      return;
    }
    setParentStaged(null);
    setParentsOpen(false);
    bumpDataRevision();
    onFamilyChanged?.();
    impactLight();
    showSuccess(copy.profile.parentsSaved);
  };

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

  const linkChildMember = (
    childId: string,
    options?: { relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP" },
  ) => {
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
      linkChild(mode, {
        unionId,
        childId,
        relationshipType: options?.relationshipType,
      });
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

  const linkParentMember = (parentPersonId: string) => {
    if (!parentPersonId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      const result = assignParentSlot(mode, {
        childId: person.id,
        slot: parentSlot,
        parentPersonId,
        staged: parentStaged,
      });
      applyParentAssignResult(result);
    } catch (e) {
      showError(e);
    }
  };

  const createParentMember = (payload: {
    firstName: string;
    lastName: string;
    birthDate?: string;
    parentSlot?: ParentSlot;
  }) => {
    const slot = payload.parentSlot ?? parentSlot;
    const errors: FieldErrors = {
      paFirst: required(payload.firstName, "First name"),
      paLast: required(payload.lastName, "Last name"),
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
      const result = createAndAssignParentSlot(mode, {
        childId: person.id,
        slot,
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthDate: payload.birthDate,
        staged: parentStaged,
      });
      applyParentAssignResult(result);
    } catch (e) {
      showError(e);
    }
  };

  const onSelectParentCouple = (unionId: string) => {
    try {
      assignParentsToCouple(mode, person.id, unionId);
      setCoupleParentsOpen(false);
      setParentStaged(null);
      setParentQuery("");
      bumpDataRevision();
      onFamilyChanged?.();
      impactLight();
      showSuccess(copy.profile.parentsSaved);
    } catch (e) {
      showError(e);
    }
  };

  const openParentSheet = () => {
    setParentSlot(defaultParentSlotForOpen(existingParents, parentStaged));
    setParentsOpen(true);
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
          {canAddLocal && (
            <Button
              testID="tree-sheet-add-parents"
              variant="secondary"
              onPress={openParentSheet}
            >
              <ButtonText>
                {existingParents.length > 0
                  ? copy.profile.changeParents
                  : copy.profile.addParents}
              </ButtonText>
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

      <AddRelationSheet
        visible={parentsOpen}
        kind="parent"
        title={
          existingParents.length > 0 ? copy.profile.changeParents : copy.profile.addParents
        }
        members={localPeople}
        excludeIds={parentExcludeIds}
        parentSlot={parentSlot}
        onParentSlotChange={setParentSlot}
        parentStepHint={parentStepHint}
        onLinkParentCouple={() => {
          setParentsOpen(false);
          setCoupleParentsOpen(true);
        }}
        onDismiss={() => setParentsOpen(false)}
        onSubmitCreate={createParentMember}
        onSubmitLink={linkParentMember}
        submitTestID="member-parent-save"
        fieldErrors={fieldErrors}
      />

      <CoupleParentPickerSheet
        visible={coupleParentsOpen}
        title={
          existingParents.length > 0 ? copy.profile.changeParents : copy.profile.addParents
        }
        rows={parentCoupleRows}
        replacingExisting={existingParents.length > 0}
        onDismiss={() => {
          setCoupleParentsOpen(false);
          setParentQuery("");
        }}
        onSelectCouple={(row) => onSelectParentCouple(row.unionId)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space.sm, marginTop: space.sm },
});
