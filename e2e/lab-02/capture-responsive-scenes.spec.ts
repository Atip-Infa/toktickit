import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = path.resolve("C:/Users/Atip/.gemini/antigravity-ide/brain/5437562f-9cb8-4c7d-8950-95f7cfaf6983");
const LOCAL_SCREENSHOTS_DIR = path.resolve(process.cwd(), "artifacts/lab-02/screenshots/responsive-scenes");

function ensureDirs() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.mkdirSync(LOCAL_SCREENSHOTS_DIR, { recursive: true });
}

async function saveScreenshot(page: any, filename: string) {
  ensureDirs();
  const localPath = path.join(LOCAL_SCREENSHOTS_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  await page.screenshot({ path: localPath, fullPage: true });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`Saved screenshot: ${filename}`);
}

test.describe("Capture Desktop, iPad, and Phone Scenes", () => {
  const viewports = [
    { name: "desktop", width: 1440, height: 900, device: "Desktop (1440x900)" },
    { name: "ipad", width: 820, height: 1180, device: "iPad / Tablet (820x1180)" },
    { name: "phone", width: 390, height: 844, device: "Phone / Mobile (390x844)" },
  ];

  for (const vp of viewports) {
    test(`Capture scenes for ${vp.device}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Requester Selector Scene
      await page.goto("/");
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.waitForTimeout(500);

      await saveScreenshot(page, `${vp.name}-select-requester.png`);

      // Select requester and continue
      const requesterSelect = page.locator("#requesterSelect");
      if (await requesterSelect.isVisible()) {
        await requesterSelect.selectOption({ index: 0 });
        const continueBtn = page.getByRole("button", { name: /Continue/i });
        await continueBtn.click();
      }

      // 2. My Tickets Dashboard Scene
      await expect(page.getByRole("heading", { name: /My Tickets/i })).toBeVisible();
      await page.waitForTimeout(500);
      await saveScreenshot(page, `${vp.name}-my-tickets.png`);

      // 3. Create Ticket Form Scene
      const createTicketBtn = page.getByRole("button", { name: /Create Ticket/i }).filter({ hasText: /Create Ticket/i });
      const visibleCreateBtn = createTicketBtn.locator("visible=true").first();
      
      if (await visibleCreateBtn.isVisible()) {
        await visibleCreateBtn.click();
      } else {
        // Fallback or click button inside my-tickets view if available
        const mainCreateBtn = page.locator("main").getByRole("button", { name: /Create Ticket/i }).first();
        if (await mainCreateBtn.isVisible()) {
          await mainCreateBtn.click();
        } else {
          await page.getByText(/Create Ticket/i).last().click();
        }
      }

      await expect(page.getByRole("heading", { name: /Create IT Support Ticket/i })).toBeVisible();
      await page.waitForTimeout(500);
      await saveScreenshot(page, `${vp.name}-create-ticket.png`);

      // Fill sample values for form screenshot
      await page.locator("#summaryInput").fill("VPN Connection dropping randomly during video calls");
      await page.locator("#descriptionInput").fill("Every 15-20 minutes the VPN connection resets, causing audio/video lag and disconnection in meetings.");

      await saveScreenshot(page, `${vp.name}-create-ticket-filled.png`);

      // Cancel back to tickets list
      const cancelBtn = page.getByRole("button", { name: /Cancel/i });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
      } else {
        await page.goto("/");
      }

      // 4. Ticket Detail View Scene
      await expect(page.getByRole("heading", { name: /My Tickets/i })).toBeVisible();
      const ticketLink = page.locator(".table tbody tr, .card").first();
      if (await ticketLink.isVisible()) {
        await ticketLink.click();
        await page.waitForTimeout(500);
        await saveScreenshot(page, `${vp.name}-ticket-detail.png`);
      }
    });
  }
});
