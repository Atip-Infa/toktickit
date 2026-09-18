import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture IT Staff Ticket Detail IT Priority Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");

  test("Capture IT Priority Dropdown & Update Actions", async ({ page }) => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
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

    const detailBtn = page.locator("button:has-text('Open Ticket Detail')").first();
    await expect(detailBtn).toBeVisible({ timeout: 10000 });
    await detailBtn.click();

    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });

    // 1. Change IT Priority dropdown to URGENT or HIGH
    const prioritySelect = page.locator("select").first(); // IT Priority is first select in Staff Controls
    await prioritySelect.selectOption({ label: "URGENT" });

    // 2. Click "Update Workflow"
    await page.getByRole("button", { name: /Update Workflow/i }).click();
    await expect(page.locator("text=/updated successfully/i")).toBeVisible({ timeout: 5000 });

    // 3. Take screenshot demonstrating updated IT Priority (URGENT) vs Requested Priority (MEDIUM)
    await page.screenshot({
      path: path.join(screenshotDir, "03-it-priority-updated-urgent.png"),
      fullPage: true,
    });

    // Copy to root artifacts/lab-03/screenshots/
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    fs.copyFileSync(
      path.join(screenshotDir, "03-it-priority-updated-urgent.png"),
      path.join(rootDir, "it-priority-demonstration.png")
    );
  });
});
