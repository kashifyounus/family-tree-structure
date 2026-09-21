import {
  parseAuthCookie,
  serializeAuthSession,
  verifyDemoCredentials,
  type AuthContext,
} from "@/lib/auth";

export function authFromAuthorizationHeader(
  header: string | null,
): AuthContext | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    return parseAuthCookie(decoded);
  } catch {
    return parseAuthCookie(token);
  }
}

export function loginMobile(email: string, password: string): string | null {
  const session = verifyDemoCredentials(email, password);
  if (!session) return null;
  return Buffer.from(serializeAuthSession(session), "utf8").toString(
    "base64url",
  );
}

export function requireMobileAuth(header: string | null): AuthContext {
  const ctx = authFromAuthorizationHeader(header);
  if (!ctx?.isAuthenticated) {
    throw new Error("Unauthorized");
  }
  return ctx;
}
