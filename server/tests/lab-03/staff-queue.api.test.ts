import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 3 IT Staff Queue & Ticket Workflow APIs", () => {
  const prisma = getPrisma();
  let staffToken: string;
  let requesterToken: string;
  let adminToken: string;
  let sampleTicketId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    await prisma.user.updateMany({
      where: { email: { in: ["michael@toktickit.com", "jennifer@toktickit.com", "admin@toktickit.com"] } },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    // Login Staff
    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffRes.body.token;

    // Login Requester
    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqRes.body.token;

    // Login Admin
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@toktickit.com", password: "Password123!" });
    adminToken = adminRes.body.token;
  });

  describe("GET /api/staff/tickets (IT Staff Queue)", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/staff/tickets");
      expect(res.status).toBe(401);
    });

    it("rejects REQUESTER role with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/staff/tickets")
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(res.status).toBe(403);
    });

    it("allows IT_STAFF to query all tickets with filtering and pagination", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?page=1&pageSize=10")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("meta");
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        sampleTicketId = res.body.data[0].id;
      }
    });

    it("allows search and filter by status", async () => {
      const res = await request(app)
        .get("/api/staff/tickets?status=NEW")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((t: any) => {
        expect(t.status).toBe("NEW");
      });
    });
  });

  describe("PATCH /api/staff/tickets/:id (Staff Workflow & Claiming)", () => {
    it("rejects REQUESTER from modifying ticket staff properties", async () => {
      const res = await request(app)
        .patch(`/api/staff/tickets/${sampleTicketId || 1}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ status: "IN_PROGRESS" });
      expect(res.status).toBe(403);
    });

    it("allows IT_STAFF to claim a ticket, set IT Priority, and update status", async () => {
      const targetId = sampleTicketId || 1;
      const res = await request(app)
        .patch(`/api/staff/tickets/${targetId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          ownerId: "claim",
          itPriority: "HIGH",
          status: "IN_PROGRESS",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.itPriority).toBe("HIGH");
      expect(res.body.data.status).toBe("IN_PROGRESS");
      expect(res.body.data.owner).toBeDefined();
    });

    it("allows IT_STAFF to resolve ticket with resolution summary", async () => {
      const targetId = sampleTicketId || 1;
      const res = await request(app)
        .patch(`/api/staff/tickets/${targetId}`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({
          status: "RESOLVED",
          resolutionSummary: "Replaced power supply and verified functionality.",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("RESOLVED");
      expect(res.body.data.resolutionSummary).toBe(
        "Replaced power supply and verified functionality."
      );
    });
  });
});
