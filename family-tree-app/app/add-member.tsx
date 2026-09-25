import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { PrimaryPillButton } from "@/components/home/PrimaryPillButton";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { Screen } from "@/components/ui/Screen";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { createMember } from "@/lib/data/memberRepository";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

type RelationshipOption = "parent" | "child" | "spouse" | "sibling";

const RELATIONSHIP_OPTIONS: { value: RelationshipOption; label: string }[] = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Sibling" },
];

export default function AddMemberScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { mode, bumpDataRevision } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [notes, setNotes] = useState("");
  const [relationship, setRelationship] = useState<RelationshipOption>("parent");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

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
      router.back();
    } catch (e) {
      showError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add member",
          presentation: "modal",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} accessibilityRole="button">
              <AppText variant="labelMedium" style={{ color: theme.colors.primary }}>
                Cancel
              </AppText>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => void save()}
              disabled={saving}
              accessibilityRole="button"
            >
              <AppText variant="labelMedium" style={{ color: theme.colors.primary }}>
                Save
              </AppText>
            </Pressable>
          ),
        }}
      />
      <Screen testID="add-member-screen">
        <Pressable
          className="flex-row items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-4 mb-5"
          accessibilityRole="button"
        >
          <View className="h-12 w-12 rounded-full bg-muted items-center justify-center">
            <AppText variant="titleMedium" className="text-muted-foreground">+</AppText>
          </View>
          <AppText variant="bodyMedium" className="text-muted-foreground">
            Add photo (optional)
          </AppText>
        </Pressable>

        <View className="gap-4">
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
        </View>

        <View className="mt-8">
          <PrimaryPillButton
            testID="add-member-save"
            label="Save member"
            onPress={() => void save()}
          />
        </View>
      </Screen>
    </>
  );
}
