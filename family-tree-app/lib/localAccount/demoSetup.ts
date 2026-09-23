import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { getLocalMemberByFamilyCode } from "@/lib/db/localRepository";
import { seedLocalDemoFamily } from "@/lib/db/seedLocalDemo";
import { getDatabase } from "@/lib/db/database";
import type { LocalAccountSession } from "@/lib/localAccount/service";

const SESSION_KEY = "mughals_local_account_id";
const DEMO_EMAIL = "demo@family.local";
const DEMO_PASSWORD = "demo1234";

async function hashPassword(email: string, password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${email.toLowerCase()}::${password}`,
  );
}

/** Loads sample tree and a device account centered on the demo focal member. */
export async function setupDemoArchive(): Promise<LocalAccountSession> {
  const focalCode = seedLocalDemoFamily();
  const focal = getLocalMemberByFamilyCode(focalCode);
  if (!focal) {
    throw new Error("Demo family could not be loaded.");
  }

  const db = getDatabase();
  db.runSync("DELETE FROM local_accounts");

  const id = globalThis.crypto?.randomUUID?.() ?? `demo-acct-${Date.now()}`;
  const passwordHash = await hashPassword(DEMO_EMAIL, DEMO_PASSWORD);
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO local_accounts (
      id, display_name, email, password_hash, focal_person_id, focal_family_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      "Demo family",
      DEMO_EMAIL,
      passwordHash,
      focal.id,
      focal.familyCode,
      now,
    ],
  );

  const session: LocalAccountSession = {
    id,
    displayName: "Demo family",
    email: DEMO_EMAIL,
    focalPersonId: focal.id,
    focalFamilyCode: focal.familyCode,
  };
  await SecureStore.setItemAsync(SESSION_KEY, session.id);
  return session;
}
