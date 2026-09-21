import { expect, test } from "@playwright/test";

const FOCAL_CODE = "FAM-10004";

test.describe("Mughal's Family Tree E2E", () => {
  test("tree page loads and drawer shows English, Urdu, and geography", async ({
    page,
  }) => {
    await page.goto(`/tree/${FOCAL_CODE}`);
    await expect(page.getByTestId("person-drawer")).toBeVisible();
    await expect(page.getByTestId("person-drawer-title")).toContainText(
      "Hassan",
    );
    await expect(page.getByTestId("person-urdu-name")).toBeVisible();
    await expect(page.getByTestId("geography-section")).toBeVisible();
  });

  test("search finds member by English name, Urdu, and family code", async ({
    page,
  }) => {
    await page.goto(`/tree/${FOCAL_CODE}`);
    const search = page.getByTestId("member-search");
    await search.fill("Hassan");
    await expect(page.getByRole("option").first()).toBeVisible();
    await search.clear();
    await search.fill("حسن");
    await expect(page.getByRole("option").first()).toBeVisible({ timeout: 5000 });
    await search.clear();
    await search.fill(FOCAL_CODE);
    await expect(page.getByText(FOCAL_CODE).first()).toBeVisible();
  });

  test("reports dashboard renders chart surfaces", async ({ page }) => {
    await page.goto(`/tree/${FOCAL_CODE}/reports`);
    await expect(page.getByRole("heading", { name: "Family reports" })).toBeVisible();
    await expect(page.getByTestId("reports-dashboard")).toBeVisible();
    await expect(page.locator(".recharts-wrapper").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("contributor sign-in reveals mutation actions in drawer", async ({
    page,
    context,
  }) => {
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
    await page.goto(`/tree/${FOCAL_CODE}`);
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(page.getByTestId("person-drawer")).toBeVisible();
    await expect(page.getByTestId("add-spouse-btn")).toBeVisible();
    await expect(page.getByTestId("add-child-btn")).toBeVisible();
  });

});
