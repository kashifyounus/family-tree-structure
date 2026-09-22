import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "mughals_auth_token";
const API_URL_KEY = "mughals_api_base_url";

let apiUrlOverride: string | null = null;

export async function loadApiUrlOverride(): Promise<string | null> {
  apiUrlOverride = await AsyncStorage.getItem(API_URL_KEY);
  return apiUrlOverride;
}

export async function saveApiUrlOverride(url: string): Promise<void> {
  apiUrlOverride = url;
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export function getApiBaseUrl(): string {
  if (apiUrlOverride) {
    return apiUrlOverride.replace(/\/$/, "");
  }
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

export type OnlinePersonSummary = {
  id: string;
  familyCode: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  urduFirstName: string | null;
  urduLastName: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthDate: string | null;
  deathDate: string | null;
  currentCity: string | null;
  occupation: string | null;
  bio: string | null;
  isLiving: boolean;
  age: number | null;
};

export type OnlinePersonDetails = {
  person: OnlinePersonSummary;
  unions: {
    id: string;
    partner1: OnlinePersonSummary;
    partner2: OnlinePersonSummary;
    children: (OnlinePersonSummary & { relationshipType?: string })[];
  }[];
  computed?: {
    fullSiblings: { firstName: string; lastName: string; familyCode: string }[];
    halfSiblings: { firstName: string; lastName: string; familyCode: string }[];
    paternalUncles?: { firstName: string; lastName: string; familyCode: string }[];
    maternalUncles?: { firstName: string; lastName: string; familyCode: string }[];
  };
};

export async function fetchOnlinePersonByCode(
  familyCode: string,
): Promise<OnlinePersonDetails | null> {
  try {
    const data = await apiFetch<{ details: OnlinePersonDetails }>(
      `/api/mobile/person/by-code/${encodeURIComponent(familyCode)}`,
    );
    return data.details;
  } catch {
    return null;
  }
}

export type OnlineReports = {
  city: { currentCity: { label: string; count: number }[] } | null;
  ages: { range: string; count: number }[];
  household: {
    wifeCount: number;
    totalChildren: number;
    byWife: { wifeName: string; childrenCount: number }[];
  } | null;
  focalFamilyCode: string;
};

export async function fetchOnlineReports(
  familyCode: string,
): Promise<OnlineReports | null> {
  try {
    return await apiFetch<OnlineReports>(
      `/api/mobile/reports/${encodeURIComponent(familyCode)}`,
    );
  } catch {
    return null;
  }
}

export type MobileFamilyGraph = {
  focalPersonId: string;
  nodes: {
    id: string;
    type: "person";
    position: { x: number; y: number };
    data: {
      person: {
        id: string;
        familyCode: string;
        firstName: string;
        lastName: string;
        gender: string;
        birthDate: string | null;
        deathDate: string | null;
        currentCity: string | null;
        isLiving: boolean;
      };
      isFocal?: boolean;
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: "spouse" | "parent" | "child";
  }[];
};

export async function fetchFamilyGraph(
  familyCode: string,
): Promise<MobileFamilyGraph | null> {
  try {
    const data = await apiFetch<{ graph: MobileFamilyGraph }>(
      `/api/mobile/graph/${encodeURIComponent(familyCode)}`,
    );
    return data.graph;
  } catch {
    return null;
  }
}

export async function createMemberOnline(input: {
  firstName: string;
  lastName: string;
  gender: string;
  urduFirstName?: string;
  urduLastName?: string;
  currentCity?: string;
  occupation?: string;
  bio?: string;
}): Promise<{ familyCode: string }> {
  const data = await apiFetch<{ familyCode: string; personId?: string }>(
    "/api/mobile/members/create",
    { method: "POST", body: JSON.stringify(input) },
  );
  return { familyCode: data.familyCode };
}
