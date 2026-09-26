import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import {
  ExistingMemberPicker,
  type BriefMember,
} from "@/components/members/ExistingMemberPicker";
import {
  MemberFormModeToggle,
  type MemberFormMode,
} from "@/components/members/MemberFormModeToggle";
import {
  PersonFields,
  emptyPersonFieldsValue,
  type PersonFieldsValue,
} from "@/components/forms/PersonFields";
import { AppText } from "@/components/ui/AppText";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { OutlineChip } from "@/components/ui/OutlineChip";
import { Button, ButtonText } from "@/components/ui/button";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { copy } from "@/content/businessCopy";
import type { ChildRelationshipType, Gender } from "@/lib/data/types";
import { type FieldErrors } from "@/lib/forms/fieldErrors";
import type { ParentSlot } from "@/lib/rules/parentSlots";
import { parentSlotGender } from "@/lib/rules/parentSlots";

export type AddRelationKind = "spouse" | "child" | "parent";

export type AddRelationCreatePayload = {
  firstName: string;
  lastName: string;
  gender: Gender;
  marriageDate?: string;
  birthDate?: string;
  nickname?: string;
  birthPlace?: string;
  deathDate?: string;
  parentSlot?: ParentSlot;
  relationshipType?: ChildRelationshipType;
};

type MarriageOption = { id: string; label: string };

export type AddRelationLinkOptions = {
  relationshipType?: ChildRelationshipType;
};

const CHILD_RELATIONSHIP_OPTIONS: {
  value: ChildRelationshipType;
  label: string;
  testID: string;
}[] = [
  {
    value: "BIOLOGICAL",
    label: copy.profile.childRelationshipBiological,
    testID: "child-rel-biological",
  },
  {
    value: "ADOPTED",
    label: copy.profile.childRelationshipAdopted,
    testID: "child-rel-adopted",
  },
  {
    value: "STEP",
    label: copy.profile.childRelationshipStep,
    testID: "child-rel-step",
  },
];

type AddRelationSheetProps = {
  visible: boolean;
  kind: AddRelationKind;
  title: string;
  members: BriefMember[];
  excludeIds: string[];
  marriageOptions?: MarriageOption[];
  selectedUnionId?: string;
  onUnionChange?: (unionId: string) => void;
  defaultGender?: Gender;
  parentSlot?: ParentSlot;
  onParentSlotChange?: (slot: ParentSlot) => void;
  parentStepHint?: string | null;
  onLinkParentCouple?: () => void;
  onDismiss: () => void;
  onSubmitCreate: (payload: AddRelationCreatePayload) => void;
  onSubmitLink: (memberId: string, options?: AddRelationLinkOptions) => void;
  submitTestID?: string;
  fieldErrors?: FieldErrors;
};

