import { registerLocalAccount } from "@/lib/localAccount/service";
import { showcaseUser } from "@/lib/mock/kuriosityShowcase";
import type { LocalAccountSession } from "@/lib/localAccount/service";

const KAY_SHOWCASE_PASSWORD = "kuriosity";

/** Registers Kay Hassan as archive owner with a single focal member (Figma preview). */
export async function setupKayShowcaseArchive(): Promise<LocalAccountSession> {
  return registerLocalAccount({
    displayName: showcaseUser.displayName,
    email: showcaseUser.email,
    password: KAY_SHOWCASE_PASSWORD,
    firstName: showcaseUser.firstName,
    lastName: "Hassan",
    gender: "MALE",
  });
}
