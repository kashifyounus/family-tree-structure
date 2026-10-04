import { setupSeededCuratedArchive } from "@/lib/localAccount/seededArchiveSetup";
import type { LocalAccountSession } from "@/lib/localAccount/service";

const DEMO_EMAIL = "demo@family.local";
const DEMO_PASSWORD = "demo1234";

/** Loads curated sample tree and a device account centered on Kay Hassan. */
export async function setupDemoArchive(): Promise<LocalAccountSession> {
  return setupSeededCuratedArchive({
    displayName: "Demo family",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
}
