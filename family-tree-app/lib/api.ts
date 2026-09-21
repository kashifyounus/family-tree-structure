import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "mughals_auth_token";

export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    return "http://localhost:3000";
  }
  return url.replace(/\/$/, "");
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string | null): Promise<void> {
  if (!token) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export type LoginResponse =
  | { ok: true; token: string; role: string; displayName: string }
  | { ok: false; error?: string };

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/mobile/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json() as Promise<LoginResponse>;
}

export type DashboardMember = {
  id: string;
  familyCode: string;
  firstName: string;
  lastName: string;
  gender: string;
  currentCity: string | null;
};

export async function fetchMembers(query = ""): Promise<DashboardMember[]> {
  const data = await apiFetch<{ members: DashboardMember[] }>(
    `/api/mobile/members?q=${encodeURIComponent(query)}`,
  );
  return data.members;
}
