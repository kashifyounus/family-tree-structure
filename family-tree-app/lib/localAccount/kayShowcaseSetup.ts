import { setupSeededCuratedArchive } from "@/lib/localAccount/seededArchiveSetup";
import type { LocalAccountSession } from "@/lib/localAccount/service";

const KAY_SHOWCASE_PASSWORD = "kuriosity";

/** Hassan–Khan curated sample (fixture) with Kay Hassan as tree focal. */
export async function setupKayShowcaseArchive(): Promise<LocalAccountSession> {
  return setupSeededCuratedArchive({
    displayName: "Kay Hassan",
    email: "kay.hassan@kuriosity.local",
    password: KAY_SHOWCASE_PASSWORD,
  });
}
