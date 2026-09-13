import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 3 IT Staff Ticket Detail & Workflow Authorization APIs", () => {
  const prisma = getPrisma();
  let staffToken: string;
  let requesterToken: string;
  let otherRequesterToken: string;
  let testTicketId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    await prisma.user.updateMany({
      where: { email: { in: ["michael@toktickit.com", "jennifer@toktickit.com", "sarah@toktickit.com"] } },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    // Login Staff
    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffRes.body.token;

    // Login Requester (Jennifer)
    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqRes.body.token;

    // Login Other Requester (Sarah)
    const otherRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah@toktickit.com", password: "Password123!" });
    otherRequesterToken = otherRes.body.token;

    // Create fresh test ticket for Jennifer
    const jennifer = await prisma.user.findUnique({ where: { email: "jennifer@toktickit.com" } });
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-DETAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        requesterId: jennifer!.id,
        categoryId: 1,
        relatedSystemId: 1,
        summary: "Detail Test Ticket",
        description: "Testing staff ticket detail workflow transitions and security authorization.",
        requestedPriority: "MEDIUM",
        itPriority: "MEDIUM",
        status: "NEW",
      },
    });
    testTicketId = ticket.id;
  });

  describe("GET /api/tickets/:id (Ticket Detail View)", () => {
    it("allows ticket owner and IT staff to view ticket detail", async () => {
      const staffView = await request(app)
        .get(`/api/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`);
      expect(staffView.status).toBe(200);
      expect(staffView.body.data.id).toBe(testTicketId);

      const ownerView = await request(app)
        .get(`/api/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(ownerView.status).toBe(200);
      expect(ownerView.body.data.id).toBe(testTicketId);
    });

    it("rejects non-owner requester from viewing ticket detail with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${otherRequesterToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/staff/tickets/:id (Staff Workflow & Status Transition Matrix)", () => {
    it("allows IT staff to claim ticket, update IT Priority, and transition NEW -> IN_PROGRESS", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          ownerId: "claim",
          itPriority: "HIGH",
          status: "IN_PROGRESS",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.itPriority).toBe("HIGH");
      expect(res.body.data.status).toBe("IN_PROGRESS");
      expect(res.body.data.owner.email).toBe("michael@toktickit.com");
    });

    it("rejects resolving ticket without resolution summary", async () => {
      // First move to IN_PROGRESS
      await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED", resolutionSummary: "   " });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/resolution summary is required/i);
    });

    it("allows resolving ticket with valid resolution summary", async () => {
      // First move to IN_PROGRESS
      await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      const res = await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "RESOLVED",
          resolutionSummary: "Issue resolved by applying firmware patch.",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");
      expect(res.body.data.resolutionSummary).toBe("Issue resolved by applying firmware patch.");
    });

    it("rejects invalid status transitions (e.g. CLOSED to IN_PROGRESS)", async () => {
      // Move NEW -> IN_PROGRESS -> RESOLVED -> CLOSED
      await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "RESOLVED", resolutionSummary: "Resolved test." });

      await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "CLOSED", resolutionSummary: "Closed test." });

      // Attempt invalid transition: CLOSED -> IN_PROGRESS
      const invalidRes = await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error).toMatch(/Invalid status transition/i);
    });

    it("rejects REQUESTER from making staff workflow updates with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ itPriority: "URGENT" });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/tickets/:id/resolve (Requester Problem Appears Resolved)", () => {
    it("allows ticket owner to indicate problem appears resolved", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/resolve`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);

      // Verify a public comment was generated
      const commentsRes = await request(app)
        .get(`/api/tickets/${testTicketId}/public-comments`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(commentsRes.body.data.some((c: any) => c.body.includes("Problem Appears Resolved"))).toBe(true);
    });

    it("rejects non-owner requester from calling resolve endpoint", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/resolve`)
        .set("Authorization", `Bearer ${otherRequesterToken}`);
      expect(res.status).toBe(403);
    });
  });
});
