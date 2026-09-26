import { useEffect, useState } from "react";
import { View } from "react-native";

import { DatePickerField } from "@/components/forms/DatePickerField";
import {
  ExistingMemberPicker,
  type BriefMember,
} from "@/components/members/ExistingMemberPicker";
import {
  MemberFormModeToggle,
  type MemberFormMode,
} from "@/components/members/MemberFormModeToggle";
import { AppText } from "@/components/ui/AppText";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { OutlineChip } from "@/components/ui/OutlineChip";
import { Button, ButtonText } from "@/components/ui/button";
import { copy } from "@/content/businessCopy";
import type { ChildRelationshipType, Gender } from "@/lib/data/types";
import { type FieldErrors } from "@/lib/forms/fieldErrors";
import type { ParentSlot } from "@/lib/rules/parentSlots";
import { parentSlotGender } from "@/lib/rules/parentSlots";
import { useAppTheme } from "@/theme/useAppTheme";

export type AddRelationKind = "spouse" | "child" | "parent";

export type AddRelationCreatePayload = {
  firstName: string;
  lastName: string;
  gender: Gender;
  marriageDate?: string;
  birthDate?: string;
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
  const theme = useAppTheme();
  const [mode, setMode] = useState<MemberFormMode>("create");
  const [linkId, setLinkId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>(defaultGender);
  const [marriageDate, setMarriageDate] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [childRelationshipType, setChildRelationshipType] =
    useState<ChildRelationshipType>("BIOLOGICAL");

  const slotGender = kind === "parent" ? parentSlotGender(parentSlot) : gender;

  useEffect(() => {
    if (!visible) return;
    setMode("create");
    setLinkId("");
    setFirstName("");
    setLastName("");
    setGender(kind === "parent" ? parentSlotGender(parentSlot) : defaultGender);
    setMarriageDate("");
    setBirthDate("");
    setChildRelationshipType("BIOLOGICAL");
  }, [visible, defaultGender, kind, parentSlot]);

  const handleSubmit = () => {
    if (mode === "link") {
      onSubmitLink(
        linkId,
        kind === "child" ? { relationshipType: childRelationshipType } : undefined,
      );
      return;
    }
    onSubmitCreate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: kind === "parent" ? slotGender : gender,
      marriageDate: kind === "spouse" ? marriageDate || undefined : undefined,
      birthDate:
        kind === "parent" || kind === "child"
          ? birthDate || undefined
          : undefined,
      parentSlot: kind === "parent" ? parentSlot : undefined,
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
      <MemberFormModeToggle mode={mode} onChange={setMode} />
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
      {mode === "link" ? (
        <ExistingMemberPicker
          members={members}
          excludeIds={excludeIds}
          selectedId={linkId}
          onSelect={setLinkId}
        />
      ) : kind === "spouse" ? (
        <>
          <FormTextInput
            testID="member-spouse-first"
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            errorText={fieldErrors.spFirst}
          />
          <FormTextInput
            testID="member-spouse-last"
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            errorText={fieldErrors.spLast}
          />
          <GenderField value={gender} onChange={setGender} label="Gender" />
          {fieldErrors.spGender ? (
            <AppText variant="bodySmall" style={{ color: theme.colors.error }}>
              {fieldErrors.spGender}
            </AppText>
          ) : null}
          <DatePickerField
            label="Wedding date"
            value={marriageDate}
            onChange={setMarriageDate}
            testID="member-spouse-wedding-date"
          />
        </>
      ) : kind === "parent" ? (
        <>
          <FormTextInput
            testID="member-parent-first"
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            errorText={fieldErrors.paFirst}
          />
          <FormTextInput
            testID="member-parent-last"
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            errorText={fieldErrors.paLast}
          />
          <DatePickerField
            label="Date of birth"
            value={birthDate}
            onChange={setBirthDate}
            testID="member-parent-birth-date"
          />
        </>
      ) : (
        <>
          <FormTextInput
            testID="member-child-first"
            label="Given name"
            value={firstName}
            onChangeText={setFirstName}
            errorText={fieldErrors.chFirst}
          />
          <FormTextInput
            testID="member-child-last"
            label="Family name"
            value={lastName}
            onChangeText={setLastName}
            errorText={fieldErrors.chLast}
          />
          <GenderField value={gender} onChange={setGender} label="Gender" />
          <DatePickerField
            label="Date of birth"
            value={birthDate}
            onChange={setBirthDate}
            testID="member-child-birth-date"
          />
        </>
      )}
      {kind === "parent" && onLinkParentCouple ? (
        <Button variant="outline" className="rounded-full min-h-10 mt-1" onPress={onLinkParentCouple}>
          <ButtonText>{copy.profile.linkParentCouple}</ButtonText>
        </Button>
      ) : null}
    </FormBottomSheet>
  );
}
