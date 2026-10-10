import { useState } from "react";

import {
  AddMemberFormFields,
  birthPlaceFromForm,
  emptyAddMemberFormValue,
  livingCityFromForm,
  type AddMemberFormValue,
} from "@/components/members/AddMemberFormFields";
import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { createMember } from "@/lib/data/memberRepository";
import type { StorageMode } from "@/lib/data/types";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";

export type AddMemberBottomSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  onSaved?: () => void;
  mode?: StorageMode;
};

export function AddMemberBottomSheet({
  visible,
  onDismiss,
  onSaved,
  mode: modeProp,
}: AddMemberBottomSheetProps) {
  const storage = useStorage();
  const mode = modeProp ?? storage.mode;
  const { bumpDataRevision } = storage;
  const { showError, showSuccess } = useAppFeedback();
  const [person, setPerson] = useState<AddMemberFormValue>(() => emptyAddMemberFormValue());
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const patchPerson = (patch: Partial<AddMemberFormValue>) => {
    setPerson((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => {
    setPerson(emptyAddMemberFormValue());
    setNotes("");
    setFieldErrors({});
  };

  const save = async () => {
    const errors: FieldErrors = {
      firstName: required(person.firstName, "First name"),
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
    setSaving(true);
    try {
      const bio = notes.trim() || undefined;
      await createMember(mode, {
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        gender: person.gender,
        birthDate: person.birthDate.trim() || undefined,
        birthPlace: birthPlaceFromForm(person),
        currentCity: livingCityFromForm(person),
        bio,
      });
      bumpDataRevision();
      showSuccess(copy.members.saveMember);
      reset();
      onSaved?.();
      onDismiss();
    } catch (e) {
      showError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormBottomSheet
      visible={visible}
      title="Add member"
      figmaNavBar
      cancelLabel="Cancel"
      cancelTestID="add-member-cancel"
      navSaveLabel="Save"
      navSaveTestID="add-member-nav-save"
      onDismiss={() => {
        reset();
        onDismiss();
      }}
      onSubmit={() => void save()}
      hideActions
      loading={saving}
      sheetTestID="add-member-sheet"
    >
      <AppText variant="bodySmall" className="text-muted-foreground mb-1">
        {copy.members.standaloneAddHint}
      </AppText>

      <AddMemberFormFields value={person} onChange={patchPerson} fieldErrors={fieldErrors} />

      <FormTextInput
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      <PrimaryPillButton testID="add-member-save" label="Save member" onPress={() => void save()} />
    </FormBottomSheet>
  );
}
