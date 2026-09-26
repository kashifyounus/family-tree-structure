import {
  createMemberOnline,
  fetchOnlinePersonByCode,
  fetchOnlinePersonById,
  fetchOnlineReports,
  type OnlineReports,
} from "@/lib/api";
import type { MobilePersonDetails } from "@/lib/api/mobilePersonDetails";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import {
  computeKinshipForPerson,
  getParentsForPerson,
} from "@/lib/kinship/kinshipCore";
import type { ComputedRelations, KinshipPerson } from "@/lib/kinship/types";
import { mapOnlineDetailsToBundle } from "@/lib/data/onlinePersonMapper";
import { copy } from "@/content/businessCopy";
import { AppError } from "@/lib/errors/AppError";
import type {
  AddChildInput,
  AddSpouseInput,
  LinkChildInput,
  LinkSpouseInput,
  LocalUnionView,
  MemberRecord,
  SetParentsInput,
  StorageMode,
  UpdateMarriageInput,
  UpdateMemberInput,
} from "@/lib/data/types";
import {
  addLocalChild,
  addLocalSpouse,
  getLocalMarriage,
  getLocalMemberById,
  linkLocalChild,
  linkLocalSpouse,
  listLocalPeopleBrief,
  listLocalUnionOptions,
  assignLocalPersonToCouple,
  setLocalParents,
  updateLocalMarriage,
  updateLocalMember,
} from "@/lib/db/localRepository.ext";
import {
  listParentCoupleRows,
  type ParentCoupleFilters,
  type ParentCoupleRow,
} from "@/lib/db/parentCouples";
import {
  getLocalMemberByFamilyCode,
  getLocalUnionsForPerson,
} from "@/lib/db/localRepository";

export type PersonBundle = {
  member: MemberRecord;
  unions: LocalUnionView[];
  parents: KinshipPerson[];
  computed: ComputedRelations | null;
  onlineDetails?: MobilePersonDetails;
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

async function loadOnlinePersonBundle(
  fetchDetails: () => Promise<MobilePersonDetails | null>,
): Promise<PersonBundle | null> {
  const data = await fetchDetails();
  if (!data) return null;
  return mapOnlineDetailsToBundle(data);
}

export async function loadPersonById(
  mode: StorageMode,
  personId: string,
): Promise<PersonBundle | null> {
  if (mode === "local") {
    const member = getLocalMemberById(personId);
    if (!member) return null;
    return enrichLocalBundle(member);
  }
  return loadOnlinePersonBundle(() => fetchOnlinePersonById(personId));
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
  return loadOnlinePersonBundle(() => fetchOnlinePersonByCode(familyCode));
}

function requireLocal(mode: StorageMode): void {
  if (mode !== "local") {
    throw new AppError("PERMISSION", copy.profile.cloudReadOnly);
  }
}

export function updatePerson(
  mode: StorageMode,
  input: UpdateMemberInput,
): MemberRecord {
  requireLocal(mode);
  return updateLocalMember(input);
}

export function addSpouse(mode: StorageMode, input: AddSpouseInput): MemberRecord {
  requireLocal(mode);
  return addLocalSpouse(input);
}

export function addChild(mode: StorageMode, input: AddChildInput): MemberRecord {
  requireLocal(mode);
  return addLocalChild(input);
}

export function linkSpouse(mode: StorageMode, input: LinkSpouseInput): { unionId: string } {
  requireLocal(mode);
  return linkLocalSpouse(input);
}

export function linkChild(mode: StorageMode, input: LinkChildInput): void {
  requireLocal(mode);
  linkLocalChild(input);
}

export function assignParents(mode: StorageMode, input: SetParentsInput): { unionId: string } {
  requireLocal(mode);
  return setLocalParents(input);
}

export {
  assignParentSlot,
  createAndAssignParentSlot,
  type AssignParentSlotResult,
} from "@/lib/data/parentAssignService";

export function assignParentsToCouple(
  mode: StorageMode,
  personId: string,
  unionId: string,
): { unionId: string } {
  requireLocal(mode);
  return assignLocalPersonToCouple(personId, unionId);
}

export function parentCouplesForPicker(
  mode: StorageMode,
  personId: string,
  query: string,
  filters?: ParentCoupleFilters,
): ParentCoupleRow[] {
  requireLocal(mode);
  return listParentCoupleRows(query, personId, filters);
}

export function saveMarriage(mode: StorageMode, input: UpdateMarriageInput): void {
  requireLocal(mode);
  updateLocalMarriage(input);
}

export function loadMarriage(mode: StorageMode, unionId: string) {
  requireLocal(mode);
  return getLocalMarriage(unionId);
}

export function peopleForPicker(mode: StorageMode) {
  requireLocal(mode);
  return listLocalPeopleBrief();
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
