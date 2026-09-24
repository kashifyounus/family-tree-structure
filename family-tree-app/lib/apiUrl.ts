const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "10.0.2.2"]);

export function normalizeApiBaseUrl(raw: string): string {
  let trimmed = raw.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed.replace(/\/+$/, "");
}

export function validateApiBaseUrl(raw: string): string | null {
  const normalized = normalizeApiBaseUrl(raw);
  if (!normalized) {
    return "Enter your family website address (for example https://family.example.com).";
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Use an http or https address.";
    }
    if (!parsed.hostname) {
      return "Enter a valid website address.";
    }
    return null;
  } catch {
    return "Enter a valid website address.";
  }
}

export function isLikelyLocalDevUrl(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export async function probeMobileApiHealth(
  baseUrl: string,
  timeoutMs = 12_000,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = normalizeApiBaseUrl(baseUrl);
  const validationError = validateApiBaseUrl(normalized);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${normalized}/api/mobile/health`, {
      method: "GET",
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `Server responded with ${res.status}. Check the address and try again.`,
      };
    }
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!body?.ok) {
      return {
        ok: false,
        message: "This site does not look like a Mughal's Family Tree server.",
      };
    }
    return { ok: true };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      message: aborted
        ? "Connection timed out. Check the address, Wi‑Fi, and that the server is running."
        : "Could not reach the server. Check the address and your network.",
    };
  } finally {
    clearTimeout(timer);
  }
}
