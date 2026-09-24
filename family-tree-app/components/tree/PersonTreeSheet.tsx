import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { GenderField } from "@/components/ui/GenderField";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { ExistingMemberPicker } from "@/components/members/ExistingMemberPicker";
import {
  MemberFormModeToggle,
  type MemberFormMode,
} from "@/components/members/MemberFormModeToggle";
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
  const [spFirst, setSpFirst] = useState("");
  const [spLast, setSpLast] = useState("");
  const [spGender, setSpGender] = useState<Gender | "">("");
  const [chFirst, setChFirst] = useState("");
  const [chLast, setChLast] = useState("");
  const [chGender, setChGender] = useState<Gender>("MALE");
  const [chUnionId, setChUnionId] = useState("");
  const [spouseFormMode, setSpouseFormMode] = useState<MemberFormMode>("create");
  const [linkSpouseId, setLinkSpouseId] = useState("");
  const [childFormMode, setChildFormMode] = useState<MemberFormMode>("create");
  const [linkChildId, setLinkChildId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!person) return null;

  const isPrivate = person.treeDisplayIsPrivate === true;
  const canAddLocal = isLocal && !isPrivate && mode === "local";

  const localPeople = canAddLocal ? peopleForPicker(mode) : [];

  const submitSpouse = () => {
    if (spouseFormMode === "link") {
      if (!linkSpouseId) {
        showError(new Error(copy.profile.pickMemberRequired));
        return;
      }
      try {
        linkSpouse(mode, { personId: person.id, spouseId: linkSpouseId });
        setSpouseOpen(false);
        setLinkSpouseId("");
        setSpouseFormMode("create");
        bumpDataRevision();
        onFamilyChanged?.();
        impactLight();
        showSuccess(copy.profile.spouseLinked);
      } catch (e) {
        showError(e);
      }
      return;
    }

    const errors: FieldErrors = {
      spFirst: required(spFirst, "First name"),
      spLast: required(spLast, "Last name"),
      spGender: spGender ? undefined : "Select a gender for the spouse.",
    };
    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as FieldErrors;
    if (Object.keys(filtered).length > 0) {
      setFieldErrors(filtered);
      showError(new Error(firstFieldError(filtered) ?? copy.errors.validation));
      return;
    }
    if (!spGender) return;
    setFieldErrors({});
    try {
      addSpouse(mode, {
        relatedPersonId: person.id,
        firstName: spFirst.trim(),
        lastName: spLast.trim(),
        gender: spGender,
      });
      setSpouseOpen(false);
      setSpFirst("");
      setSpLast("");
      bumpDataRevision();
      onFamilyChanged?.();
      impactLight();
      showSuccess(copy.profile.spouseSaved);
    } catch (e) {
      showError(e);
    }
  };

  const submitChild = () => {
    const marriages = unionOptions(mode, person.id);
    const unionId = chUnionId || marriages[0]?.id;
    if (!unionId) {
      showError(copy.profile.needMarriageFirst);
      return;
    }

    if (childFormMode === "link") {
      if (!linkChildId) {
        showError(new Error(copy.profile.pickMemberRequired));
        return;
      }
      try {
        linkChild(mode, { unionId, childId: linkChildId });
        setChildOpen(false);
        setLinkChildId("");
        setChildFormMode("create");
        bumpDataRevision();
        onFamilyChanged?.();
        impactLight();
        showSuccess(copy.profile.childLinked);
      } catch (e) {
        showError(e);
      }
      return;
    }

    const errors: FieldErrors = {
      chFirst: required(chFirst, "First name"),
      chLast: required(chLast, "Last name"),
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
        firstName: chFirst.trim(),
        lastName: chLast.trim(),
        gender: chGender,
      });
      setChildOpen(false);
      setChFirst("");
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
        <AppText variant="bodySmall" className="text-primary">
          {person.familyCode}
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
              onPress={() => {
                setSpouseFormMode("create");
                setLinkSpouseId("");
                setSpGender(defaultSpouseGender(person.gender) ?? "");
                setSpLast(person.lastName);
                setSpouseOpen(true);
              }}
            >
              <ButtonText>{copy.profile.addSpouse}</ButtonText>
            </Button>
          )}
          {canAddLocal && (
            <Button
              testID="tree-sheet-add-child"
              variant="secondary"
              onPress={() => {
                const marriages = unionOptions(mode, person.id);
                setChildFormMode("create");
                setLinkChildId("");
                setChUnionId(marriages[0]?.id ?? "");
                setChLast(person.lastName);
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

      <FormBottomSheet
        visible={spouseOpen}
        title={copy.profile.addSpouse}
        onDismiss={() => setSpouseOpen(false)}
        onSubmit={submitSpouse}
        submitLabel={copy.profile.saveChanges}
        submitTestID="member-spouse-save"
        cancelLabel={copy.reports.cancel}
      >
        <MemberFormModeToggle mode={spouseFormMode} onChange={setSpouseFormMode} />
        {spouseFormMode === "link" ? (
          <ExistingMemberPicker
            members={localPeople}
            excludeIds={[person.id]}
            selectedId={linkSpouseId}
            onSelect={setLinkSpouseId}
          />
        ) : (
          <>
            <FormTextInput
              testID="member-spouse-first"
              label="First name"
              value={spFirst}
              onChangeText={setSpFirst}
              errorText={fieldErrors.spFirst}
            />
            <FormTextInput
              testID="member-spouse-last"
              label="Last name"
              value={spLast}
              onChangeText={setSpLast}
              errorText={fieldErrors.spLast}
            />
            {fieldErrors.spGender ? (
              <AppText variant="bodySmall" className="text-destructive">
                {fieldErrors.spGender}
              </AppText>
            ) : null}
            {spGender ? (
              <GenderField
                value={spGender}
                onChange={(g) => setSpGender(g)}
                label="Gender"
              />
            ) : (
              <GenderField
                value="MALE"
                onChange={(g) => setSpGender(g)}
                label="Gender"
              />
            )}
          </>
        )}
      </FormBottomSheet>

      <FormBottomSheet
        visible={childOpen}
        title={copy.profile.addChild}
        onDismiss={() => setChildOpen(false)}
        onSubmit={submitChild}
        submitLabel={copy.profile.saveChanges}
        submitTestID="member-child-save"
        cancelLabel={copy.reports.cancel}
      >
        <MemberFormModeToggle mode={childFormMode} onChange={setChildFormMode} />
        {childFormMode === "link" ? (
          <ExistingMemberPicker
            members={localPeople}
            excludeIds={[person.id]}
            selectedId={linkChildId}
            onSelect={setLinkChildId}
          />
        ) : (
          <>
            <FormTextInput
              testID="member-child-first"
              label="First name"
              value={chFirst}
              onChangeText={setChFirst}
              errorText={fieldErrors.chFirst}
            />
            <FormTextInput
              testID="member-child-last"
              label="Last name"
              value={chLast}
              onChangeText={setChLast}
              errorText={fieldErrors.chLast}
            />
            <GenderField value={chGender} onChange={setChGender} label="Gender" />
          </>
        )}
      </FormBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: space.sm, gap: space.sm },
});
