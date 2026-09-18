import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture Part 7 Staff Ticket Detail Validation & Authorization Evidence", () => {
  const detailDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  test.beforeEach(async () => {
    if (!fs.existsSync(detailDir)) {
      fs.mkdirSync(detailDir, { recursive: true });
    }
  });

  test("01. Requester Resolution Indication & Role Isolation (No Internal Notes)", async ({ page, request }) => {
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

    // Login as Requester (Jennifer Anderson)
    await page.locator("#login-email").fill("jennifer@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.locator("text=/My Tickets/i").first()).toBeVisible({ timeout: 10000 });

    // Ensure Jennifer has at least one active ticket via API
    const token = await page.evaluate(() => localStorage.getItem("toktickit_token"));
    if (token) {
      await request.post("http://localhost:3000/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          summary: "VPN Client Connection Timeout Issue",
          description: "Cannot connect to campus VPN server from remote network.",
          categoryId: 1,
          relatedSystemId: 1,
          requestedPriority: "MEDIUM",
        },
      });
      await page.reload();
      await expect(page.locator("text=/My Tickets/i").first()).toBeVisible({ timeout: 10000 });
    }

    // Wait for table body row to finish loading and click
    const ticketCell = page.locator("td.text-success").first();
    await expect(ticketCell).toBeVisible({ timeout: 10000 });
    await ticketCell.click();

    // Verify Requester detail view header loaded
    await expect(page.locator("button:has-text('Back')").first()).toBeVisible({ timeout: 10000 });

    // Verify strict absence of Internal Notes tab for Requester role (Security BR-03 / AC-09)
    await expect(page.locator("text=/Internal Notes/i")).not.toBeVisible();

    await page.screenshot({
      path: path.join(detailDir, "08-requester-resolution-and-role-restriction.png"),
      fullPage: true,
    });

    fs.copyFileSync(
      path.join(detailDir, "08-requester-resolution-and-role-restriction.png"),
      path.join(rootDir, "requester-resolution-role-restriction.png")
    );
  });

  test("02. Validation & Safe Failure Behavior (Resolution Summary Required)", async ({ page }) => {
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

    // Login as IT Staff
    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });

    const detailButtons = page.locator("button:has-text('Open Ticket Detail')");
    await expect(detailButtons.first()).toBeVisible({ timeout: 10000 });
    await detailButtons.first().click();

    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });

    const workflowForm = page.locator("form").filter({ has: page.getByRole("button", { name: /Update Workflow/i }) });

    // Step 1: Claim & transition NEW -> IN_PROGRESS
    const claimBtn = page.locator("button:has-text('Claim to Me')");
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await page.getByRole("button", { name: /Update Workflow/i }).click();
      await expect(page.locator("text=/updated successfully/i")).toBeVisible({ timeout: 5000 });
    }

    // Step 2: Select status RESOLVED, clear textarea value, remove required attribute
    const statusSelect = workflowForm.locator("select").nth(1);
    await statusSelect.selectOption("RESOLVED");

    await page.evaluate(() => {
      const ta = document.querySelector("form textarea") as HTMLTextAreaElement;
      if (ta) {
        ta.removeAttribute("required");
        ta.value = "";
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // Click Update Workflow to trigger backend validation error alert
    await workflowForm.getByRole("button", { name: /Update Workflow/i }).click();

    // Verify error alert rendered
    await expect(page.locator("text=/Resolution summary is required/i")).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: path.join(detailDir, "09-validation-safe-failure-behavior.png"),
      fullPage: true,
    });

    fs.copyFileSync(
      path.join(detailDir, "09-validation-safe-failure-behavior.png"),
      path.join(rootDir, "validation-safe-failure-behavior.png")
    );
  });

  test("03. Direct API Authorization Enforcement (HTTP 403 Forbidden Evidence)", async ({ request }) => {
    // 1. Authenticate as Requester (jennifer@toktickit.com)
    const loginRes = await request.post("http://localhost:3000/api/auth/login", {
      data: { email: "jennifer@toktickit.com", password: "Password123!" },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.token;

    // 2. Attempt to access IT Staff Queue endpoint as Requester -> Expect 403 Forbidden
    const queueRes = await request.get("http://localhost:3000/api/staff/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(queueRes.status()).toBe(403);

    // 3. Attempt to access Internal Notes endpoint as Requester -> Expect 403 Forbidden
    const notesRes = await request.get("http://localhost:3000/api/tickets/25/internal-notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(notesRes.status()).toBe(403);
  });
});
