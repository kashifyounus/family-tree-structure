import {
  createMemberOnline,
  fetchOnlinePersonByCode,
  fetchOnlineReports,
  type OnlinePersonDetails,
  type OnlineReports,
} from "@/lib/api";
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
  onlineDetails?: OnlinePersonDetails;
};

export async function loadPersonById(
  mode: StorageMode,
  personId: string,
): Promise<PersonBundle | null> {
  if (mode !== "local") return null;
  const member = getLocalMemberById(personId);
  if (!member) return null;
  return { member, unions: getLocalUnionsForPerson(member.id) };
}

export async function loadPersonByCode(
  mode: StorageMode,
  familyCode: string,
): Promise<PersonBundle | null> {
  if (mode === "local") {
    const member = getLocalMemberByFamilyCode(familyCode);
    if (!member) return null;
    return {
      member,
      unions: getLocalUnionsForPerson(member.id),
    };
  }
  const data = await fetchOnlinePersonByCode(familyCode);
  if (!data) return null;
  const m = data.person;
  return {
    member: {
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
      currentCity: m.currentCity,
      occupation: m.occupation,
      bio: m.bio,
    },
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

