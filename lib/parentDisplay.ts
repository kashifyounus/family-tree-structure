import type { Gender } from "@prisma/client";

export type ParentNames = {
  fatherName: string | null;
  motherName: string | null;
};

type PartnerLike = {
  firstName: string;
  lastName: string;
  gender: Gender;
};

/** Derive father/mother display names from a marriage union's partners. */
export function parentNamesFromUnionPartners(
  partners: PartnerLike[],
): ParentNames {
  let fatherName: string | null = null;
  let motherName: string | null = null;
  for (const p of partners) {
    const name = `${p.firstName} ${p.lastName}`.trim();
    if (p.gender === "MALE" && !fatherName) fatherName = name;
    else if (p.gender === "FEMALE" && !motherName) motherName = name;
    else if (!fatherName) fatherName = name;
    else if (!motherName) motherName = name;
  }
  return { fatherName, motherName };
}
