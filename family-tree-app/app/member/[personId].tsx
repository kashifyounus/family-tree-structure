import { useLocalSearchParams, useRouter } from "expo-router";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { GenderField } from "@/components/ui/GenderField";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { KinshipSections } from "@/components/KinshipSections";
import { PersonFacts } from "@/components/PersonFacts";
import { CoupleParentPickerSheet } from "@/components/parents/CoupleParentPickerSheet";
import { FormBottomSheet } from "@/components/ui/FormBottomSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReferenceText } from "@/components/ui/ReferenceText";
import { LoadingView } from "@/components/ui/LoadingView";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useLocalAccount } from "@/context/LocalAccountContext";
import { useStorage } from "@/context/StorageContext";
import {
  addChild,
  addSpouse,
  assignParentsToCouple,
  loadPersonByCode,
  loadPersonById,
  parentCouplesForPicker,
  unionOptions,
  updatePerson,
} from "@/lib/data/personService";
import { formatParentLine } from "@/lib/db/parentDisplay";
import type { PersonBundle } from "@/lib/data/personService";
import type { Gender } from "@/lib/data/types";
import { formatBilingualName } from "@/lib/format/displayName";
import { recordRecentVisit } from "@/lib/recentPeople";
import { computeRelationSummary } from "@/lib/kinship/relationshipPath";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import { defaultSpouseGender } from "@/lib/rules/relationshipRules";
import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "@/components/ui/AppText";

