import { getDatabase } from "@/lib/db/database";
import type { Gender, MemberRecord } from "@/lib/data/types";
import type {
  ChildUnionContext,
  KinshipPerson,
  KinshipUnionRecord,
} from "@/lib/kinship/types";

type PersonRow = {
  id: string;
  family_code: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  urdu_first_name: string | null;
  urdu_last_name: string | null;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  current_city: string | null;
  birth_place: string | null;
  home_town: string | null;
  occupation: string | null;
  bio: string | null;
};

export function rowToKinshipPerson(row: PersonRow): KinshipPerson {
  return {
    id: row.id,
    familyCode: row.family_code,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname,
    urduFirstName: row.urdu_first_name,
    urduLastName: row.urdu_last_name,
    gender: row.gender as Gender,
    birthDate: row.birth_date,
    deathDate: row.death_date,
    currentCity: row.current_city,
    birthPlace: row.birth_place,
    homeTown: row.home_town,
    occupation: row.occupation,
    bio: row.bio,
  };
}

export function rowToMember(row: PersonRow): MemberRecord {
  return {
    id: row.id,
    familyCode: row.family_code,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname,
    urduFirstName: row.urdu_first_name,
    urduLastName: row.urdu_last_name,
    gender: row.gender as Gender,
    birthDate: row.birth_date,
    deathDate: row.death_date,
    currentCity: row.current_city,
    birthPlace: row.birth_place,
    homeTown: row.home_town,
    occupation: row.occupation,
    bio: row.bio,
  };
}

export type KinshipDataset = {
  peopleById: Map<string, KinshipPerson>;
  allUnions: KinshipUnionRecord[];
  unionsAsChildFor: (personId: string) => ChildUnionContext[];
};

export function loadKinshipDataset(): KinshipDataset {
  const db = getDatabase();
  const personRows = db.getAllSync<PersonRow>("SELECT * FROM persons");
  const peopleById = new Map(
    personRows.map((r) => [r.id, rowToKinshipPerson(r)]),
  );

  const unionRows = db.getAllSync<{
    id: string;
    partner_1_id: string;
    partner_2_id: string;
  }>("SELECT id, partner_1_id, partner_2_id FROM unions");

  const childRows = db.getAllSync<{
    union_id: string;
    child_id: string;
    relationship_type: string;
  }>("SELECT union_id, child_id, relationship_type FROM children");

  const allUnions: KinshipUnionRecord[] = unionRows
    .map((u) => {
      const p1 = peopleById.get(u.partner_1_id);
      const p2 = peopleById.get(u.partner_2_id);
      if (!p1 || !p2) return null;
      const childships = childRows
        .filter((c) => c.union_id === u.id)
        .map((c) => {
          const child = peopleById.get(c.child_id);
          if (!child) return null;
          return {
            childId: c.child_id,
            child,
            relationshipType: c.relationship_type,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      return {
        id: u.id,
        partner1Id: u.partner_1_id,
        partner2Id: u.partner_2_id,
        partner1: p1,
        partner2: p2,
        childships,
      };
    })
    .filter((x): x is KinshipUnionRecord => x !== null);

  const unionsAsChildFor = (personId: string): ChildUnionContext[] =>
    allUnions
      .filter((u) => u.childships.some((c) => c.childId === personId))
      .map((u) => {
        const childship = u.childships.find((c) => c.childId === personId);
        return {
        unionId: u.id,
        relationshipType: childship?.relationshipType ?? "BIOLOGICAL",
        union: {
          id: u.id,
          partner1Id: u.partner1Id,
          partner2Id: u.partner2Id,
          partner1: u.partner1,
          partner2: u.partner2,
          children: u.childships.map((c) => ({
            childId: c.childId,
            child: c.child,
          })),
        },
      };
      });

  return { peopleById, allUnions, unionsAsChildFor };
}
