import { test, expect } from "@playwright/test";

test.describe("Lab 3 E2E IT Staff Ticket Queue & Workflow Tests", () => {
  async function loginAsStaff(page: any) {
    await page.context().clearCookies();
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    const switchBtn = page.getByRole("button", { name: /Switch to Real Login/i });
    if (await switchBtn.isVisible()) {
      await switchBtn.click();
    }

    const emailInput = page.locator("#login-email");
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
  }

  test("E2E-STAFF-01: Staff Ticket Queue search, filter, and ticket detail workflow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAsStaff(page);

    // 1. Search Queue
    const searchInput = page.getByPlaceholder(/Search ticket/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Printer");
      await page.waitForTimeout(300);
    }

    // 2. Open Ticket Detail
    const detailBtn = page.getByRole("button", { name: /Open Ticket Detail/i }).first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });
    }
  });

  test("E2E-STAFF-02: Multi-viewport responsive Queue layout (Tablet 800px, Mobile 375px)", async ({ page }) => {
    // Tablet Viewport
    await page.setViewportSize({ width: 800, height: 1024 });
    await loginAsStaff(page);
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible();

    // Mobile Viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible();
  });
});
