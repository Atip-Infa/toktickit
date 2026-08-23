import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets/:id (Ticket Detail API - Issue #17)", () => {
  let requesterIdA: number;
  let requesterIdB: number;
  let ticketIdA: number;

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

    // Create ticket for Requester A
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-2026-DETAIL-${Date.now()}`,
        requesterId: requesterIdA,
        categoryId: category!.id,
        relatedSystemId: system!.id,
        requestedPriority: "HIGH",
        status: "NEW",
        summary: "Monitor display flickering issue",
        description: "My external monitor flickers whenever connected via HDMI.",
      },
    });

    ticketIdA = ticket.id;
  });

  it("returns complete ticket detail object for owned ticket (API-09, AC-02)", async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketIdA}?requesterId=${requesterIdA}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");

    const t = res.body.data;
    expect(t.id).toBe(ticketIdA);
    expect(t.ticketNumber).toBeDefined();
    expect(t.summary).toBe("Monitor display flickering issue");
    expect(t.description).toBe("My external monitor flickers whenever connected via HDMI.");
    expect(t.requester.id).toBe(requesterIdA);
    expect(t.category).toBeDefined();
    expect(t.relatedSystem).toBeDefined();
    expect(Array.isArray(t.attachments)).toBe(true);
  });

  it("returns 403 Forbidden when accessing ticket owned by another requester (API-10, BR-06, AC-03)", async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticketIdA}?requesterId=${requesterIdB}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access denied/i);
  });

  it("returns 404 Not Found for non-existent ticket ID", async () => {
    const res = await request(app)
      .get(`/api/tickets/999999?requesterId=${requesterIdA}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Ticket not found/i);
  });
});
