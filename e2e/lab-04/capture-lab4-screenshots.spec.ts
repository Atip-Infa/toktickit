import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 800, height: 1000 },
  { name: "mobile", width: 375, height: 812 },
];

async function loginAs(page: Page, email: string, password = "Password123!") {
  await page.context().clearCookies();
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  const switchBtn = page.locator("button:has-text('Switch to Real Login')");
  try {
    await switchBtn.waitFor({ state: "visible", timeout: 2000 });
    await switchBtn.click();
  } catch {
    // Already on LoginView
  }

  const emailInput = page.locator("#login-email");
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /Sign In/i }).click();
  await page.waitForTimeout(1000);
}

test.describe("Complete Lab 4 Screenshot Evidence Capture", () => {
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-04", "screenshots");

  const ensureDirs = () => {
    ["it-staff-dashboard", "actions-taken", "ticket-workflow", "requester-dashboard", "ui-polish", "admin-management"].forEach((sub) => {
      const dir = path.join(rootDir, sub);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  };

  test.beforeEach(() => {
    ensureDirs();
  });

  // 1. Responsive Dashboards
  for (const vp of viewports) {
    test(`Capture Responsive IT Staff Dashboard for ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginAs(page, "michael@toktickit.com");

      // IT Staff Dashboard tab if present or default view
      const dashboardTab = page.locator("a:has-text('Dashboard'), button:has-text('Dashboard')").first();
      if (await dashboardTab.isVisible()) {
        await dashboardTab.click();
        await page.waitForTimeout(1000);
      }

      await page.screenshot({
        path: path.join(rootDir, "it-staff-dashboard", `${vp.name}-it-staff-dashboard.png`),
        fullPage: true,
      });

      if (vp.name === "desktop") {
        fs.copyFileSync(
          path.join(rootDir, "it-staff-dashboard", "desktop-it-staff-dashboard.png"),
          path.join(rootDir, "01-it-staff-dashboard.png")
        );
      }
    });

    test(`Capture Responsive Requester Dashboard for ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loginAs(page, "jennifer@toktickit.com");

      const dashboardTab = page.locator("a:has-text('Dashboard'), button:has-text('Dashboard')").first();
      if (await dashboardTab.isVisible()) {
        await dashboardTab.click();
        await page.waitForTimeout(1000);
      }

      await page.screenshot({
        path: path.join(rootDir, "requester-dashboard", `${vp.name}-requester-dashboard.png`),
        fullPage: true,
      });

      if (vp.name === "desktop") {
        fs.copyFileSync(
          path.join(rootDir, "requester-dashboard", "desktop-requester-dashboard.png"),
          path.join(rootDir, "03-requester-dashboard.png")
        );
      }
    });
  }

  // 2. Actions Taken & Ticket Workflow Evidence
  test("Capture Actions Taken UI, Resolution Gate & Workflow Modals", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "michael@toktickit.com");

    // Open Staff Ticket Queue
    const queueTab = page.locator("a:has-text('Queue'), a:has-text('My Queue'), button:has-text('Queue')").first();
    if (await queueTab.isVisible()) {
      await queueTab.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({
      path: path.join(rootDir, "it-staff-dashboard", "queue-drilldown.png"),
      fullPage: true,
    });

    // Open Ticket Detail
    const openDetailBtn = page.locator("button:has-text('Open Ticket Detail'), button:has-text('View'), a:has-text('Open')").first();
    if (await openDetailBtn.isVisible()) {
      await openDetailBtn.click();
      await page.waitForTimeout(1500);

      // Screenshot 1: Actions Taken List on Ticket Detail
      await page.screenshot({
        path: path.join(rootDir, "actions-taken", "actions-list.png"),
        fullPage: true,
      });
      fs.copyFileSync(
        path.join(rootDir, "actions-taken", "actions-list.png"),
        path.join(rootDir, "02-actions-taken-detail.png")
      );

      // Screenshot 2: Create Action Taken Modal
      const addActionBtn = page.locator("button:has-text('Add Action'), button:has-text('Record Action'), button:has-text('Add Action Taken')").first();
      if (await addActionBtn.isVisible()) {
        await addActionBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(rootDir, "actions-taken", "create-action-modal.png"),
        });

        // Trigger Validation Error on empty form
        const submitBtn = page.locator("div[role='dialog'] button[type='submit'], form button[type='submit']").first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(500);
          await page.screenshot({
            path: path.join(rootDir, "actions-taken", "validation-error.png"),
          });
        }

        const cancelBtn = page.locator("button:has-text('Cancel')").first();
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }

      // Screenshot 3: Status Transition & Resolution Gate
      const changeStatusBtn = page.locator("button:has-text('Change Status'), button:has-text('Update Status')").first();
      if (await changeStatusBtn.isVisible()) {
        await changeStatusBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(rootDir, "ticket-workflow", "status-transition-modal.png"),
        });

        const cancelStatusBtn = page.locator("button:has-text('Cancel')").first();
        if (await cancelStatusBtn.isVisible()) await cancelStatusBtn.click();
      }
    }

    // 3. Requester Read-Only View & Advisory Indication
    await loginAs(page, "jennifer@toktickit.com");

    const reqTicketBtn = page.locator("button:has-text('Open Ticket Detail'), a:has-text('Open')").first();
    if (await reqTicketBtn.isVisible()) {
      await reqTicketBtn.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: path.join(rootDir, "actions-taken", "requester-readonly.png"),
        fullPage: true,
      });

      const appearResolvedBtn = page.locator("button:has-text('Problem Appears Resolved'), button:has-text('Appears Resolved')").first();
      if (await appearResolvedBtn.isVisible()) {
        await page.screenshot({
          path: path.join(rootDir, "requester-dashboard", "appears-resolved-advisory.png"),
        });
      }
    }

    // 4. Admin User Management & System Stats
    await loginAs(page, "admin@toktickit.com");

    const adminNav = page.locator("a:has-text('User Management'), a:has-text('Admin')").first();
    if (await adminNav.isVisible()) {
      await adminNav.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({
      path: path.join(rootDir, "admin-management", "admin-user-management.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(rootDir, "admin-management", "admin-user-management.png"),
      path.join(rootDir, "04-admin-user-management.png")
    );
  });
});
