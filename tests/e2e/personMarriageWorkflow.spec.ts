import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { signInAsContributor } from "./auth";

const SHOTS = "/opt/cursor/artifacts/e2e/screenshots";

function shot(page: import("@playwright/test").Page, name: string) {
  mkdirSync(SHOTS, { recursive: true });
  return page.screenshot({
    path: join(SHOTS, `${name}.png`),
    fullPage: true,
  });
}

test.describe("Person and marriage administration", () => {
  test.beforeEach(async ({ context }) => {
    await signInAsContributor(context);
  });

  test("complete editor workflow with artifacts", async ({ page }) => {
    test.setTimeout(90_000);
    const unique = `E2E-${Date.now().toString().slice(-6)}`;

    await page.goto("/people/new");
    await expect(page.getByRole("heading", { name: "Create person" })).toBeVisible();
    await shot(page, "01_create_person_form");

    await page.locator("#firstName").fill("Amina");
    await page.locator("#lastName").fill(`Workflow ${unique}`);
    await page.locator("#gender").selectOption("FEMALE");
    await page.locator("#currentCity").fill("Lahore");
    await page.getByRole("button", { name: "Save person" }).click();

    await expect(page.getByText(/Person saved/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /Amina/ })).toBeVisible();
    await shot(page, "02_person_saved");

    await page.getByRole("button", { name: "Add spouse" }).click();
    await expect(page.locator("#spouse-first")).toBeVisible();
    await page.locator("#spouse-first").fill("Omar");
    await page.locator("#spouse-last").fill(`Workflow ${unique}`);
    await page.locator("#spouse-gender").selectOption("MALE");
    await page.getByRole("button", { name: "Save marriage" }).click();

    await expect(page.getByRole("heading", { name: "Current marriages" })).toBeVisible();
    await expect(page.getByText("Omar", { exact: false })).toBeVisible({ timeout: 15_000 });
    await shot(page, "03_marriage_added");

    await page.getByRole("link", { name: "View marriage" }).first().click();
    await expect(page.getByRole("heading", { name: /Amina.*Omar|Omar.*Amina/ })).toBeVisible();
    await shot(page, "04_marriage_record");

    await page.getByRole("button", { name: "Add child" }).click();
    await page.locator("#child-first").fill("Sara");
    await page.locator("#child-last").fill(`Workflow ${unique}`);
    await page.locator("#child-gender").selectOption("FEMALE");
    await page.getByRole("button", { name: "Save child" }).click();
    await expect(page.getByText("Sara")).toBeVisible({ timeout: 10_000 });
    await shot(page, "05_child_on_marriage");

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Family records dashboard" })).toBeVisible();
    await page.getByPlaceholder("Search by name, code, Urdu…").fill("Amina");
    await expect(page.getByText("Amina")).toBeVisible({ timeout: 10_000 });
    await shot(page, "06_dashboard_listing");
  });
});
