import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture IT Staff Ticket Detail Internal Notes Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");

  test("Capture Internal Notes Section & Posting Action", async ({ page }) => {
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

    // Click Internal Notes tab
    await page.getByRole("button", { name: /📝 Internal Notes/i }).click();

    // Post an internal note using exact placeholder
    const noteInput = page.locator("textarea[placeholder*='Add investigation steps']");
    await expect(noteInput).toBeVisible({ timeout: 5000 });
    await noteInput.fill("🔒 Internal Diagnostic Note: Verified DHCP server lease log. Subnet gateway routing confirmed active.");

    await page.getByRole("button", { name: /Save Internal Note/i }).click();

    // Wait for internal note to appear in notes list
    await expect(page.locator("text=/Subnet gateway routing confirmed active/i")).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotDir, "06-internal-notes-tab-posted.png"),
      fullPage: true,
    });

    // Copy to root artifacts/lab-03/screenshots/
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    fs.copyFileSync(
      path.join(screenshotDir, "06-internal-notes-tab-posted.png"),
      path.join(rootDir, "internal-notes-demonstration.png")
    );
  });
});
