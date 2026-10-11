import { listLocalMembers } from "@/lib/db/localRepository";
import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import { listIsolatedArchiveMemberIds } from "../../../shared/genealogy/isolatedArchiveMembers";

export type IsolatedMemberRow = {
  id: string;
  familyCode: string;
  displayName: string;
};

export function buildIsolatedMembersReport(): IsolatedMemberRow[] {
  const { peopleById, allUnions } = loadKinshipDataset();
  const people = [...peopleById.values()].map((p) => ({
    id: p.id,
    familyCode: p.familyCode,
    firstName: p.firstName,
    lastName: p.lastName,
  }));
  const unions = allUnions.map((u) => ({
    partner1Id: u.partner1Id,
    partner2Id: u.partner2Id,
    childships: u.childships.map((c) => ({ childId: c.childId })),
  }));
  const ids = listIsolatedArchiveMemberIds(people, unions);
  const members = listLocalMembers();
  const byId = new Map(members.map((m) => [m.id, m]));
  return ids.map((id) => {
    const m = byId.get(id);
    const p = peopleById.get(id);
    const name = m
      ? `${m.firstName} ${m.lastName}`.trim()
      : `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim();
    return {
      id,
      familyCode: m?.familyCode ?? p?.familyCode ?? "",
      displayName: name || id,
    };
  });
}
