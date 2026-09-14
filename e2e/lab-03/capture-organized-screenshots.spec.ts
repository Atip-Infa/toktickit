import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 800, height: 1000 },
  { name: "mobile", width: 375, height: 812 },
];

test.describe("Organized Lab 3 Screenshot Capture", () => {
  const screenshotsDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  const ensureDirs = () => {
    ["authentication", "staff-queue", "staff-ticket-detail", "user-management"].forEach((sub) => {
      const dir = path.join(screenshotsDir, sub);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  };

  test.beforeEach(() => {
    ensureDirs();
  });

  for (const vp of viewports) {
    test(`Capture Screenshots for ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Authentication (Login Screen)
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      const switchBtn = page.getByRole("button", { name: /Switch to Real Login/i });
      if (await switchBtn.isVisible()) {
        await switchBtn.click();
      }
      await expect(page.getByRole("heading", { name: /TokTickIT/i })).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: path.join(screenshotsDir, "authentication", `${vp.name}-login.png`),
        fullPage: true,
      });

      // 2. Staff Queue (Login as IT Staff)
      await page.locator("#login-email").fill("michael@toktickit.com");
      await page.locator("#login-password").fill("Password123!");
      await page.getByRole("button", { name: /Sign In/i }).click();

      await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: path.join(screenshotsDir, "staff-queue", `${vp.name}-queue.png`),
        fullPage: true,
      });

      // 3. Staff Ticket Detail
      const detailBtn = page.getByRole("button", { name: /Open Ticket Detail/i }).first();
      if (await detailBtn.isVisible()) {
        await detailBtn.click();
        await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });
        await page.screenshot({
          path: path.join(screenshotsDir, "staff-ticket-detail", `${vp.name}-detail.png`),
          fullPage: true,
        });
      }

      // 4. User Management (Login as Admin)
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      const switchBtnAdmin = page.getByRole("button", { name: /Switch to Real Login/i });
      if (await switchBtnAdmin.isVisible()) {
        await switchBtnAdmin.click();
      }
      await page.locator("#login-email").fill("admin@toktickit.com");
      await page.locator("#login-password").fill("Password123!");
      await page.getByRole("button", { name: /Sign In/i }).click();

      await expect(page.getByRole("heading", { name: /Administrator User Management/i })).toBeVisible({ timeout: 10000 });
      await page.screenshot({
        path: path.join(screenshotsDir, "user-management", `${vp.name}-admin.png`),
        fullPage: true,
      });

      if (vp.name === "desktop") {
        await page.getByRole("button", { name: /➕ Create New User/i }).click();
        await expect(page.getByRole("heading", { name: /Create New User/i })).toBeVisible();
        await page.screenshot({
          path: path.join(screenshotsDir, "user-management", "create-user-modal.png"),
          fullPage: true,
        });
      }
    });
  }
});
