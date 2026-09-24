import { createMemberOnline, fetchMembers, type DashboardMember } from "@/lib/api";
import {
  createLocalMember,
  deleteLocalMember,
  listLocalMembers,
} from "@/lib/db/localRepository";
import type { CreateMemberInput, MemberRecord, StorageMode } from "@/lib/data/types";

function fromDashboard(m: DashboardMember): MemberRecord {
  return {
    id: m.id,
    familyCode: m.familyCode,
    firstName: m.firstName,
    lastName: m.lastName,
    nickname: null,
    urduFirstName: null,
    urduLastName: null,
    gender: m.gender as MemberRecord["gender"],
    birthDate: null,
    deathDate: null,
    birthPlace: null,
    homeTown: null,
    currentCity: m.currentCity,
    occupation: null,
    bio: null,
    fatherName: m.fatherName ?? null,
    motherName: m.motherName ?? null,
  };
}

export async function listMembers(
  mode: StorageMode,
  query = "",
): Promise<MemberRecord[]> {
  if (mode === "local") {
    return listLocalMembers(query);
  }
  const remote = await fetchMembers(query);
  return remote.map(fromDashboard);
}

export async function createMember(
  mode: StorageMode,
  input: CreateMemberInput,
): Promise<MemberRecord> {
  if (mode === "local") {
    return createLocalMember(input);
  }
  const created = await createMemberOnline(input);
  const list = await fetchMembers(created.familyCode);
  const found = list.find((m) => m.familyCode === created.familyCode);
  if (!found) {
    throw new Error("Member created but could not refresh list");
  }
  return fromDashboard(found);
}

export async function removeMember(
  mode: StorageMode,
  personId: string,
): Promise<void> {
  if (mode !== "local") {
    throw new Error("Delete on device is only available in local SQLite mode.");
  }
  deleteLocalMember(personId);
}
