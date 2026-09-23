import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

import { KinshipSections } from "@/components/KinshipSections";
import { PersonFacts } from "@/components/PersonFacts";
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
  assignParents,
  loadPersonByCode,
  loadPersonById,
  peopleForPicker,
  unionOptions,
  updatePerson,
} from "@/lib/data/personService";
import type { PersonBundle } from "@/lib/data/personService";
import type { Gender } from "@/lib/data/types";
import { formatBilingualName } from "@/lib/format/displayName";
import { recordRecentVisit } from "@/lib/recentPeople";
import { computeRelationSummary } from "@/lib/kinship/relationshipPath";
import { defaultSpouseGender } from "@/lib/rules/relationshipRules";

export default function MemberDetailScreen() {
  const theme = useTheme();
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
  const [parentA, setParentA] = useState("");
  const [parentB, setParentB] = useState("");
  const [confirmParents, setConfirmParents] = useState(false);

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
        <Text variant="bodyLarge">{copy.profile.notFound}</Text>
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
    if (!spGender) {
      showError(new Error("Select a gender for the spouse."));
      return;
    }
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

  const submitParents = () => {
    if (bundle.parents.length > 0 && !confirmParents) {
      showError(copy.profile.confirmReplaceParents);
      return;
    }
    try {
      assignParents(mode, {
        personId: m.id,
        parentAId: parentA,
        parentBId: parentB,
      });
      setParentsOpen(false);
      setParentA("");
      setParentB("");
      setConfirmParents(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.parentsSaved);
    } catch (e) {
      showError(e);
    }
  };

  const pickerPeople =
    canEditLocal && parentsOpen
      ? peopleForPicker(mode).filter(
          (person) =>
            person.id !== m.id &&
            (`${person.name} ${person.familyCode}`).toLowerCase().includes(parentQuery.trim().toLowerCase()),
        )
      : [];

  return (
    <>
      <Screen testID="member-profile-screen" keyboardAvoiding>
        <PageHeader
          title={formatBilingualName(m)}
          meta={m.familyCode}
        />
        <ReferenceText label={copy.account.memberReference} code={m.familyCode} />
        {!editing && (
          <SectionCard title="Personal details" delay={60}>
            <PersonFacts member={m} />
          </SectionCard>
        )}
        {relationToMeText && (
          <SectionCard title={copy.profile.relationToMe} delay={70}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {relationToMeText}
            </Text>
          </SectionCard>
        )}
        {!canEditLocal && (
          <Text variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
            {copy.profile.cloudReadOnly}
          </Text>
        )}

        <Button
          mode="contained-tonal"
          icon="family-tree"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/tree",
              params: { familyCode: m.familyCode },
            })
          }
        >
          {copy.profile.openInTree}
        </Button>

        {canEditLocal && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
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
              {editing ? copy.profile.cancelEdit : copy.profile.editProfile}
            </Button>
            <Button
              testID="member-add-spouse"
              mode="contained-tonal"
              icon="heart"
              onPress={() => {
                setSpGender(defaultSpouseGender(m.gender) ?? "");
                setSpLast(m.lastName);
                setSpouseOpen(true);
              }}
            >
              {copy.profile.addSpouse}
            </Button>
            <Button
              testID="member-add-child"
              mode="contained-tonal"
              icon="baby-carriage"
              onPress={() => {
                const marriages = unionOptions(mode, m.id);
                setChUnionId(marriages[0]?.id ?? "");
                setChLast(m.lastName);
                setChildOpen(true);
              }}
            >
              {copy.profile.addChild}
            </Button>
            <Button mode="contained-tonal" icon="account-child" onPress={() => setParentsOpen(true)}>
              {bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents}
            </Button>
          </View>
        )}

        {editing && (
          <Card mode="elevated" style={styles.block}>
            <Card.Content style={styles.gap}>
              <FormTextInput label="First name" value={firstName} onChangeText={setFirstName} />
              <FormTextInput label="Last name" value={lastName} onChangeText={setLastName} />
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
              <Button mode="contained" onPress={saveEdit}>
                {copy.profile.saveChanges}
              </Button>
            </Card.Content>
          </Card>
        )}

        <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
          {copy.profile.marriagesSection}
        </Text>
        {bundle.unions.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {copy.profile.noMarriages}
          </Text>
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
              <Chip compact icon="heart" style={{ alignSelf: "flex-start" }}>
                {u.isActive === false ? copy.profile.previousMarriage : copy.profile.currentMarriage}
              </Chip>
              <Button
                mode="text"
                compact
                icon="ring"
                onPress={() =>
                  router.push({
                    pathname: "/marriage/[unionId]",
                    params: { unionId: u.id },
                  })
                }
              >
                View marriage
              </Button>
              {u.children.map((c) => (
                <Button
                  key={c.id}
                  mode="text"
                  compact
                  icon="account-child"
                  onPress={() =>
                    router.push({
                      pathname: "/member/[personId]",
                      params: { personId: c.id, code: c.familyCode },
                    })
                  }
                  labelStyle={{ textAlign: "left" }}
                >
                  {c.name} ({c.familyCode})
                </Button>
              ))}
            </SectionCard>
          ))
        )}

        <KinshipSections parents={bundle.parents} computed={bundle.computed} />

        <Button
          mode="outlined"
          icon="family-tree"
          style={styles.treeBtn}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/tree",
              params: { familyCode: m.familyCode },
            })
          }
        >
          {copy.profile.openInTree}
        </Button>
      </Screen>

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
              />
              <FormTextInput
                testID="member-spouse-last"
                label="Last name"
                value={spLast}
                onChangeText={setSpLast}
              />
              <Text variant="labelLarge">Gender</Text>
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
                label="Given name"
                value={chFirst}
                onChangeText={setChFirst}
              />
              <FormTextInput
                testID="member-child-last"
                label="Family name"
                value={chLast}
                onChangeText={setChLast}
              />
              <Text variant="labelLarge">Gender</Text>
              <RadioButton.Group
                onValueChange={(value) => setChGender(value as Gender)}
                value={chGender}
              >
                <RadioButton.Item label="Male" value="MALE" />
                <RadioButton.Item label="Female" value="FEMALE" />
                <RadioButton.Item label="Other" value="OTHER" />
              </RadioButton.Group>
              {unionOptions(mode, m.id).map((marriage) => (
                <Button
                  key={marriage.id}
                  mode={chUnionId === marriage.id ? "contained" : "outlined"}
                  onPress={() => setChUnionId(marriage.id)}
                >
                  {marriage.label}
                </Button>
              ))}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setChildOpen(false)}>{copy.reports.cancel}</Button>
            <Button testID="member-child-save" mode="contained" onPress={submitChild}>
              {copy.profile.saveChanges}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={parentsOpen} onDismiss={() => setParentsOpen(false)}>
          <Dialog.Title>
            {bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <View style={styles.dialogInner}>
              {bundle.parents.length > 0 && (
                <Text variant="bodySmall">{copy.profile.confirmReplaceParents}</Text>
              )}
              {bundle.parents.length > 0 && (
                <Button mode={confirmParents ? "contained" : "outlined"} onPress={() => setConfirmParents(true)}>
                  Confirm parent change
                </Button>
              )}
              <FormTextInput
                label="Search people"
                value={parentQuery}
                onChangeText={setParentQuery}
              />
              {pickerPeople.slice(0, 8).map((person) => (
                <View key={person.id} style={styles.actions}>
                  <Button
                    mode={parentA === person.id ? "contained" : "text"}
                    onPress={() => setParentA(person.id)}
                  >
                    Parent: {person.name}
                  </Button>
                  <Button
                    mode={parentB === person.id ? "contained" : "text"}
                    onPress={() => setParentB(person.id)}
                  >
                    Other parent
                  </Button>
                </View>
              ))}
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setParentsOpen(false)}>{copy.reports.cancel}</Button>
            <Button mode="contained" onPress={submitParents}>
              {copy.profile.saveChanges}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
