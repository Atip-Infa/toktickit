import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 4 Requester Dashboard REST APIs", () => {
  const prisma = getPrisma();
  let requesterToken: string;
  let otherRequesterToken: string;
  let staffToken: string;
  let requesterUserId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    await prisma.user.updateMany({
      where: { email: { in: ["jennifer@toktickit.com", "sarah@toktickit.com", "michael@toktickit.com"] } },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    const jennifer = await prisma.user.findUnique({ where: { email: "jennifer@toktickit.com" } });
    requesterUserId = jennifer!.id;

    // Login Jennifer (Requester 1)
    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqRes.body.token;

    // Login Sarah (Requester 2)
    const otherRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah@toktickit.com", password: "Password123!" });
    otherRequesterToken = otherRes.body.token;

    // Login Michael (IT Staff)
    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffRes.body.token;
  });

  describe("GET /api/requester/dashboard Security & Authorization", () => {
    it("allows authenticated Requester to retrieve owned dashboard metrics", async () => {
      const res = await request(app)
        .get("/api/requester/dashboard")
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("metrics");
      expect(res.body).toHaveProperty("recentTickets");

      const { metrics } = res.body;

      // DB Verification Queries for Jennifer
      const expectedTotal = await prisma.ticket.count({ where: { requesterId: requesterUserId } });
      const expectedOpen = await prisma.ticket.count({
        where: {
          requesterId: requesterUserId,
          status: { in: ["NEW", "OPEN", "IN_PROGRESS", "WAITING_FOR_REQUESTER", "REOPENED"] },
        },
      });
      const expectedWaiting = await prisma.ticket.count({
        where: { requesterId: requesterUserId, status: "WAITING_FOR_REQUESTER" },
      });
      const expectedResolved = await prisma.ticket.count({
        where: { requesterId: requesterUserId, status: "RESOLVED" },
      });
      const expectedClosed = await prisma.ticket.count({
        where: { requesterId: requesterUserId, status: "CLOSED" },
      });

      expect(metrics.totalTickets).toBe(expectedTotal);
      expect(metrics.openTickets).toBe(expectedOpen);
      expect(metrics.waitingForRequester).toBe(expectedWaiting);
      expect(metrics.resolved).toBe(expectedResolved);
      expect(metrics.closed).toBe(expectedClosed);
    });

    it("prevents Requester from accessing another user's metrics via query params or headers", async () => {
      // Jennifer (ID: requesterUserId) attempts to spoof requesterId parameter for Sarah (ID: 9999)
      const res = await request(app)
        .get("/api/requester/dashboard?requesterId=9999")
        .set("Authorization", `Bearer ${requesterToken}`)
        .set("X-Requester-Id", "9999");

      expect(res.status).toBe(200);

      // Backend MUST enforce authenticated user ID (Jennifer's ID), ignoring spoofed param
      const expectedTotal = await prisma.ticket.count({ where: { requesterId: requesterUserId } });
      expect(res.body.metrics.totalTickets).toBe(expectedTotal);
    });

    it("rejects IT Staff role without specified target requesterId with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/requester/dashboard")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Requester role required/i);
    });
  });
});
