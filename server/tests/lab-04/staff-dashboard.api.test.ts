import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 4 IT Staff Dashboard REST APIs", () => {
  const prisma = getPrisma();
  let staffToken: string;
  let adminToken: string;
  let requesterToken: string;
  let staffUserId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    await prisma.user.updateMany({
      where: { email: { in: ["michael@toktickit.com", "admin@toktickit.com", "jennifer@toktickit.com"] } },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    const staffUser = await prisma.user.findUnique({ where: { email: "michael@toktickit.com" } });
    staffUserId = staffUser!.id;

    // Login IT Staff (Michael)
    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffRes.body.token;

    // Login Admin (Admin)
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@toktickit.com", password: "Password123!" });
    adminToken = adminRes.body.token;

    // Login Requester (Jennifer)
    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqRes.body.token;
  });

  describe("GET /api/staff/dashboard Security & Authorization", () => {
    it("rejects unauthenticated requests with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/staff/dashboard");
      expect(res.status).toBe(401);
    });

    it("rejects REQUESTER role with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/staff/dashboard")
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/staff/dashboard Data & Accuracy Requirements", () => {
    it("allows IT_STAFF to retrieve accurate metric counts matching database data", async () => {
      // Query DB counts before API call
      const expectedNew = await prisma.ticket.count({ where: { status: "NEW" } });
      const expectedOpen = await prisma.ticket.count({ where: { status: "OPEN" } });
      const expectedMyAssigned = await prisma.ticket.count({
        where: { ownerId: staffUserId, status: { notIn: ["CLOSED", "CANCELLED"] } },
      });

      const res = await request(app)
        .get("/api/staff/dashboard")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("metrics");
      expect(res.body).toHaveProperty("recentTickets");
      expect(res.body).toHaveProperty("quickStats");

      const { metrics, quickStats, recentTickets } = res.body;

      expect(typeof metrics.newTickets).toBe("number");
      expect(typeof metrics.openTickets).toBe("number");
      expect(typeof metrics.inProgress).toBe("number");
      expect(typeof metrics.waitingForRequester).toBe("number");
      expect(metrics.myAssigned).toBeGreaterThanOrEqual(0);
      expect(quickStats.unassignedTickets).toBeGreaterThanOrEqual(0);

      // Verify Priority breakdown exists
      expect(metrics).toHaveProperty("byPriority");
      expect(typeof metrics.byPriority.LOW).toBe("number");
      expect(typeof metrics.byPriority.HIGH).toBe("number");

      // Verify Recent Tickets list structure
      expect(Array.isArray(recentTickets)).toBe(true);
      expect(recentTickets.length).toBeLessThanOrEqual(5);
    });

    it("allows ADMINISTRATOR to retrieve metrics plus user count statistics", async () => {
      const res = await request(app)
        .get("/api/staff/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.quickStats).toHaveProperty("totalUsers");
      expect(res.body.quickStats).toHaveProperty("activeUsers");

      const expectedTotalUsers = await prisma.user.count();
      const expectedActiveUsers = await prisma.user.count({ where: { isActive: true } });

      expect(res.body.quickStats.totalUsers).toBe(expectedTotalUsers);
      expect(res.body.quickStats.activeUsers).toBe(expectedActiveUsers);
    });
  });
});
