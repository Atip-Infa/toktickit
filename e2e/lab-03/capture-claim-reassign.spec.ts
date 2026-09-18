import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture IT Staff Ticket Detail Claim and Reassign Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");

  test("Capture Claim and Reassign Actions", async ({ page }) => {
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

    // 1. Screenshot BEFORE claim (Unassigned state with Claim to Me button)
    await page.screenshot({
      path: path.join(screenshotDir, "01-unassigned-claim-button-state.png"),
      fullPage: true,
    });

    // 2. Click "Claim to Me"
    const claimBtn = page.locator("button:has-text('Claim to Me')");
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
    } else {
      // Select Claim from dropdown if button already clicked
      const ownerSelect = page.locator("select").nth(2);
      await ownerSelect.selectOption({ label: "Claim to Me (Michael Brown)" });
    }

    // Save changes
    await page.getByRole("button", { name: /Update Workflow/i }).click();
    await expect(page.locator("text=/updated successfully/i")).toBeVisible({ timeout: 5000 });

    // 3. Screenshot AFTER claim (Assigned to Michael Brown)
    await page.screenshot({
      path: path.join(screenshotDir, "02-claimed-assigned-state.png"),
      fullPage: true,
    });

    // Copy main screenshots to root artifacts/lab-03/screenshots/
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    fs.copyFileSync(
      path.join(screenshotDir, "01-unassigned-claim-button-state.png"),
      path.join(rootDir, "claim-reassign-unassigned.png")
    );
    fs.copyFileSync(
      path.join(screenshotDir, "02-claimed-assigned-state.png"),
      path.join(rootDir, "claim-reassign-claimed.png")
    );
  });
});
