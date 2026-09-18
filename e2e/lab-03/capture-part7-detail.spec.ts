import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture Part 7 Staff Ticket Detail Screenshots", () => {
  const detailDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  test.beforeEach(async ({ page }) => {
    if (!fs.existsSync(detailDir)) {
      fs.mkdirSync(detailDir, { recursive: true });
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
    const emailInput = page.locator("#login-email");
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
  });

  test("Capture Staff Ticket Detail View across Desktop, Tablet, Mobile", async ({ page }) => {
    // Desktop Viewport (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    const detailBtn = page.locator("button:has-text('Open Ticket Detail')").first();
    await expect(detailBtn).toBeVisible({ timeout: 10000 });
    await detailBtn.click();
    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(detailDir, "desktop-detail.png"), fullPage: true });
    await page.screenshot({ path: path.join(rootDir, "03-staff-ticket-detail.png"), fullPage: true });

    // Tablet Viewport (800x1000)
    await page.setViewportSize({ width: 800, height: 1000 });
    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(detailDir, "tablet-detail.png"), fullPage: true });

    // Mobile Viewport (375x812)
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(detailDir, "mobile-detail.png"), fullPage: true });
  });
});
