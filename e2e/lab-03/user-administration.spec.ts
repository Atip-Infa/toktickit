import { test, expect } from "@playwright/test";

test.describe("Lab 3 E2E Administrator User Management Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.context().clearCookies();
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test("E2E-ADMIN-01: Admin login and user list view", async ({ page }) => {
    const switchBtn = page.getByRole("button", { name: /Switch to Real Login/i });
    if (await switchBtn.isVisible()) {
      await switchBtn.click();
    }

    await page.locator("#login-email").fill("admin@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /Administrator User Management/i })).toBeVisible({ timeout: 10000 });
  });

  test("E2E-ADMIN-02: Open Create New User modal dialog", async ({ page }) => {
    const switchBtn = page.getByRole("button", { name: /Switch to Real Login/i });
    if (await switchBtn.isVisible()) {
      await switchBtn.click();
    }

    await page.locator("#login-email").fill("admin@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /Administrator User Management/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /➕ Create New User/i }).click();
    await expect(page.getByRole("heading", { name: /Create New User/i })).toBeVisible();
  });
});
