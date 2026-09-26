import { getDatabase } from "@/lib/db/database";
import type { LocalReports } from "@/lib/data/types";

function ageFromBirth(birth: string | null, death: string | null): number | null {
  if (!birth) return null;
  const end = death ? new Date(death) : new Date();
  const b = new Date(birth);
  let age = end.getFullYear() - b.getFullYear();
  const m = end.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < b.getDate())) age--;
  return age;
}

export function buildLocalReports(): LocalReports {
  const db = getDatabase();
  const persons = db.getAllSync<{
    gender: string | null;
    birth_date: string | null;
    death_date: string | null;
    current_city: string | null;
  }>("SELECT gender, birth_date, death_date, current_city FROM persons");

  const unions = db.getAllSync<{
    partner_1_id: string;
    partner_2_id: string;
    divorce_date: string | null;
  }>("SELECT partner_1_id, partner_2_id, divorce_date FROM unions");

  const cities = new Map<string, number>();
  const ages = new Map<string, number>([
    ["0–17", 0],
    ["18–35", 0],
    ["36–55", 0],
    ["56+", 0],
    ["Unknown", 0],
  ]);

  let living = 0;
  let male = 0;
  let female = 0;
  for (const p of persons) {
    if (!p.death_date) living++;
    if (p.gender === "MALE") male++;
    else if (p.gender === "FEMALE") female++;
    const city = p.current_city?.trim() || "Unknown";
    cities.set(city, (cities.get(city) ?? 0) + 1);
    const age = ageFromBirth(p.birth_date, p.death_date);
    if (age == null) ages.set("Unknown", (ages.get("Unknown") ?? 0) + 1);
    else if (age <= 17) ages.set("0–17", (ages.get("0–17") ?? 0) + 1);
    else if (age <= 35) ages.set("18–35", (ages.get("18–35") ?? 0) + 1);
    else if (age <= 55) ages.set("36–55", (ages.get("36–55") ?? 0) + 1);
    else ages.set("56+", (ages.get("56+") ?? 0) + 1);
  }

  const marriedIds = new Set<string>();
  let divorces = 0;
  for (const u of unions) {
    marriedIds.add(u.partner_1_id);
    marriedIds.add(u.partner_2_id);
    if (u.divorce_date?.trim()) divorces++;
  }

  return {
    memberCount: persons.length,
    livingCount: living,
    marriedCount: marriedIds.size,
    divorceCount: divorces,
    maleCount: male,
    femaleCount: female,
    cities: [...cities.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
    ages: [...ages.entries()].map(([label, count]) => ({ label, count })),
  };
}