export function AddRelationSheet({
  visible,
  kind,
  title,
  members,
  excludeIds,
  marriageOptions = [],
  selectedUnionId,
  onUnionChange,
  defaultGender = "MALE",
  parentSlot = "father",
  onParentSlotChange,
  parentStepHint,
  onLinkParentCouple,
  onDismiss,
  onSubmitCreate,
  onSubmitLink,
  submitTestID,
  fieldErrors = {},
}: AddRelationSheetProps) {
  const router = useRouter();
  const parentLinkOnly = kind === "parent";
  const [mode, setMode] = useState<MemberFormMode>(parentLinkOnly ? "link" : "create");
  const [linkId, setLinkId] = useState("");
  const [person, setPerson] = useState<PersonFieldsValue>(() =>
    emptyPersonFieldsValue(defaultGender),
  );
  const [marriageDate, setMarriageDate] = useState("");
  const [childRelationshipType, setChildRelationshipType] =
    useState<ChildRelationshipType>("BIOLOGICAL");

  const patchPerson = (patch: Partial<PersonFieldsValue>) => {
    setPerson((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    if (!visible) return;
    setMode(parentLinkOnly ? "link" : "create");
    setLinkId("");
    setPerson(
      emptyPersonFieldsValue(
        kind === "parent" ? parentSlotGender(parentSlot) : defaultGender,
      ),
    );
    setMarriageDate("");
    setChildRelationshipType("BIOLOGICAL");
  }, [visible, defaultGender, kind, parentLinkOnly, parentSlot]);

  const handleSubmit = () => {
    if (mode === "link" || parentLinkOnly) {
      onSubmitLink(
        linkId,
        kind === "child" ? { relationshipType: childRelationshipType } : undefined,
      );
      return;
    }
    onSubmitCreate({
      firstName: person.firstName.trim(),
      lastName: person.lastName.trim(),
      gender: person.gender,
      nickname: person.nickname.trim() || undefined,
      birthPlace: person.birthPlace.trim() || undefined,
      birthDate: person.birthDate || undefined,
      deathDate: !person.isLiving ? person.deathDate || undefined : undefined,
      marriageDate: kind === "spouse" ? marriageDate || undefined : undefined,
      ...(kind === "child" ? { relationshipType: childRelationshipType } : {}),
    });
  };

  return (
    <FormBottomSheet
      visible={visible}
      title={title}
      onDismiss={onDismiss}
      onSubmit={handleSubmit}
      submitLabel={copy.profile.saveChanges}
      submitTestID={submitTestID}
      cancelLabel={copy.reports.cancel}
    >
      {!parentLinkOnly ? (
        <MemberFormModeToggle mode={mode} onChange={setMode} />
      ) : (
        <AppText variant="bodySmall" className="text-muted-foreground">
          {copy.profile.parentLinkOnlyHint}
        </AppText>
      )}
      {kind === "parent" ? (
        <View className="flex-row gap-2">
          <OutlineChip
            testID="parent-role-father"
            label={copy.profile.parentRoleFather}
            selected={parentSlot === "father"}
            onPress={() => onParentSlotChange?.("father")}
          />
          <OutlineChip
            testID="parent-role-mother"
            label={copy.profile.parentRoleMother}
            selected={parentSlot === "mother"}
            onPress={() => onParentSlotChange?.("mother")}
          />
        </View>
      ) : null}
      {parentStepHint ? (
        <AppText variant="bodySmall" className="text-muted-foreground">
          {parentStepHint}
        </AppText>
      ) : null}
      {kind === "child" && marriageOptions.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {marriageOptions.map((marriage) => (
            <Button
              key={marriage.id}
              variant={selectedUnionId === marriage.id ? "default" : "outline"}
              className="rounded-full min-h-9"
              onPress={() => onUnionChange?.(marriage.id)}
            >
              <ButtonText>{marriage.label}</ButtonText>
            </Button>
          ))}
        </View>
      ) : null}
      {kind === "child" ? (
        <View className="gap-2">
          <AppText variant="labelSmall" className="text-muted-foreground">
            {copy.profile.childRelationshipLabel}
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {CHILD_RELATIONSHIP_OPTIONS.map((option) => (
              <OutlineChip
                key={option.value}
                testID={option.testID}
                label={option.label}
                selected={childRelationshipType === option.value}
                onPress={() => setChildRelationshipType(option.value)}
              />
            ))}
          </View>
        </View>
      ) : null}
      {mode === "link" || parentLinkOnly ? (
        <>
          <ExistingMemberPicker
            members={members}
            excludeIds={excludeIds}
            selectedId={linkId}
            onSelect={setLinkId}
          />
          {parentLinkOnly ? (
            <Button
              variant="outline"
              className="rounded-full min-h-10"
              onPress={() => router.push("/add-member")}
            >
              <ButtonText>{copy.profile.parentCreateMemberCta}</ButtonText>
            </Button>
          ) : null}
        </>
      ) : kind === "spouse" ? (
        <>
          <PersonFields
            value={person}
            onChange={patchPerson}
            fieldErrors={fieldErrors}
            firstNameTestID="member-spouse-first"
            lastNameTestID="member-spouse-last"
          />
          <DatePickerField
            label="Wedding date"
            value={marriageDate}
            onChange={setMarriageDate}
            testID="member-spouse-wedding-date"
          />
        </>
      ) : (
        <PersonFields
          value={person}
          onChange={patchPerson}
          fieldErrors={fieldErrors}
          firstNameTestID="member-child-first"
          lastNameTestID="member-child-last"
        />
      )}
      {kind === "parent" && onLinkParentCouple ? (
        <Button variant="outline" className="rounded-full min-h-10 mt-1" onPress={onLinkParentCouple}>
          <ButtonText>{copy.profile.linkParentCouple}</ButtonText>
        </Button>
      ) : null}
    </FormBottomSheet>
  );
}
