import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 4 Ticket Workflow & Resolution Gate REST APIs", () => {
  const prisma = getPrisma();

  let requesterToken: string;
  let staffToken: string;
  let adminToken: string;

  let inProgressTicketId: number;
  let newTicketId: number;
  let resolvedTicketId: number;
  let cancelledTicketId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");

    // Reset test users
    await prisma.user.updateMany({
      where: { email: "jennifer@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });
    await prisma.user.updateMany({
      where: { email: "michael@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });
    await prisma.user.updateMany({
      where: { email: "admin@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    // Login Requester
    const reqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqLogin.body.token;

    // Login IT Staff
    const staffLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffLogin.body.token;

    // Login Admin
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@toktickit.com", password: "Password123!" });
    adminToken = adminLogin.body.token;

    // Reset tickets to known states for test isolation
    const t1 = await prisma.ticket.findUnique({ where: { ticketNumber: "TXT-2025-001234" } });
    if (t1) inProgressTicketId = t1.id;

    const t2 = await prisma.ticket.findUnique({ where: { ticketNumber: "TXT-2025-001228" } });
    if (t2) newTicketId = t2.id;

    const t3 = await prisma.ticket.findUnique({ where: { ticketNumber: "TXT-2025-001231" } });
    if (t3) resolvedTicketId = t3.id;

    // Create or find a cancelled ticket for matrix testing
    let t4 = await prisma.ticket.findFirst({ where: { status: "CANCELLED" } });
    if (!t4) {
      t4 = await prisma.ticket.create({
        data: {
          ticketNumber: `TMP-CANCELLED-${Date.now()}`,
          requesterId: 1,
          categoryId: 1,
          relatedSystemId: 1,
          summary: "Cancelled test ticket",
          description: "Cancelled test description for status matrix testing.",
          status: "CANCELLED",
        },
      });
    }
    cancelledTicketId = t4.id;
  });

  // ---------------------------------------------------------------------------
  // 1. Valid & Invalid Status Transitions
  // ---------------------------------------------------------------------------
  describe("Status Transition Matrix Rules", () => {
    it("allows IT Staff to transition NEW ticket to IN_PROGRESS", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${newTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("IN_PROGRESS");
    });

    it("allows IT Staff to transition IN_PROGRESS ticket to WAITING_FOR_REQUESTER", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${inProgressTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "WAITING_FOR_REQUESTER" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("WAITING_FOR_REQUESTER");
    });

    it("rejects invalid status transitions (e.g. CANCELLED ticket to OPEN)", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${cancelledTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ status: "OPEN" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("rejects Requester from executing staff status transitions (403 Forbidden)", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${inProgressTicketId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ status: "WAITING_FOR_REQUESTER" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Resolution Gate Enforcement (BR-07, FR-07, FR-08)
  // ---------------------------------------------------------------------------
  describe("Resolution Gate Rules", () => {
    it("rejects transitioning ticket to RESOLVED if it has zero (0) Actions Taken", async () => {
      // Ensure newTicketId has 0 actions taken
      await prisma.actionTaken.deleteMany({ where: { ticketId: newTicketId } });

      const res = await request(app)
        .patch(`/api/staff/tickets/${newTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "RESOLVED",
          resolutionSummary: "Attempting resolution without any actions taken.",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("RESOLUTION_GATE_FAILED");
      expect(res.body.error).toContain("At least one Action Taken record");
    });

    it("rejects transitioning ticket to RESOLVED if resolutionSummary is missing", async () => {
      // Add action taken to inProgressTicketId if needed
      const actionsCount = await prisma.actionTaken.count({ where: { ticketId: inProgressTicketId } });
      if (actionsCount === 0) {
        await prisma.actionTaken.create({
          data: {
            ticketId: inProgressTicketId,
            description: "Test action taken for resolution gate test.",
            result: "Action completed.",
            performedById: 2,
          },
        });
      }

      const res = await request(app)
        .patch(`/api/staff/tickets/${inProgressTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "RESOLVED",
          resolutionSummary: "   ", // Empty whitespace
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("RESOLUTION_GATE_FAILED");
    });

    it("successfully transitions ticket to RESOLVED when both resolutionSummary and Actions Taken exist", async () => {
      // Ensure ticket has >= 1 action taken
      const actionsCount = await prisma.actionTaken.count({ where: { ticketId: inProgressTicketId } });
      if (actionsCount === 0) {
        await prisma.actionTaken.create({
          data: {
            ticketId: inProgressTicketId,
            description: "Verified battery charging profile.",
            result: "Battery diagnostics healthy.",
            performedById: 2,
          },
        });
      }

      const res = await request(app)
        .patch(`/api/staff/tickets/${inProgressTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "RESOLVED",
          resolutionSummary: "Replaced battery pack and verified charging voltage specs.",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");
      expect(res.body.data.resolutionSummary).toBe(
        "Replaced battery pack and verified charging voltage specs."
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Requester Resolution Indication (Advisory Only)
  // ---------------------------------------------------------------------------
  describe("POST /api/tickets/:id/resolve (Requester Advisory Resolution)", () => {
    it("creates a Public Comment and DOES NOT change ticket status to RESOLVED directly", async () => {
      // Set ticket to IN_PROGRESS
      await prisma.ticket.update({
        where: { id: inProgressTicketId },
        data: { status: "IN_PROGRESS" },
      });

      const res = await request(app)
        .post(`/api/tickets/${inProgressTicketId}/resolve`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send();

      expect(res.status).toBe(200);

      // Verify ticket status in DB remained IN_PROGRESS
      const ticketInDb = await prisma.ticket.findUnique({
        where: { id: inProgressTicketId },
      });
      expect(ticketInDb?.status).toBe("IN_PROGRESS");

      // Verify Public Comment was posted
      const comment = await prisma.publicComment.findFirst({
        where: { ticketId: inProgressTicketId },
        orderBy: { createdAt: "desc" },
      });
      expect(comment?.content).toContain("Requester indicated: Problem Appears Resolved");
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Concurrency & Conflict Safeguards
  // ---------------------------------------------------------------------------
  describe("Stale Update Concurrency Safeguards", () => {
    it("returns 409 Conflict when expectedUpdatedAt does not match DB timestamp", async () => {
      const staleTimestamp = new Date("2020-01-01T00:00:00Z").toISOString();

      const res = await request(app)
        .patch(`/api/staff/tickets/${inProgressTicketId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "WAITING_FOR_REQUESTER",
          expectedUpdatedAt: staleTimestamp,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("STALE_UPDATE_CONFLICT");
    });
  });
});
