import { useState } from "react";
import { Pressable, View } from "react-native";

import {
  PersonFields,
  emptyPersonFieldsValue,
  type PersonFieldsValue,
} from "@/components/forms/PersonFields";
import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { createMember } from "@/lib/data/memberRepository";
import type { StorageMode } from "@/lib/data/types";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";

type RelationshipOption = "parent" | "child" | "spouse" | "sibling";

const RELATIONSHIP_OPTIONS: { value: RelationshipOption; label: string }[] = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
];

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
  const [person, setPerson] = useState<PersonFieldsValue>(() => emptyPersonFieldsValue());
  const [notes, setNotes] = useState("");
  const [relationship, setRelationship] = useState<RelationshipOption>("parent");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const patchPerson = (patch: Partial<PersonFieldsValue>) => {
    setPerson((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => {
    setPerson(emptyPersonFieldsValue());
    setNotes("");
    setRelationship("parent");
    setFieldErrors({});
  };

  const save = async () => {
    const errors: FieldErrors = {
      firstName: required(person.firstName, "First name"),
      lastName: required(person.lastName, "Last name"),
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
      const relationNote = `Relationship: ${relationship}`;
      const extra = [person.maidenName.trim() ? `Maiden: ${person.maidenName.trim()}` : "", person.suffix.trim() ? `Suffix: ${person.suffix.trim()}` : ""]
        .filter(Boolean)
        .join("; ");
      const bio = [relationNote, extra, notes.trim()].filter(Boolean).join("\n");
      const deathDate = person.isLiving ? undefined : person.deathDate.trim() || undefined;
      await createMember(mode, {
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        gender: person.gender,
        nickname: person.nickname.trim() || undefined,
        birthDate: person.birthDate.trim() || undefined,
        birthPlace: person.birthPlace.trim() || undefined,
        deathDate,
        bio: bio || undefined,
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
      <Pressable
        className="flex-row items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-4"
        accessibilityRole="button"
      >
        <View className="h-12 w-12 rounded-full bg-muted items-center justify-center">
          <AppText variant="titleMedium" className="text-muted-foreground">+</AppText>
        </View>
        <AppText variant="bodyMedium" className="text-muted-foreground">
          Add photo (optional)
        </AppText>
      </Pressable>

      <PersonFields
        value={person}
        onChange={patchPerson}
        fieldErrors={fieldErrors}
        firstNameTestID="add-member-first"
        lastNameTestID="add-member-last"
      />
      <View className="gap-2">
        <AppText variant="labelMedium" className="text-muted-foreground">
          Relationship
        </AppText>
        <SegmentedControl
          value={relationship}
          options={RELATIONSHIP_OPTIONS}
          onChange={setRelationship}
          testIdPrefix="add-member-relationship"
        />
      </View>
      <FormTextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      <PrimaryPillButton
        testID="add-member-save"
        label="Save member"
        onPress={() => void save()}
      />
    </FormBottomSheet>
  );
}
