import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture Part 5 Authentication Screenshots", () => {
  const authDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "authentication");

  test.beforeEach(async ({ page }) => {
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
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
  });

  test("00. Busy State Feedback", async ({ page }) => {
    await page.route("**/api/auth/login", (route) => {
      // Intentionally delay network response so button stays in busy state
      setTimeout(() => route.continue(), 3000);
    });

    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    const busyBtn = page.locator("button:has-text('Signing in...')");
    await expect(busyBtn).toBeVisible({ timeout: 2000 });
    await page.screenshot({ path: path.join(authDir, "00-busy-signing-in-state.png"), fullPage: true });
  });

  test("01. Invalid Credentials Rejection", async ({ page }) => {
    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("WrongPassword!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    const alertBanner = page.locator(".alert-danger, [role='alert']");
    await expect(alertBanner).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(authDir, "01-invalid-credentials-rejection.png"), fullPage: true });
  });

  test("02. Inactive Account Rejection", async ({ page }) => {
    await page.locator("#login-email").fill("robert@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    const alertBanner = page.locator(".alert-danger, [role='alert']");
    await expect(alertBanner).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(authDir, "02-inactive-account-rejection.png"), fullPage: true });
  });

  test("03. Mandatory First-Password Change", async ({ page }) => {
    await page.locator("#login-email").fill("david@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByRole("heading", { name: /Mandatory Password Change/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(authDir, "03-mandatory-password-change.png"), fullPage: true });
  });

  test("04. Valid Login & User/Role Header", async ({ page }) => {
    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(authDir, "04-valid-login-authenticated-role-header.png"), fullPage: true });
  });

  test("05. Logout & Access Invalidation", async ({ page }) => {
    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });

    const logoutBtn = page.getByRole("button", { name: /Logout/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    await expect(page.locator("#login-email")).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(authDir, "05-logout-direct-access-blocked.png"), fullPage: true });
  });
});
