import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 3 Public Comments & Internal Notes APIs", () => {
  const prisma = getPrisma();
  let requesterToken: string;
  let otherRequesterToken: string;
  let staffToken: string;
  let ticketId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    await prisma.user.updateMany({
      where: {
        email: { in: ["jennifer@toktickit.com", "sarah@toktickit.com", "michael@toktickit.com"] },
      },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    // Jennifer (Requester)
    const jenniferRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = jenniferRes.body.token;

    // Sarah (Other Requester)
    const sarahRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah@toktickit.com", password: "Password123!" });
    otherRequesterToken = sarahRes.body.token;

    // Michael (IT Staff)
    const michaelRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = michaelRes.body.token;

    // Ensure Jennifer has a ticket
    const jenniferUser = await prisma.user.findUnique({ where: { email: "jennifer@toktickit.com" } });
    let ticket = await prisma.ticket.findFirst({ where: { requesterId: jenniferUser!.id } });
    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          ticketNumber: `TKT-TEST-${Date.now()}`,
          requesterId: jenniferUser!.id,
          categoryId: 1,
          relatedSystemId: 1,
          summary: "Test Ticket for Comments",
          description: "Test description for public comments and notes.",
          requestedPriority: "MEDIUM",
          itPriority: "MEDIUM",
          status: "NEW",
        },
      });
    }
    ticketId = ticket.id;
  });

  describe("Public Comments (/api/tickets/:id/public-comments)", () => {
    it("allows ticket owner to post a public comment", async () => {
      const commentRes = await request(app)
        .post(`/api/tickets/${ticketId}/public-comments`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ body: "Please help, laptop is still overheating." });
      expect(commentRes.status).toBe(201);
      expect(commentRes.body.data.body).toBe("Please help, laptop is still overheating.");
      expect(commentRes.body.data.author.email).toBe("jennifer@toktickit.com");
    });

    it("allows IT staff to post a public comment", async () => {
      const res = await request(app)
        .post(`/api/tickets/${ticketId}/public-comments`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ body: "We have ordered a replacement fan." });
      expect(res.status).toBe(201);
      expect(res.body.data.author.role).toBe("IT_STAFF");
    });

    it("allows ticket owner and IT staff to view public comments", async () => {
      const res = await request(app)
        .get(`/api/tickets/${ticketId}/public-comments`)
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("rejects non-owner requester from posting or viewing public comments on another user's ticket", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/public-comments`)
        .set("Authorization", `Bearer ${otherRequesterToken}`)
        .send({ body: "Unauthorized comment" });
      expect(postRes.status).toBe(403);

      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}/public-comments`)
        .set("Authorization", `Bearer ${otherRequesterToken}`);
      expect(getRes.status).toBe(403);
    });
  });

  describe("Internal Notes (/api/tickets/:id/internal-notes)", () => {
    it("rejects REQUESTER from posting or viewing internal notes with 403 Forbidden", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/internal-notes`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ body: "This should fail" });
      expect(postRes.status).toBe(403);

      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}/internal-notes`)
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(getRes.status).toBe(403);
    });

    it("allows IT_STAFF to post and view internal notes", async () => {
      const postRes = await request(app)
        .post(`/api/tickets/${ticketId}/internal-notes`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ body: "Internal check: Vendor warranty verified." });
      expect(postRes.status).toBe(201);
      expect(postRes.body.data.body).toBe("Internal check: Vendor warranty verified.");

      const getRes = await request(app)
        .get(`/api/tickets/${ticketId}/internal-notes`)
        .set("Authorization", `Bearer ${staffToken}`);
      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body.data)).toBe(true);
      expect(getRes.body.data.some((n: any) => n.body.includes("Vendor warranty"))).toBe(true);
    });
  });
});
