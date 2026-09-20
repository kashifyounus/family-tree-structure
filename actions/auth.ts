"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  AUTH_COOKIE_NAME,
  serializeAuthSession,
  verifyDemoCredentials,
  type AuthContext,
} from "@/lib/auth";
import { getAuthContext } from "@/lib/auth.server";

export async function getSession(): Promise<AuthContext> {
  return getAuthContext();
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = verifyDemoCredentials(email, password);
  if (!session) {
    return { ok: false, error: "Invalid email or password" };
  }
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, serializeAuthSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  revalidatePath("/", "layout");
}
