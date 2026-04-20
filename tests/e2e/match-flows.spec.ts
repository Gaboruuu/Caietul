import { expect, test, type Page } from "@playwright/test";

const analyticsConsentCookie = encodeURIComponent(
  JSON.stringify({ enableAnalytics: true }),
);

async function seedConsent(page: Page) {
  await page.context().addInitScript((cookieValue) => {
    document.cookie = `user_preferences=${cookieValue}; path=/`;
  }, analyticsConsentCookie);
}

async function createMatch(page: Page, champion: string) {
  await seedConsent(page);
  await page.goto("/matches/new");

  await page.getByLabel("Champion").fill(champion);
  await page.getByLabel("Role").selectOption("Support");
  await page.getByLabel("Result").selectOption("Victory");
  await page.getByLabel("Kills").fill("8");
  await page.getByLabel("Deaths").fill("2");
  await page.getByLabel("Assists").fill("11");
  await page.getByLabel("CS").fill("176");
  await page.getByLabel("Vision Score").fill("34");
  await page.getByPlaceholder("mm").fill("34");
  await page.getByPlaceholder("ss").fill("22");
  await page.getByLabel("Date").fill("2026-04-01T12:30");
  await page.getByLabel("Patch").fill("26.7");
  await page.getByLabel("Notes (optional)").fill("Created by Playwright e2e");

  await page.getByRole("button", { name: "Add Match" }).click();
  await expect(page).toHaveURL(/\/matches$/);
}

test.describe("Critical match management journeys", () => {
  test("navigates landing -> home -> detail for an existing match", async ({
    page,
  }) => {
    await seedConsent(page);
    await page.goto("/");

    await page.getByRole("link", { name: /Start Analyzing/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page
      .getByRole("button", { name: /Continue with Riot Account/i })
      .click();
    await expect(page).toHaveURL(/\/matches$/);
    await expect(
      page.getByRole("heading", { name: "Match History" }),
    ).toBeVisible();

    const firstRow = page.locator("tbody tr").first();
    await firstRow.getByRole("link", { name: "View" }).click();

    await expect(page).toHaveURL(/\/matches\/[^/]+$/);
    await expect(
      page.getByRole("heading", { name: "Performance" }),
    ).toBeVisible();
    await expect(page.getByText("Champion:")).toBeVisible();
  });

  test("shows validation errors and allows creating a new match", async ({
    page,
  }) => {
    await seedConsent(page);
    await page.goto("/matches/new");

    await page.getByRole("button", { name: "Add Match" }).click();
    await expect(page.getByText("Champion name is required.")).toBeVisible();
    await expect(
      page.getByText("Duration must be between 1 and 120 minutes."),
    ).toBeVisible();
    await expect(page.getByText("Patch is required.")).toBeVisible();

    const champion = `E2E Lux ${Date.now()}`;
    await createMatch(page, champion);

    const newRow = page.locator("tbody tr").filter({ hasText: champion });
    await expect(newRow).toHaveCount(1);
    await expect(newRow.getByText("Victory")).toBeVisible();
  });

  test("edits an existing match and reflects updated values", async ({
    page,
  }) => {
    await seedConsent(page);
    const champion = `E2E Edit ${Date.now()}`;
    const editedChampion = `E2E Updated ${Date.now()}`;

    await createMatch(page, champion);

    const row = page.locator("tbody tr").filter({ hasText: champion });
    await row.getByRole("link", { name: "Edit" }).click();

    await expect(page).toHaveURL(/\/matches\/[^/]+\/edit$/);

    await page.getByLabel("Champion").fill(editedChampion);
    await page.getByLabel("Patch").fill("26.8");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(/\/matches$/);

    const updatedRow = page
      .locator("tbody tr")
      .filter({ hasText: editedChampion });
    await expect(updatedRow).toHaveCount(1);
    await expect(
      page.locator("tbody tr").filter({ hasText: champion }),
    ).toHaveCount(0);
  });

  test("deletes a match from the confirmation page", async ({ page }) => {
    await seedConsent(page);
    const champion = `E2E Delete ${Date.now()}`;

    await createMatch(page, champion);

    const row = page.locator("tbody tr").filter({ hasText: champion });
    await row.getByRole("link", { name: "Delete" }).click();

    await expect(page).toHaveURL(/\/matches\/[^/]+\/delete$/);
    await expect(
      page.getByRole("heading", { name: "Delete this match?" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Yes, Delete" }).click();

    await expect(page).toHaveURL(/\/matches$/);
    await expect(
      page.locator("tbody tr").filter({ hasText: champion }),
    ).toHaveCount(0);
  });
});
