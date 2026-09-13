import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Lab 3 E2E IT Staff Ticket Queue & Responsiveness Tests", () => {
  const screenshotsDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  async function loginAsStaff(page: any) {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
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

  test("Desktop Viewport (1440px): Full Table & Controls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAsStaff(page);

    // Take Desktop Queue Screenshot
    await page.screenshot({ path: path.join(screenshotsDir, "queue-desktop.png"), fullPage: true });

    // Test Search
    const searchInput = page.getByPlaceholder(/Search ticket/i);
    await searchInput.fill("Printer");
    await page.waitForTimeout(300);
    await expect(page.getByText(/Printer/i).first()).toBeVisible();
  });

  test("Tablet Viewport (800px): Scrollable Table Container", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 1024 });
    await loginAsStaff(page);

    // Take Tablet Queue Screenshot
    await page.screenshot({ path: path.join(screenshotsDir, "queue-tablet.png"), fullPage: true });
  });

  test("Mobile Viewport (375px): Stacked Zen Cards", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsStaff(page);

    // Take Mobile Queue Screenshot
    await page.screenshot({ path: path.join(screenshotsDir, "queue-mobile.png"), fullPage: true });
  });
});
