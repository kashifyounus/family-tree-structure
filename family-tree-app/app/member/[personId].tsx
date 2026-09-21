import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

import { FormTextInput } from "@/components/ui/FormTextInput";
import { Screen } from "@/components/ui/Screen";
import { copy } from "@/content/businessCopy";
import { useAppFeedback } from "@/context/ErrorContext";
import { useStorage } from "@/context/StorageContext";
import { formatGender } from "@/lib/format/gender";
import {
  addChild,
  addSpouse,
  loadPersonByCode,
  loadPersonById,
  unionOptions,
  updatePerson,
} from "@/lib/data/personService";
import type { PersonBundle } from "@/lib/data/personService";

export default function MemberDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mode, bumpDataRevision } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
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
  const [bio, setBio] = useState("");
  const [spouseOpen, setSpouseOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  const [spFirst, setSpFirst] = useState("");
  const [spLast, setSpLast] = useState("");
  const [chFirst, setChFirst] = useState("");
  const [chLast, setChLast] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = code
        ? await loadPersonByCode(mode, String(code))
        : await loadPersonById(mode, String(personId));
      setBundle(data);
      if (data) {
        setFirstName(data.member.firstName);
        setLastName(data.member.lastName);
        setCity(data.member.currentCity ?? "");
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
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator />
      </View>
    );
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

  const saveEdit = () => {
    try {
      updatePerson(mode, {
        personId: m.id,
        firstName,
        lastName,
        currentCity: city || undefined,
        bio: bio || undefined,
      });
      setEditing(false);
      bumpDataRevision();
      void reload();
      showSuccess(copy.success.saved);
    } catch (e) {
      showError(e);
    }
  };

  const submitSpouse = () => {
    try {
      addSpouse(mode, {
        relatedPersonId: m.id,
        firstName: spFirst.trim(),
        lastName: spLast.trim(),
        gender: "FEMALE",
      });
      setSpouseOpen(false);
      setSpFirst("");
      setSpLast("");
      bumpDataRevision();
      void reload();
    } catch (e) {
      showError(e);
    }
  };

  const submitChild = () => {
    const marriages = unionOptions(mode, m.id);
    if (marriages.length === 0) {
      showError(copy.profile.needMarriageFirst);
      return;
    }
    try {
      addChild(mode, {
        parentPersonId: m.id,
        unionId: marriages[0].id,
        firstName: chFirst.trim(),
        lastName: chLast.trim(),
        gender: "MALE",
      });
      setChildOpen(false);
      setChFirst("");
      setChLast("");
      bumpDataRevision();
      void reload();
    } catch (e) {
      showError(e);
    }
  };

  return (
    <>
      <Screen testID="member-profile-screen" keyboardAvoiding>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
          {m.firstName} {m.lastName}
        </Text>
        <Text variant="labelLarge" style={{ color: theme.colors.primary, marginTop: 4 }}>
          {copy.account.memberReference}: {m.familyCode}
        </Text>
        {(m.urduFirstName || m.urduLastName) && (
          <Text variant="titleMedium" style={{ marginTop: 8, color: theme.colors.onSurface }}>
            {m.urduFirstName} {m.urduLastName}
          </Text>
        )}
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          {formatGender(m.gender)}
        </Text>

        {canEditLocal && (
          <View style={styles.actions}>
            <Button mode="outlined" onPress={() => setEditing((v) => !v)}>
              {editing ? copy.profile.cancelEdit : copy.profile.editProfile}
            </Button>
            <Button
              testID="member-add-spouse"
              mode="contained-tonal"
              icon="heart"
              onPress={() => setSpouseOpen(true)}
            >
              {copy.profile.addSpouse}
            </Button>
            <Button mode="contained-tonal" icon="baby-carriage" onPress={() => setChildOpen(true)}>
              {copy.profile.addChild}
            </Button>
          </View>
        )}

        {editing && (
          <Card mode="elevated" style={styles.block}>
            <Card.Content style={styles.gap}>
              <FormTextInput label="First name" value={firstName} onChangeText={setFirstName} />
              <FormTextInput label="Last name" value={lastName} onChangeText={setLastName} />
              <FormTextInput label="City" value={city} onChangeText={setCity} />
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
          bundle.unions.map((u) => (
            <Card key={u.id} mode="elevated" style={styles.block}>
              <Card.Content>
                <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                  {copy.tree.marriageTo(u.partner1Name, u.partner2Name)}
                </Text>
                {u.children.map((c) => (
                  <Button
                    key={c.id}
                    mode="text"
                    compact
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
              </Card.Content>
            </Card>
          ))
        )}

        {bundle.onlineDetails?.computed && (
          <>
            <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
              {copy.profile.kinshipOnline}
            </Text>
            {bundle.onlineDetails.computed.fullSiblings?.map((s) => (
              <Text key={s.familyCode} variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {copy.profile.fullSibling(`${s.firstName} ${s.lastName}`)}
              </Text>
            ))}
            {bundle.onlineDetails.computed.halfSiblings?.map((s) => (
              <Text key={s.familyCode} variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {copy.profile.halfSibling(`${s.firstName} ${s.lastName}`)}
              </Text>
            ))}
          </>
        )}

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
              <FormTextInput label="First name" value={chFirst} onChangeText={setChFirst} />
              <FormTextInput label="Last name" value={chLast} onChangeText={setChLast} />
            </View>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setChildOpen(false)}>{copy.reports.cancel}</Button>
            <Button mode="contained" onPress={submitChild}>
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
  dialogScroll: { maxHeight: 280 },
  dialogInner: { gap: 12, paddingHorizontal: 24, paddingVertical: 8 },
});
