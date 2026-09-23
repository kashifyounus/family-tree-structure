import type { BrowserContext } from "@playwright/test";

export async function signInAsContributor(context: BrowserContext) {
  await context.addCookies([
    {
      name: "kinship_auth",
      value: JSON.stringify({
        role: "CONTRIBUTOR",
        userId: "user-contributor",
        displayName: "Family Contributor",
      }),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
