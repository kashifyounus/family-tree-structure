import { useState } from "react";
import { Pressable, View } from "react-native";

import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { createMember } from "@/lib/data/memberRepository";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import type { StorageMode } from "@/lib/data/types";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [notes, setNotes] = useState("");
  const [relationship, setRelationship] = useState<RelationshipOption>("parent");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setBirthYear("");
    setNotes("");
    setRelationship("parent");
    setFieldErrors({});
  };

  const save = async () => {
    const errors: FieldErrors = {
      firstName: required(firstName, "First name"),
      lastName: required(lastName, "Last name"),
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
      const year = birthYear.trim();
      const birthDate = /^\d{4}$/.test(year) ? `${year}-01-01` : year || undefined;
      const relationNote = `Relationship: ${relationship}`;
      const bio = [relationNote, notes.trim()].filter(Boolean).join("\n");
      await createMember(mode, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: "OTHER",
        birthDate,
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

      <FormTextInput
        testID="add-member-first"
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        errorText={fieldErrors.firstName}
        autoCapitalize="words"
      />
      <FormTextInput
        testID="add-member-last"
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        errorText={fieldErrors.lastName}
        autoCapitalize="words"
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
        label="Birth year"
        value={birthYear}
        onChangeText={setBirthYear}
        placeholder="e.g. 1962"
        keyboardType="number-pad"
        maxLength={10}
      />
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
