import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 4 Actions Taken REST APIs", () => {
  const prisma = getPrisma();

  let requesterToken: string;
  let otherRequesterToken: string;
  let staffToken: string;
  let adminToken: string;

  let testTicketId: number;
  let testActionId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");

    // Reset test users
    await prisma.user.updateMany({
      where: { email: "jennifer@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });
    await prisma.user.updateMany({
      where: { email: "sarah@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });
    await prisma.user.updateMany({
      where: { email: "david@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: true, isActive: true },
    });
    await prisma.user.updateMany({
      where: { email: "michael@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });
    await prisma.user.updateMany({
      where: { email: "admin@toktickit.com" },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    // 1. Authenticate Requester (Jennifer Anderson)
    const reqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqLogin.body.token;

    // 2. Authenticate Other Requester (Sarah Johnson)
    const otherReqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah@toktickit.com", password: "Password123!" });
    otherRequesterToken = otherReqLogin.body.token;

    // 3. Authenticate IT Staff (Michael Brown)
    const staffLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffLogin.body.token;

    // 4. Authenticate Administrator (John Smith)
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@toktickit.com", password: "Password123!" });
    adminToken = adminLogin.body.token;

    // Fetch sample ticket TXT-2025-001234 (owned by Jennifer Anderson)
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber: "TXT-2025-001234" },
      include: { actionsTaken: true },
    });

    if (ticket) {
      testTicketId = ticket.id;
      if (ticket.actionsTaken.length > 0) {
        testActionId = ticket.actionsTaken[0].id;
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 1. Retrieval Tests (GET /api/tickets/:id/actions-taken)
  // ---------------------------------------------------------------------------
  describe("GET /api/tickets/:id/actions-taken", () => {
    it("allows ticket owner (Requester) to retrieve Actions Taken for owned ticket (AC-03)", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("actionsTaken");
      expect(Array.isArray(res.body.actionsTaken)).toBe(true);
      if (res.body.actionsTaken.length > 0) {
        expect(res.body.actionsTaken[0]).toHaveProperty("description");
        expect(res.body.actionsTaken[0]).toHaveProperty("performedBy");
      }
    });

    it("allows IT Staff to retrieve Actions Taken for any ticket", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("actionsTaken");
    });

    it("allows Administrator to retrieve Actions Taken for any ticket", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("actionsTaken");
    });

    it("rejects Requester from viewing Actions Taken on another user's ticket (403 Forbidden)", async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${otherRequesterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("returns 400 Bad Request for invalid non-integer Ticket ID", async () => {
      const res = await request(app)
        .get("/api/tickets/invalid-id/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_INPUT");
    });

    it("returns 404 Not Found for non-existent Ticket ID", async () => {
      const res = await request(app)
        .get("/api/tickets/999999/actions-taken")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("TICKET_NOT_FOUND");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Creation Tests (POST /api/tickets/:id/actions-taken)
  // ---------------------------------------------------------------------------
  describe("POST /api/tickets/:id/actions-taken", () => {
    it("allows IT Staff to create valid Action Taken with automatically determined performer (AC-01)", async () => {
      const payload = {
        description: "Replaced laptop thermal paste and cleaned cooling fan exhaust.",
        result: "CPU idle temperature dropped from 85C to 42C.",
        followUpRequired: false,
        attachmentNotes: "Diagnostic screenshot logged in internal system.",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      const action = res.body.actionTaken || res.body.data;
      expect(action).toBeDefined();
      expect(action.description).toBe(payload.description);
      expect(action.result).toBe(payload.result);
      expect(action.followUpRequired).toBe(false);
      expect(action.performedBy.email).toBe("michael@toktickit.com");
    });

    it("automatically sets performedBy to authenticated user even if request body attempts to spoof it", async () => {
      const payload = {
        description: "Performed hardware component inspection.",
        result: "All connectors seated properly.",
        performedById: 9999, // Attempted spoof
        performedBy: { id: 9999 },
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      const action = res.body.actionTaken || res.body.data;
      expect(action.performedBy.email).toBe("michael@toktickit.com");
      expect(action.performedById).not.toBe(9999);
    });

    it("rejects Requester from creating Action Taken with 403 Forbidden (AC-04)", async () => {
      const payload = {
        description: "Requester attempt to write action taken.",
        result: "Should be blocked by server authorization.",
      };

      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("rejects unauthenticated creation attempt with 401 Unauthorized", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .send({
          description: "Unauthenticated action attempt.",
          result: "Failed.",
        });

      expect(res.status).toBe(401);
    });

    it("rejects creation with missing description or result (400 Bad Request)", async () => {
      const res1 = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ result: "Result without description" });

      expect(res1.status).toBe(400);
      expect(res1.body.code).toBe("INVALID_INPUT");

      const res2 = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ description: "Description without result" });

      expect(res2.status).toBe(400);
      expect(res2.body.code).toBe("INVALID_INPUT");
    });

    it("rejects creation when followUpRequired is true but followUpNote is missing (AC-02)", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Reconfigured wireless driver profile.",
          result: "Driver update applied successfully.",
          followUpRequired: true,
          followUpNote: "   ", // Missing / whitespace
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING_FOLLOWUP_NOTE");
    });

    it("successfully creates action when followUpRequired is true and followUpNote is provided", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicketId}/actions-taken`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          description: "Reconfigured wireless driver profile.",
          result: "Driver update applied successfully.",
          followUpRequired: true,
          followUpNote: "Check back in 48 hours to confirm connection stability.",
        });

      expect(res.status).toBe(201);
      const action = res.body.actionTaken || res.body.data;
      expect(action.followUpRequired).toBe(true);
      expect(action.followUpNote).toBe("Check back in 48 hours to confirm connection stability.");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Update Tests (PATCH /api/tickets/:id/actions-taken/:actionId)
  // ---------------------------------------------------------------------------
  describe("PATCH /api/tickets/:id/actions-taken/:actionId", () => {
    it("allows IT Staff to update existing Action Taken details", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions-taken/${testActionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          result: "Updated result: Power adapter benchmark verified within normal specifications.",
        });

      expect(res.status).toBe(200);
      const action = res.body.actionTaken || res.body.data;
      expect(action.result).toContain("Power adapter benchmark verified");
    });

    it("rejects Requester from updating Action Taken with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions-taken/${testActionId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({
          result: "Requester illegal edit attempt.",
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("rejects update when setting followUpRequired to true without followUpNote", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions-taken/${testActionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          followUpRequired: true,
          followUpNote: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("MISSING_FOLLOWUP_NOTE");
    });

    it("returns 404 Not Found when updating non-existent Action Taken ID", async () => {
      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions-taken/999999`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          result: "Updated result.",
        });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ACTION_TAKEN_NOT_FOUND");
    });

    it("handles stale or conflicting updates via expectedUpdatedAt (409 Conflict)", async () => {
      const staleTimestamp = new Date("2020-01-01T00:00:00Z").toISOString();

      const res = await request(app)
        .patch(`/api/tickets/${testTicketId}/actions-taken/${testActionId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          result: "Stale update attempt result.",
          expectedUpdatedAt: staleTimestamp,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("STALE_UPDATE_CONFLICT");
    });
  });
});
