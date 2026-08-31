import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { generateTicketNumber } from "../../src/utils/ticketNumber.js";
import { getPrisma } from "../../src/prisma.js";

describe("Ticket Number Generator (Unit)", () => {
  it("generates correct ticket number format TKT-YYYY-XXXXXX", () => {
    expect(generateTicketNumber(1, 2026)).toBe("TKT-2026-000001");
    expect(generateTicketNumber(1234, 2026)).toBe("TKT-2026-001234");
    expect(generateTicketNumber(999999, 2026)).toBe("TKT-2026-999999");
  });
});

describe("POST /api/tickets (Create Ticket API)", () => {
  let activeRequesterId: number;
  let activeCategoryId: number;
  let activeSystemId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    const requester = await prisma.developmentRequester.findFirst({
      where: { isActive: true },
    });
    const category = await prisma.category.findFirst({
      where: { isActive: true },
    });
    const system = await prisma.relatedSystem.findFirst({
      where: { isActive: true },
    });

    if (requester && category && system) {
      activeRequesterId = requester.id;
      activeCategoryId = category.id;
      activeSystemId = system.id;
    }
  });

  it("creates a ticket successfully with valid input (AC-01, BR-01, BR-02)", async () => {
    const payload = {
      requesterId: activeRequesterId,
      categoryId: activeCategoryId,
      relatedSystemId: activeSystemId,
      requestedPriority: "HIGH",
      summary: "Laptop battery drains quickly",
      description: "My laptop battery is draining much faster than usual even when idle.",
    };

    const res = await request(app).post("/api/tickets").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");

    const ticket = res.body.data;
    expect(ticket).toHaveProperty("id");
    expect(ticket.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(ticket.requesterId).toBe(activeRequesterId);
    expect(ticket.categoryId).toBe(activeCategoryId);
    expect(ticket.relatedSystemId).toBe(activeSystemId);
    expect(ticket.requestedPriority).toBe("HIGH");
    expect(ticket.itPriority).toBe("MEDIUM");
    expect(ticket.status).toBe("NEW");
    expect(ticket.summary).toBe("Laptop battery drains quickly");
    expect(ticket.description).toBe("My laptop battery is draining much faster than usual even when idle.");
  });

  it("rejects ticket creation with missing summary (AC-04, BR-08)", async () => {
    const payload = {
      requesterId: activeRequesterId,
      categoryId: activeCategoryId,
      relatedSystemId: activeSystemId,
      summary: "", // Too short
      description: "Valid description text for support ticket.",
    };

    const res = await request(app).post("/api/tickets").send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/Summary must be between 5 and 120/i);
  });

  it("rejects ticket creation with short description (AC-04, BR-08)", async () => {
    const payload = {
      requesterId: activeRequesterId,
      categoryId: activeCategoryId,
      relatedSystemId: activeSystemId,
      summary: "Valid summary text",
      description: "Short", // < 10 chars
    };

    const res = await request(app).post("/api/tickets").send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/Description must be between 10 and 2000/i);
  });

  it("rejects ticket creation with non-existent category (BR-09)", async () => {
    const payload = {
      requesterId: activeRequesterId,
      categoryId: 99999, // Invalid
      relatedSystemId: activeSystemId,
      summary: "Valid summary text",
      description: "Valid description text for support ticket.",
    };

    const res = await request(app).post("/api/tickets").send(payload);

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/Invalid or inactive Category/i);
  });

  it("supports X-Requester-Id header if requesterId omitted from body", async () => {
    const payload = {
      categoryId: activeCategoryId,
      relatedSystemId: activeSystemId,
      summary: "Header requester ticket",
      description: "Testing X-Requester-Id header fallback in ticket creation API.",
    };

    const res = await request(app)
      .post("/api/tickets")
      .set("X-Requester-Id", String(activeRequesterId))
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.requesterId).toBe(activeRequesterId);
  });
});
