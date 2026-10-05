import { loadKinshipDataset } from "@/lib/db/kinshipLoader";
import {
  computeRelationFinderResult,
  type KinshipStep,
} from "@/lib/kinship/relationPaths";
import {
  buildMutualRelationshipOutcome,
  type MutualRelationshipOutcome,
} from "../../../shared/genealogy/mutualRelationship";

/**
 * Business process: describe how two archive members relate to each other (both directions).
 */
export function runMutualRelationshipProcess(
  personAId: string,
  personBId: string,
): MutualRelationshipOutcome {
  const { peopleById } = loadKinshipDataset();
  const personA = peopleById.get(personAId);
  const personB = peopleById.get(personBId);

  if (!personA || !personB) {
    return buildMutualRelationshipOutcome({
      personAId,
      personBId,
      labelFromAToB: "",
      labelFromBToA: "",
      shortestPathFromAToB: [],
      ok: false,
      message: "We could not find both people in your private archive.",
    });
  }

  if (personA.id === personB.id) {
    return buildMutualRelationshipOutcome({
      personAId,
      personBId,
      labelFromAToB: "Same person",
      labelFromBToA: "Same person",
      shortestPathFromAToB: [],
      ok: true,
      message: "Same person",
    });
  }

  const aToB = computeRelationFinderResult(personAId, personBId);
  const bToA = computeRelationFinderResult(personBId, personAId);

  if (!aToB.ok || aToB.paths.length === 0) {
    return buildMutualRelationshipOutcome({
      personAId,
      personBId,
      labelFromAToB: "",
      labelFromBToA: bToA.summaries[0] ?? "",
      shortestPathFromAToB: [],
      ok: false,
      message: aToB.message || "No relationship found in this archive.",
    });
  }

  const shortest: KinshipStep[] = aToB.paths[0] ?? [];
  const labelAToB = aToB.summaries[0] ?? aToB.message;
  const labelBToA = bToA.summaries[0] ?? bToA.message;

  return buildMutualRelationshipOutcome({
    personAId,
    personBId,
    labelFromAToB: labelAToB,
    labelFromBToA: labelBToA,
    shortestPathFromAToB: shortest,
    ok: true,
    message: aToB.message,
  });
}
