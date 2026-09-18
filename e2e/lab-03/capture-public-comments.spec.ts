import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture IT Staff Ticket Detail Public Comments Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");

  test("Capture Public Comments Section & Posting Action", async ({ page }) => {
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

    // Click Public Comments tab
    await page.getByRole("button", { name: /💬 Public Comments/i }).click();

    // Post a public comment
    const commentInput = page.locator("textarea[placeholder*='Type your message']");
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    await commentInput.fill("Hello Jennifer, our IT team has received your ticket. An engineer has been assigned and will update you shortly.");

    await page.getByRole("button", { name: /Post Comment/i }).click();

    // Wait for comment to appear in comments list
    await expect(page.locator("text=/our IT team has received your ticket/i")).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotDir, "05-public-comments-tab-posted.png"),
      fullPage: true,
    });

    // Copy to root artifacts/lab-03/screenshots/
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    fs.copyFileSync(
      path.join(screenshotDir, "05-public-comments-tab-posted.png"),
      path.join(rootDir, "public-comments-demonstration.png")
    );
  });
});
