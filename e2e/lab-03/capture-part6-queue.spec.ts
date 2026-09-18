import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture Part 6 IT Staff Ticket Queue Screenshots", () => {
  const queueDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-queue");

  test.beforeEach(async ({ page }) => {
    if (!fs.existsSync(queueDir)) {
      fs.mkdirSync(queueDir, { recursive: true });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
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

    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
  });

  test("01. Realistic Queue Data, Status & Priority Badges", async ({ page }) => {
    await page.screenshot({ path: path.join(queueDir, "01-queue-realistic-data-badges.png"), fullPage: true });
  });

  test("02. Search, Filters, Sorting & Pagination", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search ticket/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("Printer");
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(queueDir, "02-queue-search-filtering-sorting.png"), fullPage: true });
  });

  test("03. Assigned and Unassigned Ownership Indication", async ({ page }) => {
    await page.screenshot({ path: path.join(queueDir, "03-queue-assigned-unassigned-ownership.png"), fullPage: true });
  });

  test("04. No-Results State Feedback", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search ticket/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("NonExistentKeywordXYZ999");
      await page.waitForTimeout(500);
    }
    await expect(page.locator("text=/No tickets match/i")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(queueDir, "04-queue-no-results-feedback.png"), fullPage: true });
  });

  test("05. Open Ticket Detail Action", async ({ page }) => {
    const detailBtn = page.locator("button:has-text('Open Ticket Detail')").first();
    await expect(detailBtn).toBeVisible({ timeout: 10000 });
    await detailBtn.click();
    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(queueDir, "05-queue-open-detail-action.png"), fullPage: true });
    
    // Also save in root screenshots dir for easy access
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    await page.screenshot({ path: path.join(rootDir, "05-queue-open-detail-action.png"), fullPage: true });
  });

  test("06. Responsive Multi-Viewport Queue Layouts", async ({ page }) => {
    // Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(queueDir, "desktop-queue.png"), fullPage: true });

    // Tablet (800x1000)
    await page.setViewportSize({ width: 800, height: 1000 });
    await page.reload();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(queueDir, "tablet-queue.png"), fullPage: true });

    // Mobile (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(queueDir, "mobile-queue.png"), fullPage: true });
  });
});
