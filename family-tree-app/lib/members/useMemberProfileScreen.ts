import { useCallback, useEffect, useMemo, useState } from "react";

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
import { formatBilingualName } from "@/lib/format/displayName";
import { type FieldErrors, firstFieldError, required } from "@/lib/forms/fieldErrors";
import { computeRelationSummary } from "@/lib/kinship/relationshipPath";
import {
  editFieldsFromMember,
  emptyMemberProfileEditFields,
  type MemberProfileEditFields,
} from "@/lib/members/memberProfileEditForm";
import { recordRecentVisit } from "@/lib/recentPeople";
import { defaultParentSlotForOpen, type ParentSlot } from "@/lib/rules/parentSlots";
import { defaultSpouseGender } from "@/lib/rules/relationshipRules";

type UseMemberProfileScreenArgs = {
  personId: string;
  code?: string;
  skipLoad?: boolean;
};

export function useMemberProfileScreen({
  personId,
  code,
  skipLoad = false,
}: UseMemberProfileScreenArgs) {
  const { mode, bumpDataRevision } = useStorage();
  const { showError, showSuccess } = useAppFeedback();
  const { impactLight } = useAppPreferences();
  const localAccount = useLocalAccount();

  const [bundle, setBundle] = useState<PersonBundle | null>(null);
  const [loading, setLoading] = useState(!skipLoad);
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] =
    useState<MemberProfileEditFields>(emptyMemberProfileEditFields);
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

  const patchEditField = useCallback(
    <K extends keyof MemberProfileEditFields>(key: K, value: MemberProfileEditFields[K]) => {
      setEditFields((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reload = useCallback(async () => {
    if (skipLoad) {
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
        setEditFields(editFieldsFromMember(data.member));
      }
    } finally {
      setLoading(false);
    }
  }, [code, mode, personId, skipLoad]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const member = bundle?.member ?? null;
  const canEditLocal = mode === "local";

  const relationToMeText = useMemo(() => {
    if (!member) return null;
    const focalId =
      canEditLocal && localAccount.session ? localAccount.session.focalPersonId : null;
    if (focalId && focalId === member.id) return copy.profile.relationToMeSame;
    if (focalId) return computeRelationSummary(focalId, member.id);
    if (canEditLocal) return copy.profile.relationToMeUnavailable;
    return null;
  }, [canEditLocal, localAccount.session, member]);

  const saveEdit = useCallback(() => {
    if (!member) return;
    const errors: FieldErrors = {
      firstName: required(editFields.firstName, "First name"),
      lastName: required(editFields.lastName, "Last name"),
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
        personId: member.id,
        firstName: editFields.firstName,
        lastName: editFields.lastName,
        currentCity: editFields.city || undefined,
        birthDate: editFields.birthDate || undefined,
        birthPlace: editFields.birthPlace || undefined,
        homeTown: editFields.homeTown || undefined,
        occupation: editFields.occupation || undefined,
        bio: editFields.bio || undefined,
      });
      setEditing(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.success.saved);
    } catch (e) {
      showError(e);
    }
  }, [bumpDataRevision, editFields, impactLight, member, mode, reload, showError, showSuccess]);

  const linkSpouseMember = useCallback(
    (spouseId: string) => {
      if (!member) return;
      if (!spouseId) {
        showError(new Error(copy.profile.pickMemberRequired));
        return;
      }
      try {
        linkSpouse(mode, { personId: member.id, spouseId });
        setSpouseOpen(false);
        bumpDataRevision();
        void reload();
        impactLight();
        showSuccess(copy.profile.spouseLinked);
      } catch (e) {
        showError(e);
      }
    },
    [bumpDataRevision, impactLight, member, mode, reload, showError, showSuccess],
  );

  const createSpouseMember = useCallback(
    (payload: {
      firstName: string;
      lastName: string;
      gender: Gender;
      marriageDate?: string;
      nickname?: string;
      birthDate?: string;
      birthPlace?: string;
      deathDate?: string;
    }) => {
      if (!member) return;
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
          relatedPersonId: member.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          gender: payload.gender,
          marriageDate: payload.marriageDate,
          nickname: payload.nickname,
          birthDate: payload.birthDate,
          birthPlace: payload.birthPlace,
          deathDate: payload.deathDate,
        });
        setSpouseOpen(false);
        bumpDataRevision();
        void reload();
        impactLight();
        showSuccess(copy.profile.spouseSaved);
      } catch (e) {
        showError(e);
      }
    },
    [bumpDataRevision, impactLight, member, mode, reload, showError, showSuccess],
  );

  const linkChildMember = useCallback(
    (
      childId: string,
      options?: { relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP" },
    ) => {
      if (!member) return;
      const marriages = unionOptions(mode, member.id);
      const unionId = chUnionId || marriages[0]?.id;
      if (!childId) {
        showError(new Error(copy.profile.pickMemberRequired));
        return;
      }
      try {
        if (unionId) {
          linkChild(mode, {
            unionId,
            childId,
            relationshipType: options?.relationshipType,
          });
        } else {
          linkChildToParent(mode, member.id, childId);
        }
        setChildOpen(false);
        bumpDataRevision();
        void reload();
        impactLight();
        showSuccess(copy.profile.childLinked);
      } catch (e) {
        showError(e);
      }
    },
    [bumpDataRevision, chUnionId, impactLight, member, mode, reload, showError, showSuccess],
  );

  const createChildMember = useCallback(
    (payload: {
      firstName: string;
      lastName: string;
      gender: Gender;
      birthDate?: string;
      nickname?: string;
      birthPlace?: string;
      deathDate?: string;
      relationshipType?: "BIOLOGICAL" | "ADOPTED" | "STEP";
    }) => {
      if (!member) return;
      const marriages = unionOptions(mode, member.id);
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
          parentPersonId: member.id,
          unionId: unionId || undefined,
          firstName: payload.firstName,
          lastName: payload.lastName,
          gender: payload.gender,
          birthDate: payload.birthDate,
          nickname: payload.nickname,
          birthPlace: payload.birthPlace,
          deathDate: payload.deathDate,
          relationshipType: payload.relationshipType,
        });
        setChildOpen(false);
        bumpDataRevision();
        void reload();
        impactLight();
        showSuccess(copy.profile.childSaved);
      } catch (e) {
        showError(e);
      }
    },
    [bumpDataRevision, chUnionId, impactLight, member, mode, reload, showError, showSuccess],
  );

  const applyParentAssignResult = useCallback(
    (result: ReturnType<typeof assignParentSlot>) => {
      if (result.status !== "complete") return;
      setParentStaged(null);
      setParentsOpen(false);
      bumpDataRevision();
      void reload();
      impactLight();
      showSuccess(copy.profile.parentsSaved);
    },
    [bumpDataRevision, impactLight, reload, showSuccess],
  );

  const linkParentMember = useCallback(
    (parentPersonId: string) => {
      if (!member) return;
      if (!parentPersonId) {
        showError(new Error(copy.profile.pickMemberRequired));
        return;
      }
      try {
        const result = assignParentSlot(mode, {
          childId: member.id,
          slot: parentSlot,
          parentPersonId,
          staged: parentStaged,
        });
        applyParentAssignResult(result);
      } catch (e) {
        showError(e);
      }
    },
    [applyParentAssignResult, member, mode, parentSlot, parentStaged, showError],
  );

  const createParentMember = useCallback(
    (payload: {
      firstName: string;
      lastName: string;
      birthDate?: string;
      parentSlot?: ParentSlot;
    }) => {
      if (!member) return;
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
          childId: member.id,
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
    },
    [applyParentAssignResult, member, mode, parentSlot, parentStaged, showError],
  );

  const onSelectParentCouple = useCallback(
    (unionId: string) => {
      if (!member) return;
      try {
        assignParentsToCouple(mode, member.id, unionId);
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
    },
    [bumpDataRevision, impactLight, member, mode, reload, showError, showSuccess],
  );

  const openParentSheet = useCallback(() => {
    if (!bundle) return;
    setParentSlot(defaultParentSlotForOpen(bundle.parents, parentStaged));
    setParentsOpen(true);
  }, [bundle, parentStaged]);

  const dismissCoupleParentsSheet = useCallback(() => {
    setCoupleParentsOpen(false);
    setParentQuery("");
  }, []);

  const openCoupleParentPicker = useCallback(() => {
    setParentsOpen(false);
    setCoupleParentsOpen(true);
  }, []);

  const cancelEdit = useCallback(() => {
    if (member) setEditFields(editFieldsFromMember(member));
    setEditing(false);
  }, [member]);

  const toggleEdit = useCallback(() => {
    if (editing) {
      cancelEdit();
      return;
    }
    setEditing(true);
  }, [cancelEdit, editing]);

  const derived = useMemo(() => {
    if (!bundle || !member) {
      return null;
    }
    const marriageOptions = unionOptions(mode, member.id);
    const activeUnion =
      bundle.unions.find((u) => u.isActive !== false) ?? bundle.unions[0];
    const spouseNameFromUnion =
      activeUnion && activeUnion.partner1Id
        ? activeUnion.partner1Id === member.id
          ? activeUnion.partner2Name
          : activeUnion.partner1Name
        : null;
    const activeUnionId = chUnionId || marriageOptions[0]?.id;
    const activeMarriage = bundle.unions.find((u) => u.id === activeUnionId);
    const childExcludeIds = [
      member.id,
      ...(activeMarriage?.children.map((c) => c.id) ?? []),
    ];
    const parentStepHint = parentStaged
      ? copy.profile.parentStepHint(
          parentStaged.slot === "father"
            ? copy.profile.parentRoleMother.toLowerCase()
            : copy.profile.parentRoleFather.toLowerCase(),
        )
      : null;
    const parentExcludeIds = [member.id, ...(parentStaged ? [parentStaged.parentId] : [])];
    const parentCoupleRows =
      canEditLocal && coupleParentsOpen
        ? parentCouplesForPicker(mode, member.id, parentQuery)
        : [];

    return {
      marriageOptions,
      activeUnion,
      spouseNameFromUnion,
      activeUnionId,
      childExcludeIds,
      parentStepHint,
      parentExcludeIds,
      parentCoupleRows,
      fatherParent: bundle.parents.find((p) => p.gender === "MALE"),
      motherParent: bundle.parents.find((p) => p.gender === "FEMALE"),
      localPeople: canEditLocal ? peopleForPicker(mode) : [],
      lifeStatus: member.deathDate ? "Deceased" : "Living",
      defaultSpouseGender: defaultSpouseGender(member.gender) ?? "MALE",
    };
  }, [
    bundle,
    canEditLocal,
    chUnionId,
    coupleParentsOpen,
    member,
    mode,
    parentQuery,
    parentStaged,
  ]);

  return {
    bundle,
    member,
    loading,
    canEditLocal,
    editing,
    editFields,
    patchEditField,
    fieldErrors,
    relationToMeText,
    derived,
    spouseOpen,
    setSpouseOpen,
    childOpen,
    setChildOpen,
    chUnionId,
    setChUnionId,
    parentsOpen,
    setParentsOpen,
    coupleParentsOpen,
    setCoupleParentsOpen,
    parentSlot,
    setParentSlot,
    parentQuery,
    setParentQuery,
    saveEdit,
    toggleEdit,
    openParentSheet,
    linkSpouseMember,
    createSpouseMember,
    linkChildMember,
    createChildMember,
    linkParentMember,
    createParentMember,
    onSelectParentCouple,
    dismissCoupleParentsSheet,
    openCoupleParentPicker,
  };
}
