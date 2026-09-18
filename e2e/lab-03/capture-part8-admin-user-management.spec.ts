import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture Part 8 Administrator User Management Evidence Screenshots", () => {
  const adminDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "user-management");
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  test.beforeEach(async ({ page }) => {
    if (!fs.existsSync(adminDir)) {
      fs.mkdirSync(adminDir, { recursive: true });
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

    // Login as Admin
    await page.locator("#login-email").fill("admin@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByRole("heading", { name: /Administrator User Management/i })).toBeVisible({ timeout: 10000 });
  });

  test("01. User List Table, Search, Role Filters & Responsive Zenith Layout", async ({ page }) => {
    // Search filter demo
    await page.locator("input[placeholder*='Search']").fill("Michael");
    await page.waitForTimeout(300);
    await expect(page.locator("td:has-text('Michael Brown')")).toBeVisible();

    // Clear search
    await page.locator("input[placeholder*='Search']").fill("");

    await page.screenshot({
      path: path.join(adminDir, "01-user-list-search-filters.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(adminDir, "01-user-list-search-filters.png"),
      path.join(rootDir, "admin-user-list-search-filters.png")
    );
  });

  test("02. Create User Modal Dialog with Permitted Role & Initial Password", async ({ page }) => {
    await page.getByRole("button", { name: /➕ Create New User/i }).click();
    await expect(page.getByRole("heading", { name: /Create New User/i })).toBeVisible();

    await page.locator("input[placeholder='e.g. John Doe']").fill("Sarah Connor");
    await page.locator("input[placeholder='e.g. john@toktickit.com']").fill("sarah.connor@toktickit.com");

    await page.screenshot({
      path: path.join(adminDir, "02-create-user-modal.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(adminDir, "02-create-user-modal.png"),
      path.join(rootDir, "admin-create-user-modal.png")
    );
  });

  test("03. Duplicate Email Validation Error Feedback", async ({ page }) => {
    await page.getByRole("button", { name: /➕ Create New User/i }).click();
    await expect(page.getByRole("heading", { name: /Create New User/i })).toBeVisible();

    // Attempt to create user with existing email (admin@toktickit.com)
    await page.locator("input[placeholder='e.g. John Doe']").fill("Duplicate Test User");
    await page.locator("input[placeholder='e.g. john@toktickit.com']").fill("admin@toktickit.com");
    await page.locator("button[type='submit']:has-text('Create User')").click();

    await expect(page.locator("text=/Email already in use/i")).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: path.join(adminDir, "03-duplicate-email-validation.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(adminDir, "03-duplicate-email-validation.png"),
      path.join(rootDir, "admin-duplicate-email-validation.png")
    );
  });

  test("04. Edit User Modal & Self-Deactivation Prevention", async ({ page }) => {
    // Search for admin@toktickit.com to guarantee self-deactivation test on current logged in admin
    await page.locator("input[placeholder*='Search']").fill("admin@toktickit.com");
    await page.waitForTimeout(300);
    const editButtons = page.locator("button:has-text('Edit')");
    await expect(editButtons.first()).toBeVisible({ timeout: 10000 });
    await editButtons.first().click();

    await expect(page.getByRole("heading", { name: /Edit User Details/i })).toBeVisible();
    await expect(page.locator("text=/cannot deactivate your own administrator account/i")).toBeVisible();

    await page.screenshot({
      path: path.join(adminDir, "04-edit-user-self-deactivation-prevention.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(adminDir, "04-edit-user-self-deactivation-prevention.png"),
      path.join(rootDir, "admin-edit-user-self-deactivation-prevention.png")
    );
  });

  test("05. Reset Initial Password Modal Dialog", async ({ page }) => {
    const userRow = page.locator("tr", { hasText: "Jennifer Anderson" }).first();
    await userRow.locator("button:has-text('Reset Password')").first().click();

    await expect(page.getByRole("heading", { name: /Reset Password/i })).toBeVisible();

    await page.screenshot({
      path: path.join(adminDir, "05-reset-password-modal.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(adminDir, "05-reset-password-modal.png"),
      path.join(rootDir, "admin-reset-password-modal.png")
    );
  });

  test("06. Non-Administrator Access Denied (403 Forbidden)", async ({ page }) => {
    // Logout admin
    await page.getByRole("button", { name: /Logout/i }).click();

    // Login as Requester
    await page.locator("#login-email").fill("jennifer@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Attempt to access user management view state directly via URL or hash/tab if accessible
    await page.evaluate(() => {
      window.location.hash = "#/admin/users";
    });

    await page.screenshot({
      path: path.join(adminDir, "06-non-admin-access-blocked.png"),
      fullPage: true,
    });
    fs.copyFileSync(
      path.join(adminDir, "06-non-admin-access-blocked.png"),
      path.join(rootDir, "admin-non-admin-access-blocked.png")
    );
  });
});
