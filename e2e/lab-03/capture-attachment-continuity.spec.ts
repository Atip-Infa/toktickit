import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Capture IT Staff Ticket Detail Attachment Continuity Screenshots", () => {
  const screenshotDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");

  test("Capture Attachment Continuity Section & Audit State", async ({ page }) => {
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
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

    await page.locator("#login-email").fill("michael@toktickit.com");
    await page.locator("#login-password").fill("Password123!");
    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });

    const detailButtons = page.locator("button:has-text('Open Ticket Detail')");
    await expect(detailButtons.first()).toBeVisible({ timeout: 10000 });
    await detailButtons.first().click();

    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });

    // Upload attachment dynamically to current ticket
    const uploadResult = await page.evaluate(async () => {
      const token = localStorage.getItem("toktickit_token");
      const badge = document.querySelector("span.font-monospace");
      const num = badge ? badge.textContent?.trim() : "";
      
      const searchRes = await fetch("http://localhost:3000/api/staff/tickets?search=" + encodeURIComponent(num || ""), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const searchJson = await searchRes.json();
      const currentTicket = searchJson.data?.[0];
      const targetId = currentTicket ? currentTicket.id : 25;
      const targetRequesterId = currentTicket ? currentTicket.requesterId : 1;

      // Upload active attachment
      const formData = new FormData();
      const sampleBlob = new Blob(["Sample diagnostic content for attachment continuity."], { type: "image/png" });
      formData.append("file", sampleBlob, "error_screenshot_network_port.png");
      formData.append("requesterId", String(targetRequesterId));

      const uploadRes = await fetch(`http://localhost:3000/api/tickets/${targetId}/attachments?requesterId=${targetRequesterId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-requester-id": String(targetRequesterId),
        },
        body: formData,
      });

      return { targetId, status: uploadRes.status };
    });

    console.log("Upload Result:", uploadResult);

    // Re-open ticket detail to reload fresh ticket details including attachments
    await page.getByRole("button", { name: /← Back to Ticket Queue/i }).click();
    await expect(page.getByRole("heading", { name: /IT Staff Ticket Queue/i })).toBeVisible({ timeout: 10000 });
    await detailButtons.first().click();
    await expect(page.getByRole("heading", { name: /Staff Controls & Workflow/i })).toBeVisible({ timeout: 10000 });

    // Click Attachments tab
    const attachmentsTab = page.locator("button").filter({ hasText: /Attachments/i });
    await expect(attachmentsTab).toBeVisible({ timeout: 5000 });
    await attachmentsTab.click();

    // Verify attachment element rendered
    await expect(page.locator("text=/error_screenshot_network_port.png/i").first()).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: path.join(screenshotDir, "07-attachment-continuity-tab.png"),
      fullPage: true,
    });

    // Copy to root artifacts/lab-03/screenshots/
    const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");
    fs.copyFileSync(
      path.join(screenshotDir, "07-attachment-continuity-tab.png"),
      path.join(rootDir, "attachment-continuity-demonstration.png")
    );
  });
});
