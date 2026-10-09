import {
  filterArchivePeople,
  type ArchiveQuery,
} from "../../../shared/archiveQuery";
import { getDatabase } from "@/lib/db/database";
import type { MemberRecord } from "@/lib/data/types";

function rowToMember(row: {
  id: string;
  family_code: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string | null;
  home_town: string | null;
  current_city: string | null;
  occupation: string | null;
  bio: string | null;
}): MemberRecord {
  return {
    id: row.id,
    familyCode: row.family_code,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname,
    urduFirstName: null,
    urduLastName: null,
    gender: row.gender as MemberRecord["gender"],
    birthDate: row.birth_date,
    deathDate: row.death_date,
    birthPlace: row.birth_place,
    homeTown: row.home_town,
    currentCity: row.current_city,
    occupation: row.occupation,
    biradari: null,
    bio: row.bio,
  };
}

export function listLocalMembersMatching(query: ArchiveQuery): MemberRecord[] {
  const db = getDatabase();
  const rows = db.getAllSync<{
    id: string;
    family_code: string;
    first_name: string;
    last_name: string;
    nickname: string | null;
    gender: string;
    birth_date: string | null;
    death_date: string | null;
    birth_place: string | null;
    home_town: string | null;
    current_city: string | null;
    occupation: string | null;
    bio: string | null;
  }>(
    `SELECT id, family_code, first_name, last_name, nickname, gender,
            birth_date, death_date, birth_place, home_town, current_city, occupation, bio
     FROM persons ORDER BY last_name, first_name`,
  );
  const members = rows.map(rowToMember);
  return filterArchivePeople(members, query);
}
