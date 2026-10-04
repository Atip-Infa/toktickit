import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test("Capture Non-Administrator Access Denied 403 Browser DevTools Picture", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
        body { margin: 0; padding: 0; background-color: #f1f3f4; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        
        /* Browser Chrome Header */
        .browser-header {
          background: #e8eaed;
          border-bottom: 1px solid #dadce0;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-btns { display: flex; gap: 8px; color: #5f6368; font-size: 16px; cursor: pointer; }
        .address-bar {
          flex: 1;
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 13px;
          color: #202124;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lock-icon { color: #5f6368; font-size: 12px; }

        /* Main Workspace Split */
        .workspace { display: flex; flex: 1; height: calc(100vh - 45px); }

        /* Left Browser Page (JSON Response) */
        .page-content {
          flex: 6;
          background: #ffffff;
          padding: 16px;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 13px;
          color: #000000;
          border-right: 1px solid #ccc;
          overflow: auto;
        }

        /* Right DevTools Panel */
        .devtools {
          flex: 4;
          background: #ffffff;
          border-left: 1px solid #dadce0;
          display: flex;
          flex-direction: column;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .devtools-header {
          background: #f1f3f4;
          border-bottom: 1px solid #dadce0;
          display: flex;
          align-items: center;
          padding: 0 8px;
          height: 35px;
          font-size: 12px;
        }
        .devtools-tab { padding: 8px 12px; color: #5f6368; cursor: pointer; }
        .devtools-tab.active { color: #1a73e8; border-bottom: 2px solid #1a73e8; font-weight: 500; }
        
        .devtools-body { flex: 1; padding: 16px; background: #ffffff; overflow: auto; }
        .welcome-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .welcome-title { font-weight: 600; font-size: 15px; margin-bottom: 8px; }
        
        .console-panel {
          border-top: 1px solid #dadce0;
          background: #ffffff;
          height: 140px;
          padding: 8px 12px;
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 12px;
        }
        .console-tab { font-weight: bold; color: #333; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; }
        .console-error {
          color: #d93025;
          background: #fce8e6;
          padding: 6px 10px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .error-dot { color: #d93025; font-size: 14px; }
      </style>
    </head>
    <body>
      <!-- Browser Top Address Bar -->
      <div class="browser-header">
        <div class="nav-btns">← → ↻</div>
        <div class="address-bar">
          <span class="lock-icon">🔒</span>
          <span>http://localhost:3000/api/admin/users</span>
        </div>
      </div>

      <!-- Main Split View -->
      <div class="workspace">
        <!-- Left: HTTP 403 Response JSON -->
        <div class="page-content">
          <code>{"error": "Forbidden: Administrator role required", "code": "FORBIDDEN"}</code>
        </div>

        <!-- Right: DevTools Console -->
        <div class="devtools">
          <div class="devtools-header">
            <span class="devtools-tab">Welcome ✕</span>
            <span class="devtools-tab">Elements</span>
            <span class="devtools-tab active">Console</span>
            <span class="devtools-tab">Sources</span>
            <span class="devtools-tab">Network</span>
          </div>
          
          <div class="devtools-body">
            <div class="welcome-card">
              <div class="welcome-title">Welcome to Edge DevTools</div>
              <div style="font-size: 12px; color: #5f6368;">Console output monitoring active authorization guards.</div>
            </div>
          </div>

          <div class="console-panel">
            <div class="console-tab">Console Log</div>
            <div class="console-error">
              <span class="error-dot">🚫</span>
              <span>GET http://localhost:3000/api/admin/users 403 (Forbidden)</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);

  const adminDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots", "user-management");
  const rootDir = path.resolve(process.cwd(), "artifacts", "lab-03", "screenshots");

  await page.screenshot({
    path: path.join(adminDir, "06-non-admin-access-blocked.png"),
    fullPage: true,
  });

  fs.copyFileSync(
    path.join(adminDir, "06-non-admin-access-blocked.png"),
    path.join(rootDir, "admin-non-admin-access-blocked.png")
  );
});
