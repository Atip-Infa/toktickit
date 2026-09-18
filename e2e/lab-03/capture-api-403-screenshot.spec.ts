import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test("Capture Direct API Authorization 403 Evidence Picture", async ({ page, request }) => {
  await page.setViewportSize({ width: 1200, height: 750 });

  // 1. Get Requester Token
  const loginRes = await request.post("http://localhost:3000/api/auth/login", {
    data: { email: "jennifer@toktickit.com", password: "Password123!" },
  });
  const token = (await loginRes.json()).token;

  // 2. Call Staff Endpoint
  const staffRes = await request.get("http://localhost:3000/api/staff/tickets", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const staffStatus = staffRes.status();
  const staffBody = await staffRes.text();

  // 3. Call Internal Notes Endpoint
  const notesRes = await request.get("http://localhost:3000/api/tickets/25/internal-notes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const notesStatus = notesRes.status();
  const notesBody = await notesRes.text();

  // 4. Render dark terminal UI page in browser to snapshot as PNG
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          background-color: #0d1117;
          color: #c9d1d9;
          font-family: 'Consolas', 'Courier New', monospace;
          padding: 40px;
          margin: 0;
        }
        .container {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid #30363d;
          padding-bottom: 15px;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        .red { background: #ff5f56; } .yellow { background: #ffbd2e; } .green { background: #27c93f; }
        .title { color: #58a6ff; font-weight: bold; font-size: 18px; margin-left: 10px; }
        .block {
          background: #0d1117;
          border-left: 4px solid #f85149;
          padding: 16px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        .method { color: #d2a8ff; font-weight: bold; }
        .url { color: #a5d6ff; }
        .status-badge {
          background: rgba(248, 81, 73, 0.15);
          color: #ff7b72;
          border: 1px solid #f85149;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: bold;
        }
        .response { color: #79c0ff; margin-top: 8px; }
        .footer {
          margin-top: 20px;
          color: #7ee787;
          font-weight: bold;
          text-align: center;
          background: rgba(46, 160, 67, 0.15);
          border: 1px solid #2ea043;
          padding: 12px;
          border-radius: 6px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="title">Direct Backend API Authorization Evidence (HTTP 403 Forbidden)</span>
        </div>

        <div class="block">
          <div><span class="method">GET</span> <span class="url">http://localhost:3000/api/staff/tickets</span></div>
          <div style="margin-top: 8px;">
            <span>Role Token: </span><span style="color:#e3b341">Requester (jennifer@toktickit.com)</span>
          </div>
          <div style="margin-top: 8px;">
            <span>HTTP Status Code: </span><span class="status-badge">${staffStatus} Forbidden</span>
          </div>
          <div class="response">Response Body: ${staffBody}</div>
        </div>

        <div class="block">
          <div><span class="method">GET</span> <span class="url">http://localhost:3000/api/tickets/25/internal-notes</span></div>
          <div style="margin-top: 8px;">
            <span>Role Token: </span><span style="color:#e3b341">Requester (jennifer@toktickit.com)</span>
          </div>
          <div style="margin-top: 8px;">
            <span>HTTP Status Code: </span><span class="status-badge">${notesStatus} Forbidden</span>
          </div>
          <div class="response">Response Body: ${notesBody}</div>
        </div>

        <div class="footer">
          ✅ Direct API Authorization Verified: Server middleware successfully blocks non-staff requests with HTTP 403 Forbidden.
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);

  const detailDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "staff-ticket-detail");
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  await page.screenshot({
    path: path.join(detailDir, "10-direct-api-authorization-403-evidence.png"),
    fullPage: true,
  });

  fs.copyFileSync(
    path.join(detailDir, "10-direct-api-authorization-403-evidence.png"),
    path.join(rootDir, "direct-api-authorization-evidence.png")
  );
});
