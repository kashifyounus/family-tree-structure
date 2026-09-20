import "server-only";

import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  parseAuthCookie,
  type AuthContext,
} from "@/lib/auth";

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = parseAuthCookie(raw);
  if (session) return session;
  return {
    isAuthenticated: false,
    role: "GUEST",
    userId: null,
    displayName: null,
  };
}
