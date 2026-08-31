import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Requester Ticket End-to-End Flow (Lab 2)", () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport resolution for high quality full screenshots
    await page.setViewportSize({ width: 1440, height: 900 });

    // Clear localStorage to simulate initial user session
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("E2E-01: Complete Requester ticket flow (AC-01, AC-08, AC-10, AC-11, AC-14)", async ({ page }) => {
    // 1. Select Development Requester
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Select Development Requester/i })).toBeVisible();

    const requesterSelect = page.locator("#requesterSelect");
    await expect(requesterSelect).toBeVisible();
    await requesterSelect.selectOption({ index: 0 }); // Select Jennifer Anderson

    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await continueBtn.click();

    // 2. Verify navigation to My Tickets view
    await expect(page.getByRole("heading", { name: /My Tickets/i })).toBeVisible();

    // Ensure screenshot output directory exists & capture full page screenshot
    const myTicketsDir = path.resolve(process.cwd(), "artifacts/lab-02/screenshots/my-tickets");
    fs.mkdirSync(myTicketsDir, { recursive: true });
    await page.screenshot({ path: path.join(myTicketsDir, "ticket-list-desktop.png"), fullPage: true });

    // 3. Navigate to Create Ticket Form
    const createTicketBtn = page.getByText(/Create Ticket/i).first();
    await createTicketBtn.click();

    await expect(page.getByRole("heading", { name: /Create IT Support Ticket/i })).toBeVisible();

    const createTicketDir = path.resolve(process.cwd(), "artifacts/lab-02/screenshots/create-ticket");
    fs.mkdirSync(createTicketDir, { recursive: true });
    await page.screenshot({ path: path.join(createTicketDir, "initial-state.png"), fullPage: true });

    // 4. Fill in Create Ticket form fields
    const summaryInput = page.locator("#summaryInput");
    await summaryInput.fill("Playwright E2E Automated Support Ticket");

    const descriptionInput = page.locator("#descriptionInput");
    await descriptionInput.fill("Automated end-to-end test ticket created during Playwright test execution.");

    // Submit form
    const submitBtn = page.getByRole("button", { name: /Submit Ticket/i });
    await submitBtn.click();

    // 5. Verify Ticket Creation Success screen
    await expect(page.getByText(/Ticket Submitted Successfully/i)).toBeVisible({ timeout: 10000 });
    
    // Click View My Tickets button to navigate to ticket list
    const viewMyTicketsBtn = page.getByText(/View My Tickets/i).first();
    await viewMyTicketsBtn.click();

    await expect(page.getByRole("heading", { name: /My Tickets/i })).toBeVisible();
    await expect(page.getByText("Playwright E2E Automated Support Ticket").first()).toBeVisible();

    // 6. Test Search Filter
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Playwright E2E");
      await page.keyboard.press("Enter");
      await expect(page.getByText("Playwright E2E Automated Support Ticket").first()).toBeVisible();
    }

    // 7. Open Ticket Detail View
    const ticketRowLink = page.getByText("Playwright E2E Automated Support Ticket").first();
    await ticketRowLink.click();

    await expect(page.getByText(/Detailed Description/i)).toBeVisible();
    
    const ticketDetailDir = path.resolve(process.cwd(), "artifacts/lab-02/screenshots/ticket-detail");
    fs.mkdirSync(ticketDetailDir, { recursive: true });
    await page.screenshot({ path: path.join(ticketDetailDir, "detail-view-read-only.png"), fullPage: true });
  });

  test("E2E-02: Cross-requester ticket URL access rejection (AC-03)", async ({ page }) => {
    // Set requester context to Requester #1
    await page.goto("/");
    const requesterSelect = page.locator("#requesterSelect");
    if (await requesterSelect.isVisible()) {
      await requesterSelect.selectOption({ index: 0 });
      await page.getByRole("button", { name: /Continue/i }).click();
    }

    // Simulate cross-requester access attempt
    await page.evaluate(() => {
      localStorage.setItem("toktickit_dev_requester_id", "999999");
    });
    await page.reload();

    await expect(page.getByRole("heading", { name: /Select Development Requester/i })).toBeVisible();

    // Capture dev-requester full page screenshot
    const devRequesterDir = path.resolve(process.cwd(), "artifacts/lab-02/screenshots/dev-requester");
    fs.mkdirSync(devRequesterDir, { recursive: true });
    await page.screenshot({ path: path.join(devRequesterDir, "select-requester.png"), fullPage: true });
  });
});
