import {
  createMemberOnline,
  fetchOnlinePersonByCode,
  fetchOnlineReports,
  type OnlinePersonDetails,
  type OnlineReports,
} from "@/lib/api";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import {
  computeKinshipForPerson,
  getParentsForPerson,
} from "@/lib/kinship/kinshipCore";
import type { ComputedRelations, KinshipPerson } from "@/lib/kinship/types";
import type {
  AddChildInput,
  AddSpouseInput,
  LocalUnionView,
  MemberRecord,
  StorageMode,
  UpdateMemberInput,
} from "@/lib/data/types";
import {
  addLocalChild,
  addLocalSpouse,
  getLocalMemberById,
  listLocalUnionOptions,
  updateLocalMember,
} from "@/lib/db/localRepository.ext";
import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";

export type PersonBundle = {
  member: MemberRecord;
  unions: LocalUnionView[];
  parents: KinshipPerson[];
  computed: ComputedRelations | null;
  onlineDetails?: OnlinePersonDetails;
};

function enrichLocalBundle(member: MemberRecord): PersonBundle {
  const { peopleById, allUnions, unionsAsChildFor } = loadKinshipDataset();
  const unionsAsChild = unionsAsChildFor(member.id);
  const parents = getParentsForPerson(member.id, unionsAsChild, peopleById);
  const computed = computeKinshipForPerson(
    member.id,
    unionsAsChild,
    allUnions,
    peopleById,
  );
  return {
    member,
    unions: getLocalUnionsForPerson(member.id),
    parents,
    computed,
  };
}

function mapOnlinePerson(m: OnlinePersonDetails["person"]): MemberRecord {
  return {
    id: m.id,
    familyCode: m.familyCode,
    firstName: m.firstName,
    lastName: m.lastName,
    nickname: m.nickname,
    urduFirstName: m.urduFirstName,
    urduLastName: m.urduLastName,
    gender: m.gender,
    birthDate: m.birthDate,
    deathDate: m.deathDate,
    birthPlace: (m as { birthPlace?: string | null }).birthPlace ?? null,
    homeTown: (m as { homeTown?: string | null }).homeTown ?? null,
    currentCity: m.currentCity,
    occupation: m.occupation,
    bio: m.bio,
  };
}

function computedFromOnline(details: OnlinePersonDetails): ComputedRelations | null {
  const c = details.computed;
  if (!c) return null;
  const toRel = (
    items: { firstName: string; lastName: string; familyCode: string; id?: string }[],
    label: string,
    side: ComputedRelations["paternalUncles"][0]["side"],
  ) =>
    items.map((p) => ({
      id: p.id ?? p.familyCode,
      familyCode: p.familyCode,
      firstName: p.firstName,
      lastName: p.lastName,
      nickname: null,
      urduFirstName: null,
      urduLastName: null,
      gender: "OTHER" as const,
      birthDate: null,
      deathDate: null,
      currentCity: null,
      birthPlace: null,
      homeTown: null,
      occupation: null,
      bio: null,
      kinshipLabel: label,
      side,
      degree: "unknown" as const,
    }));

  return {
    fullSiblings: toRel(c.fullSiblings ?? [], "Full sibling", "neutral"),
    halfSiblings: toRel(c.halfSiblings ?? [], "Half sibling", "neutral"),
    paternalUncles: toRel(c.paternalUncles ?? [], "Paternal uncle", "paternal"),
    paternalAunts: toRel((c as { paternalAunts?: typeof c.fullSiblings }).paternalAunts ?? [], "Paternal aunt", "paternal"),
    maternalUncles: toRel(c.maternalUncles ?? [], "Maternal uncle", "maternal"),
    maternalAunts: toRel((c as { maternalAunts?: typeof c.fullSiblings }).maternalAunts ?? [], "Maternal aunt", "maternal"),
  };
}

export async function loadPersonById(
  mode: StorageMode,
  personId: string,
): Promise<PersonBundle | null> {
  if (mode !== "local") return null;
  const member = getLocalMemberById(personId);
  if (!member) return null;
  return enrichLocalBundle(member);
}

export async function loadPersonByCode(
  mode: StorageMode,
  familyCode: string,
): Promise<PersonBundle | null> {
  if (mode === "local") {
    const member = getLocalMemberByFamilyCode(familyCode);
    if (!member) return null;
    return enrichLocalBundle(member);
  }
  const data = await fetchOnlinePersonByCode(familyCode);
  if (!data) return null;
  const member = mapOnlinePerson(data.person);
  const parents: KinshipPerson[] = [];
  return {
    member,
    unions: data.unions.map((u) => ({
      id: u.id,
      partner1Name: `${u.partner1.firstName} ${u.partner1.lastName}`,
      partner2Name: `${u.partner2.firstName} ${u.partner2.lastName}`,
      children: u.children.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        familyCode: c.familyCode,
      })),
    })),
    parents,
    computed: computedFromOnline(data),
    onlineDetails: data,
  };
}

export function updatePerson(
  mode: StorageMode,
  input: UpdateMemberInput,
): MemberRecord {
  if (mode !== "local") {
    throw new Error("Profile edit on device requires local mode or use web dashboard.");
  }
  return updateLocalMember(input);
}

export function addSpouse(mode: StorageMode, input: AddSpouseInput): MemberRecord {
  if (mode !== "local") {
    throw new Error("Add spouse on device requires local mode for now.");
  }
  return addLocalSpouse(input);
}

export function addChild(mode: StorageMode, input: AddChildInput): MemberRecord {
  if (mode !== "local") {
    throw new Error("Add child on device requires local mode for now.");
  }
  return addLocalChild(input);
}

export function unionOptions(mode: StorageMode, personId: string) {
  if (mode !== "local") return [];
  return listLocalUnionOptions(personId);
}

export async function loadReports(
  mode: StorageMode,
  familyCode: string,
): Promise<OnlineReports | null> {
  if (mode === "online") {
    return fetchOnlineReports(familyCode);
  }
  return null;
}

export { createMemberOnline };
