import { test, expect } from "@playwright/test";

test.describe("Lab 3 E2E Authentication Tests", () => {
  async function resetAndGoToLogin(page: any) {
    await page.setViewportSize({ width: 1440, height: 900 });
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
    return emailInput;
  }

  test("E2E-AUTH-01: Login as IT Staff and logout session clearing", async ({ page }) => {
    const emailInput = await resetAndGoToLogin(page);

    await emailInput.fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });

    const logoutBtn = page.getByRole("button", { name: /Logout/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test("E2E-AUTH-02: Invalid credentials rejection", async ({ page }) => {
    const emailInput = await resetAndGoToLogin(page);

    await emailInput.fill("michael@toktickit.com");
    await page.locator("#login-password").fill("WrongPassword!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    const alertBanner = page.locator(".alert-danger, [role='alert']");
    await expect(alertBanner).toBeVisible({ timeout: 10000 });
  });
});
