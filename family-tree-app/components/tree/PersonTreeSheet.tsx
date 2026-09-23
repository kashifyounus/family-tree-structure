import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Dialog,
  Modal,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useStorage } from "@/context/StorageContext";
import { addChild, addSpouse, unionOptions } from "@/lib/data/personService";
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
  const theme = useTheme();
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!person) return null;

  const isPrivate = person.treeDisplayIsPrivate === true;
  const canAddLocal = isLocal && !isPrivate && mode === "local";

  const submitSpouse = () => {
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
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={[
            styles.sheet,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            {formatGraphPersonName(person)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.primary, marginTop: 4 }}>
            {person.familyCode}
          </Text>
          <View style={styles.actions}>
            {!isPrivate && (
              <Button
                mode="contained"
                icon="account"
                onPress={() => {
                  onDismiss();
                  router.push({
                    pathname: "/member/[personId]",
                    params: { personId: person.id, code: person.familyCode },
                  });
                }}
              >
                {copy.tree.sheetProfile}
              </Button>
            )}
            {canAddLocal && (
              <Button
                testID="tree-sheet-add-spouse"
                mode="contained-tonal"
                icon="heart"
                onPress={() => {
                  setSpGender(defaultSpouseGender(person.gender) ?? "");
                  setSpLast(person.lastName);
                  setSpouseOpen(true);
                }}
              >
                {copy.profile.addSpouse}
              </Button>
            )}
            {canAddLocal && (
              <Button
                testID="tree-sheet-add-child"
                mode="contained-tonal"
                icon="baby-carriage"
                onPress={() => {
                  const marriages = unionOptions(mode, person.id);
                  setChUnionId(marriages[0]?.id ?? "");
                  setChLast(person.lastName);
                  setChildOpen(true);
                }}
              >
                {copy.profile.addChild}
              </Button>
            )}
            {!isPrivate && (
              <Button mode="outlined" icon="target" onPress={onCenterTree}>
                {copy.tree.sheetCenter}
              </Button>
            )}
            <Button mode="text" onPress={onDismiss}>
              {copy.reports.cancel}
            </Button>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Dialog visible={spouseOpen} onDismiss={() => setSpouseOpen(false)}>
          <Dialog.Title>{copy.profile.addSpouse}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <View style={styles.dialogInner}>
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
              <Text variant="labelLarge">Gender</Text>
              {fieldErrors.spGender ? (
                <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                  {fieldErrors.spGender}
                </Text>
              ) : null}
              <RadioButton.Group
                onValueChange={(value) => setSpGender(value as Gender)}
                value={spGender}
              >
                <RadioButton.Item label="Female" value="FEMALE" />
                <RadioButton.Item label="Male" value="MALE" />
                <RadioButton.Item label="Other" value="OTHER" />
              </RadioButton.Group>
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSpouseOpen(false)}>{copy.reports.cancel}</Button>
            <Button testID="member-spouse-save" mode="contained" onPress={submitSpouse}>
              {copy.profile.saveChanges}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={childOpen} onDismiss={() => setChildOpen(false)}>
          <Dialog.Title>{copy.profile.addChild}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <View style={styles.dialogInner}>
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
              <Text variant="labelLarge">Gender</Text>
              <RadioButton.Group
                onValueChange={(value) => setChGender(value as Gender)}
                value={chGender}
              >
                <RadioButton.Item label="Female" value="FEMALE" />
                <RadioButton.Item label="Male" value="MALE" />
                <RadioButton.Item label="Other" value="OTHER" />
              </RadioButton.Group>
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setChildOpen(false)}>{copy.reports.cancel}</Button>
            <Button testID="member-child-save" mode="contained" onPress={submitChild}>
              {copy.profile.saveChanges}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: space.lg,
    marginBottom: space.xl,
    padding: space.lg,
    borderRadius: 16,
  },
  actions: { marginTop: space.lg, gap: space.sm },
  dialogScroll: { maxHeight: 360, paddingHorizontal: 0 },
  dialogInner: { paddingHorizontal: space.lg, gap: space.sm },
});
