import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import type { RuleGender, RuleGraph } from "../../../shared/relationshipRules";

export function loadLocalRuleGraphFromKinship(): RuleGraph {
  const { peopleById, allUnions } = loadKinshipDataset();
  return {
    people: [...peopleById.values()].map((p) => ({
      id: p.id,
      gender: p.gender as RuleGender,
      birthDate: p.birthDate,
      deathDate: p.deathDate,
    })),
    unions: allUnions.map((u) => ({
      id: u.id,
      partner1Id: u.partner1Id,
      partner2Id: u.partner2Id,
      marriageDate: u.marriageDate,
      divorceDate: u.divorceDate,
      childIds: u.childships.map((c) => c.childId),
    })),
  };
}
