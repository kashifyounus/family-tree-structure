import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import {
  PersonFields,
  emptyPersonFieldsValue,
  type PersonFieldsValue,
} from "@/components/forms/PersonFields";
import { ExistingMemberPicker } from "@/components/members/ExistingMemberPicker";
import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { AppText } from "@/components/ui/AppText";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { createMember } from "@/lib/data/memberRepository";
import {
  linkNewMemberToAnchor,
  type NewMemberRelationKind,
} from "@/lib/data/linkNewMemberToAnchor";
import { peopleForPicker } from "@/lib/data/personService";
import type { StorageMode } from "@/lib/data/types";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";

const RELATIONSHIP_OPTIONS: { value: NewMemberRelationKind; label: string }[] = [
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
  const [relationship, setRelationship] = useState<NewMemberRelationKind>("child");
  const [anchorId, setAnchorId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const members = useMemo(
    () => (visible && mode === "local" ? peopleForPicker(mode) : []),
    [visible, mode],
  );

  useEffect(() => {
    if (!visible) return;
    setAnchorId("");
  }, [visible, relationship]);

  const patchPerson = (patch: Partial<PersonFieldsValue>) => {
    setPerson((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => {
    setPerson(emptyPersonFieldsValue());
    setNotes("");
    setRelationship("child");
    setAnchorId("");
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
    if (mode === "local" && !anchorId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const extra = [
        person.maidenName.trim() ? `Maiden: ${person.maidenName.trim()}` : "",
        person.suffix.trim() ? `Suffix: ${person.suffix.trim()}` : "",
      ]
        .filter(Boolean)
        .join("; ");
      const bio = [extra, notes.trim()].filter(Boolean).join("\n");
      const deathDate = person.isLiving ? undefined : person.deathDate.trim() || undefined;
      const created = await createMember(mode, {
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        gender: person.gender,
        nickname: person.nickname.trim() || undefined,
        birthDate: person.birthDate.trim() || undefined,
        birthPlace: person.birthPlace.trim() || undefined,
        deathDate,
        bio: bio || undefined,
      });
      if (mode === "local" && anchorId) {
        linkNewMemberToAnchor(mode, created.id, anchorId, relationship);
      }
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
        <AppText variant="bodySmall" className="text-muted-foreground">
          {copy.profile.relationshipCardsHint}
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {RELATIONSHIP_OPTIONS.map((opt) => {
            const selected = relationship === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`add-member-relationship-${opt.value}`}
                onPress={() => setRelationship(opt.value)}
                className={`flex-1 min-w-[44%] rounded-2xl border px-3 py-4 ${
                  selected ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <AppText
                  variant="titleSmall"
                  className={selected ? "text-primary font-semibold" : "text-foreground"}
                >
                  {opt.label}
                </AppText>
                <AppText variant="labelSmall" className="text-muted-foreground mt-1">
                  {opt.value === "parent"
                    ? "New person is a parent of…"
                    : opt.value === "child"
                      ? "New person is a child of…"
                      : opt.value === "spouse"
                        ? "New person is spouse of…"
                        : "Shares parents with…"}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-2">
        <AppText variant="labelMedium" className="text-muted-foreground">
          {copy.profile.relateToMember}
        </AppText>
        <ExistingMemberPicker
          members={members}
          excludeIds={[]}
          selectedId={anchorId}
          onSelect={setAnchorId}
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
