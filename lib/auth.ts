import { APP_OWNER, APP_OWNER_EMAIL } from "@/lib/appMeta";

export type UserRole = "GUEST" | "VIEWER" | "CONTRIBUTOR" | "ADMIN";

export type AuthContext = {
  isAuthenticated: boolean;
  role: UserRole;
  userId: string | null;
  displayName: string | null;
};

const AUTH_COOKIE = "kinship_auth";

const DEMO_USERS: Record<
  string,
  { password: string; role: UserRole; userId: string; displayName: string }
> = {
  [APP_OWNER_EMAIL.toLowerCase()]: {
    password: "mughal",
    role: "ADMIN",
    userId: "user-kashif",
    displayName: APP_OWNER,
  },
  "viewer@mughals.local": {
    password: "viewer",
    role: "VIEWER",
    userId: "user-viewer",
    displayName: "Family Viewer",
  },
  "contributor@mughals.local": {
    password: "contributor",
    role: "CONTRIBUTOR",
    userId: "user-contributor",
    displayName: "Family Contributor",
  },
  "viewer@kinship.local": {
    password: "viewer",
    role: "VIEWER",
    userId: "user-viewer",
    displayName: "Family Viewer",
  },
  "contributor@kinship.local": {
    password: "contributor",
    role: "CONTRIBUTOR",
    userId: "user-contributor",
    displayName: "Family Contributor",
  },
  "admin@kinship.local": {
    password: "admin",
    role: "ADMIN",
    userId: "user-admin",
    displayName: "Tree Admin",
  },
};

export const DEMO_AUTH_HINT =
  `Owner: ${APP_OWNER_EMAIL} / mughal · contributor@mughals.local / contributor · viewer@mughals.local / viewer`;

export function parseAuthCookie(value: string | undefined): AuthContext | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as {
      role: UserRole;
      userId: string;
      displayName: string;
    };
    if (!parsed.role || !parsed.userId) return null;
    return {
      isAuthenticated: true,
      role: parsed.role,
      userId: parsed.userId,
      displayName: parsed.displayName ?? null,
    };
  } catch {
    return null;
  }
}

export function verifyDemoCredentials(
  email: string,
  password: string,
): AuthContext | null {
  const entry = DEMO_USERS[email.toLowerCase()];
  if (!entry || entry.password !== password) return null;
  return {
    isAuthenticated: true,
    role: entry.role,
    userId: entry.userId,
    displayName: entry.displayName,
  };
}

export function serializeAuthSession(ctx: AuthContext): string {
  return JSON.stringify({
    role: ctx.role,
    userId: ctx.userId,
    displayName: ctx.displayName,
  });
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;

export function canEditTree(role: UserRole): boolean {
  return role === "CONTRIBUTOR" || role === "ADMIN";
}
