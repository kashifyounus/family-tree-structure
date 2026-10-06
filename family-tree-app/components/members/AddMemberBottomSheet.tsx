import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import {
  AddMemberFormFields,
  birthPlaceFromForm,
  emptyAddMemberFormValue,
  livingCityFromForm,
  type AddMemberFormValue,
} from "@/components/members/AddMemberFormFields";
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
  linkNewMemberToAnchors,
  type NewMemberRelationKind,
} from "@/lib/data/linkNewMemberToAnchor";
import { peopleForPicker } from "@/lib/data/personService";
import type { StorageMode } from "@/lib/data/types";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import {
  addMemberSelectionMode,
  filterAddMemberCandidates,
} from "@/lib/members/addMemberRelationCandidates";
import { addMemberPickerSubtitle } from "@/lib/members/addMemberPickerSubtitle";

const RELATIONSHIP_OPTIONS: { value: NewMemberRelationKind; label: string; hint: string }[] = [
  { value: "parent", label: "Parent", hint: "New member is a parent of one person" },
  { value: "child", label: "Child", hint: "New member is a child of selected parent(s)" },
  { value: "spouse", label: "Spouse", hint: "New member is spouse of one person" },
  { value: "sibling", label: "Sibling", hint: "Shares parents with selected sibling(s)" },
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
  const [person, setPerson] = useState<AddMemberFormValue>(() => emptyAddMemberFormValue());
  const [notes, setNotes] = useState("");
  const [relationship, setRelationship] = useState<NewMemberRelationKind>("child");
  const [anchorId, setAnchorId] = useState("");
  const [anchorIds, setAnchorIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const allMembers = useMemo(
    () => (visible && mode === "local" ? peopleForPicker(mode) : []),
    [visible, mode],
  );

  const members = useMemo(
    () => filterAddMemberCandidates(relationship, allMembers, person.gender),
    [allMembers, relationship, person.gender],
  );

  const selectionMode = addMemberSelectionMode(relationship);

  useEffect(() => {
    if (!visible) return;
    setAnchorId("");
    setAnchorIds([]);
  }, [visible, relationship]);

  const patchPerson = (patch: Partial<AddMemberFormValue>) => {
    setPerson((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => {
    setPerson(emptyAddMemberFormValue());
    setNotes("");
    setRelationship("child");
    setAnchorId("");
    setAnchorIds([]);
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
    const selected =
      selectionMode === "single"
        ? anchorId
          ? [anchorId]
          : []
        : anchorIds;
    if (mode === "local" && selected.length === 0) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const bio = notes.trim() || undefined;
      const created = await createMember(mode, {
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        gender: person.gender,
        birthDate: person.birthDate.trim() || undefined,
        birthPlace: birthPlaceFromForm(person),
        currentCity: livingCityFromForm(person),
        bio,
      });
      if (mode === "local" && selected.length > 0) {
        linkNewMemberToAnchors(mode, created.id, selected, relationship);
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

  const relateLabel =
    relationship === "parent"
      ? "Select child"
      : relationship === "child"
        ? "Select parent(s)"
        : relationship === "spouse"
          ? "Select spouse"
          : "Select sibling(s) with known parents";

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
      <View className="gap-2 mb-2">
        <AppText variant="labelMedium" className="text-muted-foreground">
          Relationship
        </AppText>
        <View className="flex-row flex-wrap gap-2">
          {RELATIONSHIP_OPTIONS.map((opt) => {
            const selected = relationship === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`add-member-relationship-${opt.value}`}
                onPress={() => setRelationship(opt.value)}
                className={`flex-1 min-w-[44%] rounded-2xl border px-3 py-3 ${
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
                  {opt.hint}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <AddMemberFormFields value={person} onChange={patchPerson} fieldErrors={fieldErrors} />

      {mode === "local" ? (
        <View className="gap-2">
          <AppText variant="labelMedium" className="text-muted-foreground">
            {relateLabel}
          </AppText>
          {members.length === 0 ? (
            <AppText variant="bodySmall" className="text-muted-foreground">
              {relationship === "sibling"
                ? "No members with recorded parents match. Add parents on an existing profile first."
                : copy.profile.noPickerMatches}
            </AppText>
          ) : (
            <ExistingMemberPicker
              members={members}
              excludeIds={[]}
              selectedId={anchorId}
              onSelect={setAnchorId}
              multiSelect={selectionMode === "multiple"}
              selectedIds={anchorIds}
              onToggleSelect={(id) =>
                setAnchorIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              subtitleForMember={(m) => addMemberPickerSubtitle(relationship, m)}
            />
          )}
        </View>
      ) : null}

      <FormTextInput
        label="Notes (optional)"
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
