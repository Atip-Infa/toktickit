import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Lab 3 End-to-End Authentication, IT Staff Queue & Admin User Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("E2E-LAB3-01: Login & IT Staff Ticket Queue Workflow", async ({ page }) => {
    const switchBtn = page.getByRole("button", { name: /Switch to Real Login/i });
    if (await switchBtn.isVisible()) {
      await switchBtn.click();
    }

    await expect(page.getByRole("heading", { name: /TokTickIT/i })).toBeVisible({ timeout: 10000 });

    const screenshotsDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotsDir, "01-login-screen.png"), fullPage: true });

    // 2. Login as IT Staff (Michael Brown)
    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // 3. Verify IT Staff Queue view
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, "02-staff-ticket-queue.png"), fullPage: true });

    // 4. Click 'Open Ticket Detail' on the first ticket to open Staff Ticket Detail
    const detailBtn = page.getByRole("button", { name: /Open Ticket Detail/i }).first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: path.join(screenshotsDir, "03-staff-ticket-detail.png"), fullPage: true });
    }
  });

  test("E2E-LAB3-02: Administrator User Management Workflow", async ({ page }) => {
    // 1. Login as Administrator (Admin User)
    const switchBtn = page.getByRole("button", { name: /Switch to Real Login/i });
    if (await switchBtn.isVisible()) {
      await switchBtn.click();
    }
    await page.locator("#login-email").fill("admin@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // 2. Verify Admin view navigation
    await expect(page.getByRole("heading", { name: /Administrator User Management/i })).toBeVisible({ timeout: 10000 });

    const screenshotsDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotsDir, "04-admin-user-management.png"), fullPage: true });

    // 3. Open Create User Modal
    await page.getByRole("button", { name: /➕ Create New User/i }).click();
    await expect(page.getByRole("heading", { name: /Create New User/i })).toBeVisible();
    await page.screenshot({ path: path.join(screenshotsDir, "05-create-user-modal.png"), fullPage: true });
  });
});
