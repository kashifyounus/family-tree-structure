import { useLocalSearchParams, useRouter } from "expo-router";
import { ShowcasePersonDetail } from "@/components/members/ShowcasePersonDetail";
import {
  SHOWCASE_MARGARET_ID,
  margaretKhanProfile,
} from "@/lib/mock/kuriosityShowcase";
import { AppCard, AppCardContent } from "@/components/ui/AppCard";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { AddRelationSheet } from "@/components/members/AddRelationSheet";
import { MemberProfileHero } from "@/components/members/profile/MemberProfileHero";
import { ParentPairCards } from "@/components/members/profile/ParentPairCards";
import { SiblingsTable } from "@/components/members/profile/SiblingsTable";
import { SpousePill } from "@/components/members/profile/SpousePill";
import { CoupleParentPickerSheet } from "@/components/parents/CoupleParentPickerSheet";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { PageHeader } from "@/components/ui/PageHeader";
import { DatePickerField } from "@/components/forms/DatePickerField";
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
  assignParentSlot,
  assignParentsToCouple,
  createAndAssignParentSlot,
  linkChild,
  linkChildToParent,
  linkSpouse,
  loadPersonByCode,
  loadPersonById,
  parentCouplesForPicker,
  peopleForPicker,
  unionOptions,
  updatePerson,
} from "@/lib/data/personService";
import type { PersonBundle } from "@/lib/data/personService";
import type { Gender } from "@/lib/data/types";
import { formatDisplayDate } from "@/lib/format/displayDate";
import { formatBilingualName } from "@/lib/format/displayName";
import { recordRecentVisit } from "@/lib/recentPeople";
import { computeRelationSummary } from "@/lib/kinship/relationshipPath";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import { defaultParentSlotForOpen, type ParentSlot } from "@/lib/rules/parentSlots";
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
  const isShowcaseMargaret = personId === SHOWCASE_MARGARET_ID;
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
  const [chUnionId, setChUnionId] = useState("");
  const [parentsOpen, setParentsOpen] = useState(false);
  const [coupleParentsOpen, setCoupleParentsOpen] = useState(false);
  const [parentSlot, setParentSlot] = useState<ParentSlot>("father");
  const [parentStaged, setParentStaged] = useState<{
    parentId: string;
    slot: ParentSlot;
  } | null>(null);
  const [parentQuery, setParentQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reload = useCallback(async () => {
    if (isShowcaseMargaret) {
      setLoading(false);
      return;
    }
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
  }, [code, isShowcaseMargaret, mode, personId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (isShowcaseMargaret) {
    return <ShowcasePersonDetail profile={margaretKhanProfile} />;
  }

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

  const linkSpouseMember = (spouseId: string) => {
    if (!spouseId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      linkSpouse(mode, { personId: m.id, spouseId });
      setSpouseOpen(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.spouseLinked);
    } catch (e) {
      showError(e);
    }
  };

  const createSpouseMember = (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
    marriageDate?: string;
  }) => {
    const errors: FieldErrors = {
      spFirst: required(payload.firstName, "First name"),
      spLast: required(payload.lastName, "Last name"),
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
      addSpouse(mode, {
        relatedPersonId: m.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
        marriageDate: payload.marriageDate,
      });
      setSpouseOpen(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.spouseSaved);
    } catch (e) {
      showError(e);
    }
  };

  const linkChildMember = (childId: string) => {
    const marriages = unionOptions(mode, m.id);
    const unionId = chUnionId || marriages[0]?.id;
    if (!childId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      if (unionId) {
        linkChild(mode, { unionId, childId });
      } else {
        linkChildToParent(mode, m.id, childId);
      }
      setChildOpen(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.childLinked);
    } catch (e) {
      showError(e);
    }
  };

  const createChildMember = (payload: {
    firstName: string;
    lastName: string;
    gender: Gender;
  }) => {
    const marriages = unionOptions(mode, m.id);
    const unionId = chUnionId || marriages[0]?.id;
    const errors: FieldErrors = {
      chFirst: required(payload.firstName, "First name"),
      chLast: required(payload.lastName, "Last name"),
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
        unionId: unionId || undefined,
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
      });
      setChildOpen(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.childSaved);
    } catch (e) {
      showError(e);
    }
  };

  const parentCoupleRows =
    canEditLocal && coupleParentsOpen
      ? parentCouplesForPicker(mode, m.id, parentQuery)
      : [];

  const applyParentAssignResult = (
    result: ReturnType<typeof assignParentSlot>,
  ) => {
    if (result.status !== "complete") return;
    setParentStaged(null);
    setParentsOpen(false);
    bumpDataRevision();
    void reload();
    impactLight();
    showSuccess(copy.profile.parentsSaved);
  };

  const linkParentMember = (parentPersonId: string) => {
    if (!parentPersonId) {
      showError(new Error(copy.profile.pickMemberRequired));
      return;
    }
    try {
      const result = assignParentSlot(mode, {
        childId: m.id,
        slot: parentSlot,
        parentPersonId,
        staged: parentStaged,
      });
      applyParentAssignResult(result);
    } catch (e) {
      showError(e);
    }
  };

  const createParentMember = (payload: {
    firstName: string;
    lastName: string;
    birthDate?: string;
    parentSlot?: ParentSlot;
  }) => {
    const slot = payload.parentSlot ?? parentSlot;
    const errors: FieldErrors = {
      paFirst: required(payload.firstName, "First name"),
      paLast: required(payload.lastName, "Last name"),
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
      const result = createAndAssignParentSlot(mode, {
        childId: m.id,
        slot,
        firstName: payload.firstName,
        lastName: payload.lastName,
        birthDate: payload.birthDate,
        staged: parentStaged,
      });
      applyParentAssignResult(result);
    } catch (e) {
      showError(e);
    }
  };

  const onSelectParentCouple = (unionId: string) => {
    try {
      assignParentsToCouple(mode, m.id, unionId);
      setCoupleParentsOpen(false);
      setParentStaged(null);
      setParentQuery("");
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.parentsSaved);
    } catch (e) {
      showError(e);
    }
  };

  const openParentSheet = () => {
    setParentSlot(defaultParentSlotForOpen(bundle.parents, parentStaged));
    setParentsOpen(true);
  };

  const parentStepHint = parentStaged
    ? copy.profile.parentStepHint(
        parentStaged.slot === "father"
          ? copy.profile.parentRoleMother.toLowerCase()
          : copy.profile.parentRoleFather.toLowerCase(),
      )
    : null;

  const parentExcludeIds = [m.id, ...(parentStaged ? [parentStaged.parentId] : [])];

  const fatherParent = bundle.parents.find((p) => p.gender === "MALE");
  const motherParent = bundle.parents.find((p) => p.gender === "FEMALE");
  const localPeople = canEditLocal ? peopleForPicker(mode) : [];
  const activeUnion =
    bundle.unions.find((u) => u.isActive !== false) ?? bundle.unions[0];
  const spouseNameFromUnion =
    activeUnion && activeUnion.partner1Id
      ? activeUnion.partner1Id === m.id
        ? activeUnion.partner2Name
        : activeUnion.partner1Name
      : null;
  const lifeStatus = m.deathDate ? "Deceased" : "Living";
  const marriageOptions = unionOptions(mode, m.id);
  const activeUnionId = chUnionId || unionOptions(mode, m.id)[0]?.id;
  const activeMarriage = bundle.unions.find((u) => u.id === activeUnionId);
  const childExcludeIds = [
    m.id,
    ...(activeMarriage?.children.map((c) => c.id) ?? []),
  ];

  return (
    <>
      <Screen testID="member-profile-screen" keyboardAvoiding>
        <PageHeader title="Profile" />
        <MemberProfileHero member={m} statusLabel={lifeStatus} />
        <View className="mb-4">
          <ParentPairCards
            father={fatherParent}
            mother={motherParent}
            onPressParent={(personId, familyCode) =>
              router.push({
                pathname: "/member/[personId]",
                params: { personId, code: familyCode },
              })
            }
          />
        </View>
        {spouseNameFromUnion ? (
          <View className="mb-4">
            <SpousePill
              spouseName={spouseNameFromUnion}
              marriageDate={activeUnion?.marriageDate}
              onPress={() =>
                activeUnion
                  ? router.push({
                      pathname: "/marriage/[unionId]",
                      params: { unionId: activeUnion.id },
                    })
                  : undefined
              }
            />
          </View>
        ) : null}
        {!editing && (
          <SectionCard title="About" delay={60}>
            <AppText variant="labelMedium" className="text-muted-foreground">
              Birth
            </AppText>
            <AppText variant="bodyMedium" className="text-foreground mb-2">
              {formatDisplayDate(m.birthDate) ?? "—"}
              {m.birthPlace ? ` · ${m.birthPlace}` : ""}
            </AppText>
            <AppText variant="labelMedium" className="text-muted-foreground">
              Home
            </AppText>
            <AppText variant="bodyMedium" className="text-foreground mb-2">
              {[m.homeTown, m.currentCity].filter(Boolean).join(" · ") || "—"}
            </AppText>
            <AppText variant="labelMedium" className="text-muted-foreground">
              Occupation
            </AppText>
            <AppText variant="bodyMedium" className="text-foreground">
              {m.occupation ?? "—"}
            </AppText>
            {m.bio ? (
              <>
                <AppText variant="labelMedium" className="text-muted-foreground mt-3">
                  Notes
                </AppText>
                <AppText variant="bodyMedium" className="text-foreground">
                  {m.bio}
                </AppText>
              </>
            ) : null}
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
              onPress={() => setSpouseOpen(true)}
            >
              <ButtonText>{copy.profile.addSpouse}</ButtonText>
            </Button>
            <Button
              testID="member-add-child"
              variant="secondary"
              onPress={() => {
                setChUnionId(marriageOptions[0]?.id ?? "");
                setChildOpen(true);
              }}
            >
              <ButtonText>{copy.profile.addChild}</ButtonText>
            </Button>
            <Button testID="member-add-parents" variant="secondary" onPress={openParentSheet}>
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
              <DatePickerField
                label="Date of birth"
                value={birthDate}
                onChange={setBirthDate}
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

        <AppText variant="titleMedium" style={[styles.section, { color: theme.colors.onBackground }]}>
          Full siblings
        </AppText>
        <SiblingsTable
          siblings={bundle.computed?.fullSiblings ?? []}
          onPressSibling={(personId, familyCode) =>
            router.push({
              pathname: "/member/[personId]",
              params: { personId, code: familyCode },
            })
          }
        />

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

      <AddRelationSheet
        visible={spouseOpen}
        kind="spouse"
        title={copy.profile.addSpouse}
        members={localPeople}
        excludeIds={[m.id]}
        defaultGender={defaultSpouseGender(m.gender) ?? "MALE"}
        onDismiss={() => setSpouseOpen(false)}
        onSubmitCreate={createSpouseMember}
        onSubmitLink={linkSpouseMember}
        submitTestID="member-spouse-save"
        fieldErrors={fieldErrors}
      />

      <AddRelationSheet
        visible={childOpen}
        kind="child"
        title={copy.profile.addChild}
        members={localPeople}
        excludeIds={childExcludeIds}
        marriageOptions={marriageOptions}
        selectedUnionId={chUnionId || marriageOptions[0]?.id}
        onUnionChange={setChUnionId}
        onDismiss={() => setChildOpen(false)}
        onSubmitCreate={createChildMember}
        onSubmitLink={linkChildMember}
        submitTestID="member-child-save"
        fieldErrors={fieldErrors}
      />

      <AddRelationSheet
        visible={parentsOpen}
        kind="parent"
        title={
          bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents
        }
        members={localPeople}
        excludeIds={parentExcludeIds}
        parentSlot={parentSlot}
        onParentSlotChange={setParentSlot}
        parentStepHint={parentStepHint}
        onLinkParentCouple={() => {
          setParentsOpen(false);
          setCoupleParentsOpen(true);
        }}
        onDismiss={() => setParentsOpen(false)}
        onSubmitCreate={createParentMember}
        onSubmitLink={linkParentMember}
        submitTestID="member-parent-save"
        fieldErrors={fieldErrors}
      />

      <CoupleParentPickerSheet
        visible={coupleParentsOpen}
        title={bundle.parents.length > 0 ? copy.profile.changeParents : copy.profile.addParents}
        rows={parentCoupleRows}
        replacingExisting={bundle.parents.length > 0}
        onDismiss={() => {
          setCoupleParentsOpen(false);
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
