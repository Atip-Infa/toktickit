import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Lab 4 Comprehensive Evidence Capture", () => {
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-04", "screenshots");

  const ensureDirs = () => {
    ["actions-taken", "ticket-workflow", "requester-dashboard", "it-staff-dashboard", "ui-polish"].forEach((sub) => {
      const dir = path.join(rootDir, sub);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  };

  test.beforeEach(async () => {
    ensureDirs();
  });

  test("1. Capture Responsive Screens for Ticket Detail & Actions Taken (Desktop, Tablet, Mobile)", async ({ page }) => {
    // Login as IT Staff
    await page.goto("/");
    const switchBtn = page.locator("button:has-text('Switch to Real Login')");
    try {
      await switchBtn.waitFor({ state: "visible", timeout: 2000 });
      await switchBtn.click();
    } catch {}

    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForTimeout(1000);

    // Go to IT Ticket Queue
    const queueNav = page.locator("button:has-text('IT Ticket Queue'), button:has-text('Queue')").first();
    if (await queueNav.isVisible()) {
      await queueNav.click();
      await page.waitForTimeout(1000);
    }

    // Open first ticket
    const openDetailBtn = page.locator("button:has-text('Open Ticket Detail')").first();
    await expect(openDetailBtn).toBeVisible({ timeout: 10000 });
    await openDetailBtn.click();
    await page.waitForTimeout(1500);

    // Switch to Service Actions tab
    const actionsTabBtn = page.locator("button:has-text('Service Actions'), button:has-text('View All')").first();
    if (await actionsTabBtn.isVisible()) {
      await actionsTabBtn.click();
      await page.waitForTimeout(500);
    }

    // --- Desktop View (1440x900) ---
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(rootDir, "actions-taken", "actions-taken-desktop.png"), fullPage: true });
    await page.screenshot({ path: path.join(rootDir, "ticket-workflow", "ticket-detail-desktop.png"), fullPage: true });

    // --- Tablet View (768x1024) ---
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(rootDir, "actions-taken", "actions-taken-tablet.png"), fullPage: true });
    await page.screenshot({ path: path.join(rootDir, "ticket-workflow", "ticket-detail-tablet.png"), fullPage: true });

    // --- Mobile View (375x812) ---
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(rootDir, "actions-taken", "actions-taken-mobile.png"), fullPage: true });
    await page.screenshot({ path: path.join(rootDir, "ticket-workflow", "ticket-detail-mobile.png"), fullPage: true });
  });

  test("2. Capture Multiple Actions Taken, Edit Action Modal, and Lifecycle Behavior", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login as IT Staff
    await page.goto("/");
    const switchBtn = page.locator("button:has-text('Switch to Real Login')");
    try {
      await switchBtn.waitFor({ state: "visible", timeout: 2000 });
      await switchBtn.click();
    } catch {}

    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForTimeout(1000);

    // Go to Queue and open ticket
    const queueNav = page.locator("button:has-text('IT Ticket Queue'), button:has-text('Queue')").first();
    if (await queueNav.isVisible()) {
      await queueNav.click();
      await page.waitForTimeout(1000);
    }
    const openDetailBtn = page.locator("button:has-text('Open Ticket Detail')").first();
    if (await openDetailBtn.isVisible()) {
      await openDetailBtn.click();
      await page.waitForTimeout(1500);
    }

    // Switch to Actions tab
    const actionsTabBtn = page.locator("button:has-text('Service Actions'), button:has-text('View All')").first();
    if (await actionsTabBtn.isVisible()) {
      await actionsTabBtn.click();
      await page.waitForTimeout(500);
    }

    // Add first action if needed or check existing
    const addActionBtn = page.locator('[data-testid="add-action-taken-btn"], button:has-text("+ Add Action Taken")').first();
    if (await addActionBtn.isVisible()) {
      await addActionBtn.click();
      await page.waitForTimeout(500);
      const descInput = page.locator("textarea[name='actionDescription'], textarea[placeholder*='description']").first();
      const resultInput = page.locator("textarea[name='result'], textarea[placeholder*='result']").first();
      if (await descInput.isVisible()) await descInput.fill("Initial diagnosis performed. Tested network connectivity.");
      if (await resultInput.isVisible()) await resultInput.fill("Identified faulty patch cable in rack 2.");
      const submitBtn = page.locator("form button[type='submit'], button:has-text('Save Action')").first();
      if (await submitBtn.isVisible()) await submitBtn.click();
      await page.waitForTimeout(1000);
    }

    // Capture multiple actions list
    await page.screenshot({ path: path.join(rootDir, "actions-taken", "multiple-actions-taken.png"), fullPage: true });

    // Click Edit on first action record if available
    const editBtn = page.locator("button:has-text('Edit'), [aria-label*='Edit']").first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(rootDir, "actions-taken", "edit-action-modal.png") });
    }
  });

  test("3. Capture IT Staff Dashboard Responsive Views", async ({ page }) => {
    await page.goto("/");
    const switchBtn = page.locator("button:has-text('Switch to Real Login')");
    try {
      await switchBtn.waitFor({ state: "visible", timeout: 2000 });
      await switchBtn.click();
    } catch {}

    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForTimeout(1500);

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(rootDir, "it-staff-dashboard", "staff-dashboard-desktop.png"), fullPage: true });

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(rootDir, "it-staff-dashboard", "staff-dashboard-tablet.png"), fullPage: true });

    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(rootDir, "it-staff-dashboard", "staff-dashboard-mobile.png"), fullPage: true });
  });
});
