import { StyleSheet, View } from "react-native";

import { MarriageChildrenList } from "@/components/members/profile/MarriageChildrenList";
import { ParentPairCards } from "@/components/members/profile/ParentPairCards";
import { SiblingsTable } from "@/components/members/profile/SiblingsTable";
import { SpousePill } from "@/components/members/profile/SpousePill";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { Button, ButtonText } from "@/components/ui/button";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { SectionCard } from "@/components/ui/SectionCard";
import { copy } from "@/content/businessCopy";
import type { PersonBundle } from "@/lib/data/personService";
import type { MemberRecord } from "@/lib/data/types";
import { formatDisplayDate } from "@/lib/format/displayDate";
import type { MemberProfileEditFields } from "@/lib/members/memberProfileEditForm";
import type { FieldErrors } from "@/lib/forms/fieldErrors";
import type { KinshipPerson } from "@/lib/kinship/types";
import { useAppTheme } from "@/theme/useAppTheme";

type MemberProfileSectionsProps = {
  member: MemberRecord;
  bundle: PersonBundle;
  editing: boolean;
  editFields: MemberProfileEditFields;
  fieldErrors: FieldErrors;
  relationToMeText: string | null;
  fatherParent?: KinshipPerson;
  motherParent?: KinshipPerson;
  spouseNameFromUnion: string | null;
  activeUnionId?: string;
  onPatchEditField: <K extends keyof MemberProfileEditFields>(
    key: K,
    value: MemberProfileEditFields[K],
  ) => void;
  onSaveEdit: () => void;
  onOpenMember: (personId: string, familyCode: string) => void;
  onOpenMarriage: (unionId: string) => void;
};

export function MemberProfileSections({
  member,
  bundle,
  editing,
  editFields,
  fieldErrors,
  relationToMeText,
  fatherParent,
  motherParent,
  spouseNameFromUnion,
  activeUnionId,
  onPatchEditField,
  onSaveEdit,
  onOpenMember,
  onOpenMarriage,
}: MemberProfileSectionsProps) {
  const theme = useAppTheme();
  const activeUnion = bundle.unions.find((u) => u.id === activeUnionId);

  return (
    <>
      <View className="mb-4">
        <ParentPairCards
          father={fatherParent}
          mother={motherParent}
          onPressParent={onOpenMember}
        />
      </View>
      {spouseNameFromUnion && activeUnion ? (
        <View className="mb-4">
          <SpousePill
            spouseName={spouseNameFromUnion}
            marriageDate={activeUnion.marriageDate}
            onPress={() => onOpenMarriage(activeUnion.id)}
          />
        </View>
      ) : null}
      {!editing && (
        <SectionCard title="About" delay={60}>
          <AppText variant="labelMedium" className="text-muted-foreground">
            Birth
          </AppText>
          <AppText variant="bodyMedium" className="text-foreground mb-2">
            {formatDisplayDate(member.birthDate) ?? "—"}
            {member.birthPlace ? ` · ${member.birthPlace}` : ""}
          </AppText>
          <AppText variant="labelMedium" className="text-muted-foreground">
            Home
          </AppText>
          <AppText variant="bodyMedium" className="text-foreground mb-2">
            {[member.homeTown, member.currentCity].filter(Boolean).join(" · ") || "—"}
          </AppText>
          <AppText variant="labelMedium" className="text-muted-foreground">
            Occupation
          </AppText>
          <AppText variant="bodyMedium" className="text-foreground">
            {member.occupation ?? "—"}
          </AppText>
          {member.bio ? (
            <>
              <AppText variant="labelMedium" className="text-muted-foreground mt-3">
                Notes
              </AppText>
              <AppText variant="bodyMedium" className="text-foreground">
                {member.bio}
              </AppText>
            </>
          ) : null}
        </SectionCard>
      )}
      {relationToMeText ? (
        <SectionCard title={copy.profile.relationToMe} delay={70}>
          <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {relationToMeText}
          </AppText>
        </SectionCard>
      ) : null}
      {editing && (
        <AppCard style={styles.block}>
          <AppCardContent style={styles.gap}>
            <FormTextInput
              label="First name"
              value={editFields.firstName}
              onChangeText={(v) => onPatchEditField("firstName", v)}
              errorText={fieldErrors.firstName}
            />
            <FormTextInput
              label="Last name"
              value={editFields.lastName}
              onChangeText={(v) => onPatchEditField("lastName", v)}
              errorText={fieldErrors.lastName}
            />
            <DatePickerField
              label="Date of birth"
              value={editFields.birthDate}
              onChange={(v) => onPatchEditField("birthDate", v)}
            />
            <FormTextInput
              label="Birth place"
              value={editFields.birthPlace}
              onChangeText={(v) => onPatchEditField("birthPlace", v)}
            />
            <FormTextInput
              label="City"
              value={editFields.city}
              onChangeText={(v) => onPatchEditField("city", v)}
            />
            <FormTextInput
              label="Home town"
              value={editFields.homeTown}
              onChangeText={(v) => onPatchEditField("homeTown", v)}
            />
            <FormTextInput
              label="Occupation"
              value={editFields.occupation}
              onChangeText={(v) => onPatchEditField("occupation", v)}
            />
            <FormTextInput
              label="Notes"
              value={editFields.bio}
              onChangeText={(v) => onPatchEditField("bio", v)}
              multiline
              numberOfLines={3}
            />
            <Button onPress={onSaveEdit}>
              <ButtonText>{copy.profile.saveChanges}</ButtonText>
            </Button>
          </AppCardContent>
        </AppCard>
      )}

      <AppText variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
        {copy.profile.marriagesSection}
      </AppText>
      {bundle.unions.length === 0 ? (
        <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {copy.profile.noMarriages}
        </AppText>
      ) : (
        bundle.unions.map((u, index) => (
          <SectionCard
            key={u.id}
            delay={80 + index * 40}
            title={copy.tree.marriageTo(u.partner1Name, u.partner2Name)}
            subtitle={
              u.isActive === false ? copy.profile.previousMarriage : copy.profile.currentMarriage
            }
          >
            <Button
              variant="outline"
              size="sm"
              className="self-start rounded-full"
              onPress={() => onOpenMarriage(u.id)}
            >
              <ButtonText>View marriage</ButtonText>
            </Button>
            <MarriageChildrenList unionChildren={u.children} onPressChild={onOpenMember} />
          </SectionCard>
        ))
      )}

      <AppText variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
        {copy.profile.fullSiblingsSection}
      </AppText>
      <SiblingsTable
        siblings={bundle.computed?.fullSiblings ?? []}
        emptyMessage={copy.profile.noFullSiblings}
        onPressSibling={onOpenMember}
      />

      <AppText variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
        {copy.profile.halfSiblingsSection}
      </AppText>
      <SiblingsTable
        siblings={bundle.computed?.halfSiblings ?? []}
        emptyMessage={copy.profile.noHalfSiblings}
        onPressSibling={onOpenMember}
      />

      <AppText variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
        {copy.profile.stepSiblingsSection}
      </AppText>
      <SiblingsTable
        siblings={bundle.computed?.stepSiblings ?? []}
        emptyMessage={copy.profile.noStepSiblings}
        onPressSibling={onOpenMember}
      />
    </>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 12, borderRadius: 16 },
  gap: { gap: 10 },
  section: { marginTop: 20 },
});
