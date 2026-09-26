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
import { Button, ButtonText } from "@/components/ui/button";
import { copy } from "@/content/businessCopy";
import type { Gender } from "@/lib/data/types";
import { type FieldErrors } from "@/lib/forms/fieldErrors";
import { useAppTheme } from "@/theme/useAppTheme";

export type AddRelationKind = "spouse" | "child";

export type AddRelationCreatePayload = {
  firstName: string;
  lastName: string;
  gender: Gender;
  marriageDate?: string;
};

type MarriageOption = { id: string; label: string };

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
  onDismiss: () => void;
  onSubmitCreate: (payload: AddRelationCreatePayload) => void;
  onSubmitLink: (memberId: string) => void;
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

  useEffect(() => {
    if (!visible) return;
    setMode("create");
    setLinkId("");
    setFirstName("");
    setLastName("");
    setGender(defaultGender);
    setMarriageDate("");
  }, [visible, defaultGender]);

  const handleSubmit = () => {
    if (mode === "link") {
      onSubmitLink(linkId);
      return;
    }
    onSubmitCreate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      marriageDate: kind === "spouse" ? marriageDate || undefined : undefined,
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
        </>
      )}
    </FormBottomSheet>
  );
}
