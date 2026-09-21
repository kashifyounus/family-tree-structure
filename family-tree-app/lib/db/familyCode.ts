import { getDatabase } from "@/lib/db/database";

export function generateFamilyCode(): string {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `FAM-${digits}`;
}

export function uniqueFamilyCode(): string {
  const db = getDatabase();
  for (let i = 0; i < 12; i++) {
    const code = generateFamilyCode();
    const row = db.getFirstSync<{ family_code: string }>(
      "SELECT family_code FROM persons WHERE family_code = ?",
      [code],
    );
    if (!row) return code;
  }
  throw new Error("Could not generate unique family code");
}
