import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
      const data =
        code
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
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!bundle) {
    return (
      <View style={styles.centered}>
        <Text>{copy.profile.notFound}</Text>
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
      Alert.alert(copy.profile.addChild, copy.profile.needMarriageFirst);
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.name}>
        {m.firstName} {m.lastName}
      </Text>
      <Text style={styles.code}>{m.familyCode}</Text>
      {(m.urduFirstName || m.urduLastName) && (
        <Text style={styles.urdu}>{m.urduFirstName} {m.urduLastName}</Text>
      )}
      <Text style={styles.meta}>{formatGender(m.gender)}</Text>

      {canEditLocal && (
        <View style={styles.actions}>
          <Pressable style={styles.btn} onPress={() => setEditing((v) => !v)}>
            <Text style={styles.btnText}>
              {editing ? copy.profile.cancelEdit : copy.profile.editProfile}
            </Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => setSpouseOpen(true)}>
            <Text style={styles.btnText}>+ {copy.profile.addSpouse}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => setChildOpen(true)}>
            <Text style={styles.btnText}>+ {copy.profile.addChild}</Text>
          </Pressable>
        </View>
      )}

      {editing && (
        <View style={styles.card}>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
          <TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder="Bio" multiline />
          <Pressable style={styles.primary} onPress={saveEdit}>
            <Text style={styles.primaryText}>{copy.profile.saveChanges}</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.section}>{copy.profile.marriagesSection}</Text>
      {bundle.unions.length === 0 ? (
        <Text style={styles.hint}>{copy.profile.noMarriages}</Text>
      ) : (
        bundle.unions.map((u) => (
          <View key={u.id} style={styles.card}>
            <Text style={styles.unionTitle}>
              {copy.tree.marriageTo(u.partner1Name, u.partner2Name)}
            </Text>
            {u.children.map((c) => (
              <Pressable
                key={c.id}
                onPress={() =>
                  router.push({
                    pathname: "/member/[personId]",
                    params: { personId: c.id, code: c.familyCode },
                  })
                }
              >
                <Text style={styles.child}>· {c.name} ({c.familyCode})</Text>
              </Pressable>
            ))}
          </View>
        ))
      )}

      {bundle.onlineDetails?.computed && (
        <>
          <Text style={styles.section}>{copy.profile.kinshipOnline}</Text>
          {bundle.onlineDetails.computed.fullSiblings?.map((s) => (
            <Text key={s.familyCode} style={styles.child}>
              {copy.profile.fullSibling(`${s.firstName} ${s.lastName}`)}
            </Text>
          ))}
          {bundle.onlineDetails.computed.halfSiblings?.map((s) => (
            <Text key={s.familyCode} style={styles.child}>
              {copy.profile.halfSibling(`${s.firstName} ${s.lastName}`)}
            </Text>
          ))}
        </>
      )}

      <Pressable
        style={styles.secondary}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/tree",
            params: { familyCode: m.familyCode },
          })
        }
      >
        <Text style={styles.secondaryText}>{copy.profile.openInTree}</Text>
      </Pressable>

      <Modal visible={spouseOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{copy.profile.addSpouse}</Text>
            <TextInput style={styles.input} placeholder="First name" value={spFirst} onChangeText={setSpFirst} />
            <TextInput style={styles.input} placeholder="Last name" value={spLast} onChangeText={setSpLast} />
            <Pressable style={styles.primary} onPress={submitSpouse}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
            <Pressable onPress={() => setSpouseOpen(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={childOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{copy.profile.addChild}</Text>
            <TextInput style={styles.input} placeholder="First name" value={chFirst} onChangeText={setChFirst} />
            <TextInput style={styles.input} placeholder="Last name" value={chLast} onChangeText={setChLast} />
            <Pressable style={styles.primary} onPress={submitChild}>
              <Text style={styles.primaryText}>Save</Text>
            </Pressable>
            <Pressable onPress={() => setChildOpen(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fafafa" },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 24, fontWeight: "700" },
  code: { fontFamily: "SpaceMono", color: "#4f46e5", marginTop: 4 },
  urdu: { fontSize: 20, marginTop: 8 },
  meta: { color: "#71717a", marginTop: 8 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  btn: {
    backgroundColor: "#eef2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#4338ca", fontWeight: "600", fontSize: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  primary: {
    backgroundColor: "#4f46e5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600" },
  section: { marginTop: 20, fontWeight: "700", fontSize: 16 },
  hint: { color: "#a1a1aa", marginTop: 8 },
  unionTitle: { fontWeight: "600" },
  child: { marginTop: 4, color: "#4f46e5" },
  secondary: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    alignItems: "center",
  },
  secondaryText: { color: "#4338ca", fontWeight: "600" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  cancel: { textAlign: "center", marginTop: 12, color: "#71717a" },
});
