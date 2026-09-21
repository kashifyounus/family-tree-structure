import { fetchMembers, type DashboardMember } from "@/lib/api";
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
    currentCity: m.currentCity,
    occupation: null,
    bio: null,
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
  if (mode !== "local") {
    throw new Error("Create member on device is only available in local SQLite mode.");
  }
  return createLocalMember(input);
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
