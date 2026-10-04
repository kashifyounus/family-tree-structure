import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { seedCuratedPedigreeFixture } from "@/lib/db/comprehensiveSeed";
import { getLocalMemberByFamilyCode } from "@/lib/db/localRepository";
import { getDatabase } from "@/lib/db/database";
import type { LocalAccountSession } from "@/lib/localAccount/service";

const SESSION_KEY = "mughals_local_account_id";

async function hashPassword(email: string, password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${email.toLowerCase()}::${password}`,
  );
}

export type SeededArchiveOptions = {
  displayName: string;
  email: string;
  password: string;
};

/** Imports curated fixture tree and binds a device account to Kay Hassan (focal). */
export async function setupSeededCuratedArchive(
  options: SeededArchiveOptions,
): Promise<LocalAccountSession> {
  const seeded = seedCuratedPedigreeFixture();
  const focal = getLocalMemberByFamilyCode(seeded.focalFamilyCode);
  if (!focal) {
    throw new Error("Sample family could not be loaded.");
  }

  const db = getDatabase();
  db.runSync("DELETE FROM local_accounts");

  const id = globalThis.crypto?.randomUUID?.() ?? `seed-acct-${Date.now()}`;
  const passwordHash = await hashPassword(options.email, options.password);
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO local_accounts (
      id, display_name, email, password_hash, focal_person_id, focal_family_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      options.displayName,
      options.email.trim().toLowerCase(),
      passwordHash,
      focal.id,
      focal.familyCode,
      now,
    ],
  );

  const session: LocalAccountSession = {
    id,
    displayName: options.displayName,
    email: options.email.trim().toLowerCase(),
    focalPersonId: focal.id,
    focalFamilyCode: focal.familyCode,
  };
  await SecureStore.setItemAsync(SESSION_KEY, session.id);
  return session;
}
