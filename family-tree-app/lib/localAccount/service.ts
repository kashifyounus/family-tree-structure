import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";

import { copy } from "@/content/businessCopy";
import { AppError } from "@/lib/errors/AppError";
import { createLocalMember } from "@/lib/db/localRepository";
import { getDatabase } from "@/lib/db/database";
import type { Gender } from "@/lib/data/types";

const SESSION_KEY = "mughals_local_account_id";

const registerSchema = z.object({
  displayName: z.string().min(2, "Enter your display name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
});

export type LocalAccountSession = {
  id: string;
  displayName: string;
  email: string;
  focalPersonId: string;
  focalFamilyCode: string;
};

type AccountRow = {
  id: string;
  display_name: string;
  email: string;
  password_hash: string;
  focal_person_id: string;
  focal_family_code: string;
};

async function hashPassword(email: string, password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${email.toLowerCase()}::${password}`,
  );
}

function mapRow(row: AccountRow): LocalAccountSession {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    focalPersonId: row.focal_person_id,
    focalFamilyCode: row.focal_family_code,
  };
}

export function getLocalAccountCount(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM local_accounts",
  );
  return row?.count ?? 0;
}

export async function registerLocalAccount(
  input: z.infer<typeof registerSchema>,
): Promise<LocalAccountSession> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION",
      parsed.error.issues[0]?.message ?? copy.errors.validation,
    );
  }
  const data = parsed.data;
  const db = getDatabase();

  const existing = db.getFirstSync<{ id: string }>(
    "SELECT id FROM local_accounts WHERE email = ? COLLATE NOCASE",
    [data.email.trim()],
  );
  if (existing) {
    throw new AppError("VALIDATION", copy.errors.duplicateEmail);
  }

  const focal = createLocalMember({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    gender: data.gender as Gender,
  });

  const id = globalThis.crypto?.randomUUID?.() ?? `acct-${Date.now()}`;
  const passwordHash = await hashPassword(data.email, data.password);
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO local_accounts (
      id, display_name, email, password_hash, focal_person_id, focal_family_code, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.displayName.trim(),
      data.email.trim().toLowerCase(),
      passwordHash,
      focal.id,
      focal.familyCode,
      now,
    ],
  );

  const inserted = db.getFirstSync<AccountRow>(
    "SELECT * FROM local_accounts WHERE id = ?",
    [id],
  );
  if (!inserted) {
    throw new AppError("STORAGE", copy.errors.storage);
  }
  const session = mapRow(inserted);
  await SecureStore.setItemAsync(SESSION_KEY, session.id);
  return session;
}

export async function signInLocalAccount(
  email: string,
  password: string,
): Promise<LocalAccountSession> {
  const db = getDatabase();
  const row = db.getFirstSync<AccountRow>(
    "SELECT * FROM local_accounts WHERE email = ? COLLATE NOCASE",
    [email.trim()],
  );
  if (!row) {
    throw new AppError("AUTH", copy.errors.memberMissing);
  }
  const hash = await hashPassword(email, password);
  if (hash !== row.password_hash) {
    throw new AppError("AUTH", copy.errors.wrongPassword);
  }
  const session = mapRow(row);
  await SecureStore.setItemAsync(SESSION_KEY, session.id);
  return session;
}

export async function loadLocalAccountSession(): Promise<LocalAccountSession | null> {
  const id = await SecureStore.getItemAsync(SESSION_KEY);
  if (!id) return null;
  const db = getDatabase();
  const row = db.getFirstSync<AccountRow>("SELECT * FROM local_accounts WHERE id = ?", [
    id,
  ]);
  if (!row) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
  return mapRow(row);
}

export async function signOutLocalAccount(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
