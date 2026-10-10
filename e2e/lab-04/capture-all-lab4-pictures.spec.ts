import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture Missing Lab 4 Screenshots", () => {
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-04", "screenshots");

  const ensureDirs = () => {
    ["actions-taken", "ticket-workflow", "requester-dashboard", "ui-polish", "admin-management"].forEach((sub) => {
      const dir = path.join(rootDir, sub);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  };

  test.beforeEach(async ({ page }) => {
    ensureDirs();
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("1. IT Staff Actions Taken & Workflow Modals", async ({ page }) => {
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

    // Click '📋 IT Ticket Queue'
    const queueNav = page.locator("button:has-text('IT Ticket Queue'), button:has-text('Queue')").first();
    if (await queueNav.isVisible()) {
      await queueNav.click();
      await page.waitForTimeout(1000);
    }

    // Click 'Open Ticket Detail' on first ticket
    const openDetailBtn = page.locator("button:has-text('Open Ticket Detail')").first();
    await expect(openDetailBtn).toBeVisible({ timeout: 10000 });
    await openDetailBtn.click();
    await page.waitForTimeout(1500);

    // Click '🛠️ Service Actions' tab button to switch tab to Actions Taken
    const actionsTabBtn = page.locator("button:has-text('Service Actions'), button:has-text('View All')").first();
    if (await actionsTabBtn.isVisible()) {
      await actionsTabBtn.click();
      await page.waitForTimeout(500);
    }

    // Save actions-list.png
    await page.screenshot({
      path: path.join(rootDir, "actions-taken", "actions-list.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(rootDir, "actions-taken", "actions-list.png"),
      path.join(rootDir, "02-actions-taken-detail.png")
    );

    // Click + Add Action Taken button
    const addActionBtn = page.locator('[data-testid="add-action-taken-btn"], button:has-text("+ Add Action Taken")').first();
    await expect(addActionBtn).toBeVisible({ timeout: 10000 });
    await addActionBtn.click();
    await page.waitForTimeout(800);

    // Save 1. create-action-modal.png
    await page.screenshot({
      path: path.join(rootDir, "actions-taken", "create-action-modal.png"),
    });

    // Submit empty form to trigger validation errors
    const saveActionBtn = page.locator("form button[type='submit'], button:has-text('Save Action')").first();
    if (await saveActionBtn.isVisible()) {
      await saveActionBtn.click();
      await page.waitForTimeout(500);

      // Save 2. validation-error.png
      await page.screenshot({
        path: path.join(rootDir, "actions-taken", "validation-error.png"),
      });
    }

    // Close Create Action modal
    const cancelActionBtn = page.locator("button:has-text('Cancel')").first();
    if (await cancelActionBtn.isVisible()) await cancelActionBtn.click();
    await page.waitForTimeout(500);

    // Save 4. status-transition-modal.png by selecting an allowed status option in workflow controls
    const statusSelect = page.locator("#staffTicketStatusSelect");
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(rootDir, "ticket-workflow", "status-transition-modal.png"),
        fullPage: true,
      });
    }
  });

  test("2. Requester Read-Only View & Advisory Resolution Badge", async ({ page }) => {
    // Login as Requester
    await page.goto("/");
    const switchBtn = page.locator("button:has-text('Switch to Real Login')");
    try {
      await switchBtn.waitFor({ state: "visible", timeout: 2000 });
      await switchBtn.click();
    } catch {}

    await page.locator("#login-email").fill("jennifer@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForTimeout(1000);

    // Click '📋 My Tickets'
    const myTicketsNav = page.locator("button:has-text('My Tickets')").first();
    if (await myTicketsNav.isVisible()) {
      await myTicketsNav.click();
      await page.waitForTimeout(1000);
    }

    // Open first ticket
    const viewTicketBtn = page.locator("button:has-text('View Ticket'), button:has-text('Open'), a:has-text('View'), tbody tr").first();
    if (await viewTicketBtn.isVisible()) {
      await viewTicketBtn.click();
      await page.waitForTimeout(1500);

      // Save 3. requester-readonly.png
      await page.screenshot({
        path: path.join(rootDir, "actions-taken", "requester-readonly.png"),
        fullPage: true,
      });

      // Save 5. appears-resolved-advisory.png
      await page.screenshot({
        path: path.join(rootDir, "requester-dashboard", "appears-resolved-advisory.png"),
        fullPage: true,
      });
    }
  });

  test("3. Admin Dashboard Overview", async ({ page }) => {
    // Login as Administrator
    await page.goto("/");
    const switchBtn = page.locator("button:has-text('Switch to Real Login')");
    try {
      await switchBtn.waitFor({ state: "visible", timeout: 2000 });
      await switchBtn.click();
    } catch {}

    await page.locator("#login-email").fill("admin@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForTimeout(1500);

    // Save 6. admin-dashboard.png
    await page.screenshot({
      path: path.join(rootDir, "ui-polish", "admin-dashboard.png"),
      fullPage: true,
    });
  });
});
