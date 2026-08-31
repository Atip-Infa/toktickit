import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets (My Tickets API - Issue #16)", () => {
  let requesterIdA: number;
  let requesterIdB: number;
  let categoryId1: number;
  let systemId1: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    const requesters = await prisma.developmentRequester.findMany({
      where: { isActive: true },
      take: 2,
    });
    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    requesterIdA = requesters[0].id;
    requesterIdB = requesters[1].id;
    categoryId1 = category!.id;
    systemId1 = system!.id;

    // Seed test tickets for Requester A
    await prisma.ticket.createMany({
      data: [
        {
          ticketNumber: `TKT-2026-MOCKA1-${Date.now()}`,
          requesterId: requesterIdA,
          categoryId: categoryId1,
          relatedSystemId: systemId1,
          requestedPriority: "HIGH",
          status: "NEW",
          summary: "Laptop battery drains quickly",
          description: "Description for laptop issue.",
        },
        {
          ticketNumber: `TKT-2026-MOCKA2-${Date.now()}`,
          requesterId: requesterIdA,
          categoryId: categoryId1,
          relatedSystemId: systemId1,
          requestedPriority: "LOW",
          status: "IN_PROGRESS",
          summary: "VPN connection dropping repeatedly",
          description: "Description for VPN issue.",
        },
      ],
    });

    // Seed test ticket for Requester B
    await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-2026-MOCKB1-${Date.now()}`,
        requesterId: requesterIdB,
        categoryId: categoryId1,
        relatedSystemId: systemId1,
        requestedPriority: "MEDIUM",
        status: "NEW",
        summary: "Email quota exceeded for Requester B",
        description: "Description for Requester B email issue.",
      },
    });
  });

  it("returns tickets owned exclusively by requesting requester (API-04, BR-06, AC-11)", async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${requesterIdA}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("meta");
    expect(Array.isArray(res.body.data)).toBe(true);

    // All returned tickets must belong to Requester A
    for (const ticket of res.body.data) {
      expect(ticket.requesterId).toBe(requesterIdA);
    }
  });

  it("filters tickets by search query string (API-05, BR-21, AC-10)", async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${requesterIdA}&search=Laptop`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].summary).toMatch(/Laptop/i);
  });

  it("filters tickets additively by priority (API-06, AC-10)", async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${requesterIdA}&priority=HIGH`);

    expect(res.status).toBe(200);
    for (const ticket of res.body.data) {
      expect(ticket.requestedPriority).toBe("HIGH");
    }
  });

  it("paginates ticket results accurately (API-08, BR-20)", async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${requesterIdA}&page=1&pageSize=1`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(1);
    expect(res.body.meta.totalItems).toBeGreaterThanOrEqual(2);
  });

  it("returns 400 Bad Request when requesterId is missing", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/requesterId is required/i);
  });
});
