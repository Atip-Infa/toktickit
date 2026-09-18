import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture IT Staff Ticket Detail Permitted Status Changes Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");

  test("Capture Permitted Status Changes and Resolution Summary", async ({ page }) => {
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

    const detailButtons = page.locator("button:has-text('Open Ticket Detail')");
    await expect(detailButtons.first()).toBeVisible({ timeout: 10000 });
    await detailButtons.first().click();

    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });

    // Target the specific sidebar workflow form
    const workflowForm = page.locator("form").filter({ has: page.getByRole("button", { name: /Update Workflow/i }) });

    // Step 1: Transition to IN_PROGRESS & save
    const statusSelect = workflowForm.locator("select").nth(1);
    await statusSelect.selectOption("IN_PROGRESS");
    await workflowForm.getByRole("button", { name: /Update Workflow/i }).click();
    await expect(page.locator("text=/updated successfully/i")).toBeVisible({ timeout: 5000 });

    // Step 2: Transition IN_PROGRESS -> RESOLVED
    await statusSelect.selectOption("RESOLVED");

    // Fill Resolution Summary inside workflow form
    const resolutionTextarea = workflowForm.locator("textarea");
    await expect(resolutionTextarea).toBeVisible({ timeout: 5000 });
    await resolutionTextarea.fill("Replaced printer toner cartridge and calibrated print aligner. Verified test page printed cleanly.");

    // Save Resolution
    await workflowForm.getByRole("button", { name: /Update Workflow/i }).click();
    await expect(page.locator("text=/updated successfully/i")).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotDir, "04-status-change-resolved-with-summary.png"),
      fullPage: true,
    });

    // Copy to root artifacts/lab-03/screenshots/
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    fs.copyFileSync(
      path.join(screenshotDir, "04-status-change-resolved-with-summary.png"),
      path.join(rootDir, "permitted-status-changes.png")
    );
  });
});
