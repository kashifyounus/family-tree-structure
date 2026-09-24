import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import {
  type MobilePersonDetails,
  normalizeMobilePersonDetails,
} from "@/lib/api/mobilePersonDetails";
import { normalizeApiBaseUrl } from "@/lib/apiUrl";

const TOKEN_KEY = "mughals_auth_token";
const API_URL_KEY = "mughals_api_base_url";

let apiUrlOverride: string | null = null;

export async function loadApiUrlOverride(): Promise<string | null> {
  apiUrlOverride = await AsyncStorage.getItem(API_URL_KEY);
  return apiUrlOverride;
}

export async function saveApiUrlOverride(url: string): Promise<void> {
  const normalized = normalizeApiBaseUrl(url);
  apiUrlOverride = normalized;
  await AsyncStorage.setItem(API_URL_KEY, normalized);
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
  fatherName?: string | null;
  motherName?: string | null;
};

export async function fetchMembers(query = ""): Promise<DashboardMember[]> {
  const data = await apiFetch<{ members: DashboardMember[] }>(
    `/api/mobile/members?q=${encodeURIComponent(query)}`,
  );
  return data.members;
}

/** @deprecated Use `MobilePersonDetails` from `@/lib/api/mobilePersonDetails`. */
export type OnlinePersonDetails = MobilePersonDetails;

export async function fetchOnlinePersonByCode(
  familyCode: string,
): Promise<MobilePersonDetails | null> {
  try {
    const data = await apiFetch<{ details: MobilePersonDetails }>(
      `/api/mobile/person/by-code/${encodeURIComponent(familyCode)}`,
    );
    return normalizeMobilePersonDetails(data.details);
  } catch {
    return null;
  }
}

export async function fetchOnlinePersonById(
  personId: string,
): Promise<MobilePersonDetails | null> {
  try {
    const data = await apiFetch<{ details: MobilePersonDetails }>(
      `/api/mobile/person/${encodeURIComponent(personId)}`,
    );
    return normalizeMobilePersonDetails(data.details);
  } catch {
    return null;
  }
}

export type OnlineReports = {
  city: { currentCity: { label: string; count: number }[] } | null;
  ages: { range: string; count: number }[];
  household: {
    husbandName?: string;
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
  focalUnionId?: string | null;
  focalUnionIds?: string[];
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
        urduFirstName?: string | null;
        urduLastName?: string | null;
        gender: string;
        birthDate: string | null;
        deathDate: string | null;
        currentCity: string | null;
        isLiving: boolean;
        treeDisplayIsPrivate?: boolean;
      };
      isFocal?: boolean;
      hasUnexpandedParents?: boolean;
      hasUnexpandedChildren?: boolean;
      hasUnexpandedSiblings?: boolean;
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type: "spouse" | "parent" | "child";
    label?: string;
  }[];
};

export type FetchFamilyGraphOptions = {
  depth?: number;
  siblingSteps?: number;
  focalUnionId?: string | null;
};

export async function fetchFamilyGraph(
  familyCode: string,
  options: FetchFamilyGraphOptions = {},
): Promise<MobileFamilyGraph | null> {
  const depth = options.depth ?? 2;
  const siblingSteps = options.siblingSteps ?? 0;
  const qs = new URLSearchParams({
    depth: String(depth),
    siblingSteps: String(siblingSteps),
  });
  if (options.focalUnionId) {
    qs.set("focalUnionId", options.focalUnionId);
  }
  try {
    const data = await apiFetch<{ graph: MobileFamilyGraph }>(
      `/api/mobile/graph/${encodeURIComponent(familyCode)}?${qs.toString()}`,
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