export default function MemberDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { mode, bumpDataRevision } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
  const { impactLight } = useAppPreferences();
  const localAccount = useLocalAccount();
  const { personId, code } = useLocalSearchParams<{
    personId: string;
    code?: string;
  }>();
  const [bundle, setBundle] = useState<PersonBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [homeTown, setHomeTown] = useState("");
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  const [spouseOpen, setSpouseOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const [spFirst, setSpFirst] = useState("");
  const [spLast, setSpLast] = useState("");
  const [spGender, setSpGender] = useState<Gender | "">("");
  const [chFirst, setChFirst] = useState("");
  const [chLast, setChLast] = useState("");
  const [chGender, setChGender] = useState<Gender>("MALE");
  const [chUnionId, setChUnionId] = useState("");
  const [parentsOpen, setParentsOpen] = useState(false);
  const [parentQuery, setParentQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = code
        ? await loadPersonByCode(mode, String(code))
        : await loadPersonById(mode, String(personId));
      setBundle(data);
      if (data) {
        void recordRecentVisit({
          personId: data.member.id,
          familyCode: data.member.familyCode,
          displayName: formatBilingualName(data.member),
        });
        setFirstName(data.member.firstName);
        setLastName(data.member.lastName);
        setCity(data.member.currentCity ?? "");
        setBirthDate(data.member.birthDate ?? "");
        setBirthPlace(data.member.birthPlace ?? "");
        setHomeTown(data.member.homeTown ?? "");
        setOccupation(data.member.occupation ?? "");
        setBio(data.member.bio ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, [code, mode, personId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (loading) {
    return <LoadingView />;
  }

  if (!bundle) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <AppText variant="bodyLarge">{copy.profile.notFound}</AppText>
      </View>
    );
  }

  const m = bundle.member;
  const canEditLocal = mode === "local";
  const focalId =
    canEditLocal && localAccount.session ? localAccount.session.focalPersonId : null;
  const relationToMeText =
    focalId && focalId === m.id
      ? copy.profile.relationToMeSame
      : focalId
        ? computeRelationSummary(focalId, m.id)
        : canEditLocal
          ? copy.profile.relationToMeUnavailable
          : null;

  const saveEdit = () => {
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
    try {
      updatePerson(mode, {
        personId: m.id,
        firstName,
        lastName,
        currentCity: city || undefined,
        birthDate: birthDate || undefined,
        birthPlace: birthPlace || undefined,
        homeTown: homeTown || undefined,
        occupation: occupation || undefined,
        bio: bio || undefined,
      });
      setEditing(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.success.saved);
    } catch (e) {
      showError(e);
    }
  };

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
    setFieldErrors({});
    if (!spGender) return;
    try {
      addSpouse(mode, {
        relatedPersonId: m.id,
        firstName: spFirst.trim(),
        lastName: spLast.trim(),
        gender: spGender,
      });
      setSpouseOpen(false);
      setSpFirst("");
      setSpLast("");
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.spouseSaved);
    } catch (e) {
      showError(e);
    }
  };

  const submitChild = () => {
    const marriages = unionOptions(mode, m.id);
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
        parentPersonId: m.id,
        unionId,
        firstName: chFirst.trim(),
        lastName: chLast.trim(),
        gender: chGender,
      });
      setChildOpen(false);
      setChFirst("");
      setChLast("");
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.childSaved);
    } catch (e) {
      showError(e);
    }
  };

  const parentCoupleRows =
    canEditLocal && parentsOpen
      ? parentCouplesForPicker(mode, m.id, parentQuery)
      : [];

  const onSelectParentCouple = (unionId: string) => {
    try {
      assignParentsToCouple(mode, m.id, unionId);
      setParentsOpen(false);
      setParentQuery("");
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.parentsSaved);
    } catch (e) {
      showError(e);
    }
  };

  const fatherParent = bundle.parents.find((p) => p.gender === "MALE");
  const motherParent = bundle.parents.find((p) => p.gender === "FEMALE");
  const parentSubtitle =
    bundle.parents.length > 0
      ? formatParentLine({
          fatherName: fatherParent
            ? `${fatherParent.firstName} ${fatherParent.lastName}`.trim()
            : null,
          motherName: motherParent
            ? `${motherParent.firstName} ${motherParent.lastName}`.trim()
            : null,
        })
      : undefined;

  return (
    <>
      <Screen testID="member-profile-screen" keyboardAvoiding>
        <PageHeader
          title={formatBilingualName(m)}
          meta={m.familyCode}
          subtitle={parentSubtitle}
        />
        <ReferenceText label={copy.account.memberReference} code={m.familyCode} />
        {!editing && (
          <SectionCard title="Personal details" delay={60}>
            <PersonFacts member={m} />
          </SectionCard>
        )}
        {relationToMeText && (
          <SectionCard title={copy.profile.relationToMe} delay={70}>
            <AppText variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {relationToMeText}
            </AppText>
          </SectionCard>
        )}
        {!canEditLocal && (
          <AppText variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
            {copy.profile.cloudReadOnly}
          </AppText>
        )}

        <Button
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/tree",
              params: { familyCode: m.familyCode },
            })
          }
        >
          <ButtonText>{copy.profile.openInTree}</ButtonText>
        </Button>

        {canEditLocal && (
          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={() => {
                if (editing) {
                  setFirstName(m.firstName);
                  setLastName(m.lastName);
                  setCity(m.currentCity ?? "");
                  setBirthDate(m.birthDate ?? "");
                  setBirthPlace(m.birthPlace ?? "");
                  setHomeTown(m.homeTown ?? "");
                  setOccupation(m.occupation ?? "");
                  setBio(m.bio ?? "");
                }
                setEditing((v) => !v);
              }}
            >
              <ButtonText>{editing ? copy.profile.cancelEdit : copy.profile.editProfile}</ButtonText>
            </Button>
            <Button
              testID="member-add-spouse"
              variant="secondary"
              onPress={() => {
                setSpGender(defaultSpouseGender(m.gender) ?? "MALE");
                setSpLast(m.lastName);
                setSpouseOpen(true);
              }}
            >
              <ButtonText>{copy.profile.addSpouse}</ButtonText>
            </Button>
            <Button
              testID="member-add-child"
              variant="secondary"
              onPress={() => {
                const marriages = unionOptions(mode, m.id);
                setChUnionId(marriages[0]?.id ?? "");
                setChLast(m.lastName);
                setChildOpen(true);
              }}
            >
              <ButtonText>{copy.profile.addChild}</ButtonText>
            </Button>
            <Button variant="secondary" onPress={() => setParentsOpen(true)}>
              <ButtonText>
                {bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents}
              </ButtonText>
            </Button>
          </View>
        )}

        {editing && (
          <AppCard style={styles.block}>
            <AppCardContent style={styles.gap}>
              <FormTextInput
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                errorText={fieldErrors.firstName}
              />
              <FormTextInput
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                errorText={fieldErrors.lastName}
              />
              <FormTextInput
                label="Date of birth"
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
              />
              <FormTextInput label="Birth place" value={birthPlace} onChangeText={setBirthPlace} />
              <FormTextInput label="City" value={city} onChangeText={setCity} />
              <FormTextInput label="Home town" value={homeTown} onChangeText={setHomeTown} />
              <FormTextInput label="Occupation" value={occupation} onChangeText={setOccupation} />
              <FormTextInput
                label="Notes"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
              <Button onPress={saveEdit}>
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
              <Badge variant="outline" className="self-start">
                <BadgeText>
                  {u.isActive === false ? copy.profile.previousMarriage : copy.profile.currentMarriage}
                </BadgeText>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: "/marriage/[unionId]",
                    params: { unionId: u.id },
                  })
                }
              >
                <ButtonText>View marriage</ButtonText>
              </Button>
              {u.children.map((c) => (
                <Button
                  key={c.id}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onPress={() =>
                    router.push({
                      pathname: "/member/[personId]",
                      params: { personId: c.id, code: c.familyCode },
                    })
                  }
                >
                  <ButtonText>{c.name} ({c.familyCode})</ButtonText>
                </Button>
              ))}
            </SectionCard>
          ))
        )}

        <KinshipSections parents={bundle.parents} computed={bundle.computed} />

        <Button
          variant="outline"
          style={styles.treeBtn}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/tree",
              params: { familyCode: m.familyCode },
            })
          }
        >
          <ButtonText>{copy.profile.openInTree}</ButtonText>
        </Button>
      </Screen>

      <FormBottomSheet
        visible={spouseOpen}
        title={copy.profile.addSpouse}
        onDismiss={() => setSpouseOpen(false)}
        onSubmit={submitSpouse}
        submitLabel={copy.profile.saveChanges}
        submitTestID="member-spouse-save"
        cancelLabel={copy.reports.cancel}
      >
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
        <GenderField
          value={spGender === "" ? "MALE" : spGender}
          onChange={setSpGender}
          label="Gender"
        />
        {fieldErrors.spGender ? (
          <AppText variant="bodySmall" style={{ color: theme.colors.error }}>
            {fieldErrors.spGender}
          </AppText>
        ) : null}
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
        <FormTextInput
          testID="member-child-first"
          label="Given name"
          value={chFirst}
          onChangeText={setChFirst}
          errorText={fieldErrors.chFirst}
        />
        <FormTextInput
          testID="member-child-last"
          label="Family name"
          value={chLast}
          onChangeText={setChLast}
          errorText={fieldErrors.chLast}
        />
        <GenderField value={chGender} onChange={setChGender} label="Gender" />
        {unionOptions(mode, m.id).map((marriage) => (
          <Button
            key={marriage.id}
            variant={chUnionId === marriage.id ? "default" : "outline"}
            onPress={() => setChUnionId(marriage.id)}
          >
            <ButtonText>{marriage.label}</ButtonText>
          </Button>
        ))}
      </FormBottomSheet>

      <CoupleParentPickerSheet
        visible={parentsOpen}
        title={bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents}
        rows={parentCoupleRows}
        replacingExisting={bundle.parents.length > 0}
        onDismiss={() => {
          setParentsOpen(false);
          setParentQuery("");
        }}
        onSelectCouple={(row) => onSelectParentCouple(row.unionId)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  block: { marginTop: 12, borderRadius: 16 },
  gap: { gap: 10 },
  section: { marginTop: 20 },
  treeBtn: { marginTop: 24, marginBottom: 8 },
  dialogScroll: { maxHeight: 420 },
  dialogInner: { gap: 12, paddingHorizontal: 24, paddingVertical: 8 },
});
