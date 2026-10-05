/**
 * Genealogy business process: mutual relationship between two people.
 * Pure rules — callers supply graph paths and human kinship labels.
 */

export type KinshipPathStep = {
  fromId: string;
  toId: string;
  relation: string;
};

export type MutualLinkRow = {
  fromPersonId: string;
  toPersonId: string;
  relation: string;
  linkPhrase: string;
};

export type MutualRelationshipOutcome = {
  ok: boolean;
  message: string;
  personAId: string;
  personBId: string;
  howPersonARelatesToB: string;
  howPersonBRelatesToA: string;
  shortestPathSteps: KinshipPathStep[];
  mutualLinks: MutualLinkRow[];
};

export function kinshipStepLinkPhrase(relation: string): string {
  switch (relation) {
    case "parent":
      return "is parent of";
    case "child":
      return "is child of";
    case "spouse":
      return "is spouse of";
    case "sibling":
      return "is sibling of";
    default:
      return `is related (${relation}) to`;
  }
}

export function buildMutualRelationshipOutcome(input: {
  personAId: string;
  personBId: string;
  labelFromAToB: string;
  labelFromBToA: string;
  shortestPathFromAToB: KinshipPathStep[];
  ok?: boolean;
  message?: string;
}): MutualRelationshipOutcome {
  const {
    personAId,
    personBId,
    labelFromAToB,
    labelFromBToA,
    shortestPathFromAToB,
    ok = true,
    message = "",
  } = input;

  const mutualLinks = shortestPathFromAToB.map((step) => ({
    fromPersonId: step.fromId,
    toPersonId: step.toId,
    relation: step.relation,
    linkPhrase: kinshipStepLinkPhrase(step.relation),
  }));

  return {
    ok,
    message,
    personAId,
    personBId,
    howPersonARelatesToB: labelFromAToB,
    howPersonBRelatesToA: labelFromBToA,
    shortestPathSteps: shortestPathFromAToB,
    mutualLinks,
  };
}
