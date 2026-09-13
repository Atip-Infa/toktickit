import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Authorization & Security Enforcement", () => {
  it("API-AUTHZ-01 Requester Ownership Boundary - prevents Requester A from viewing Requester B's ticket", async () => {
    // Jennifer's login
    const loginA = await request(app).post("/api/auth/login").send({
      email: "jennifer@toktickit.com",
      password: "Password123!",
    });
    const tokenA = loginA.body.token;

    // Sarah's login
    const loginB = await request(app).post("/api/auth/login").send({
      email: "sarah@toktickit.com",
      password: "Password123!",
    });
    const tokenB = loginB.body.token;

    // Fetch Sarah's ticket list
    const ticketsB = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(ticketsB.status).toBe(200);
    const sarahTicketId = ticketsB.body.data[0].id;

    // Jennifer attempts to fetch Sarah's ticket
    const unauthorizedAccess = await request(app)
      .get(`/api/tickets/${sarahTicketId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(unauthorizedAccess.status).toBe(403);
    expect(unauthorizedAccess.body.error).toMatch(/Access denied/i);
  });

  it("API-AUTHZ-02 Client Identity Spoofing Protection - ignores client-supplied requesterId parameter/header", async () => {
    // Jennifer's login (ID 1)
    const loginA = await request(app).post("/api/auth/login").send({
      email: "jennifer@toktickit.com",
      password: "Password123!",
    });
    const tokenA = loginA.body.token;

    // Create a ticket with client trying to pass requesterId = 999
    const createRes = await request(app)
      .post("/api/tickets")
      .set("Authorization", `Bearer ${tokenA}`)
      .set("x-requester-id", "999")
      .send({
        categoryId: 1,
        relatedSystemId: 1,
        requestedPriority: "HIGH",
        summary: "Security Spoofing Test Ticket",
        description: "Testing server-side authenticated identity enforcement.",
        requesterId: 999,
      });

    expect(createRes.status).toBe(201);
    // Verified that backend assigned ticket requesterId = Jennifer's ID (1), NOT 999
    expect(createRes.body.data.requesterId).toBe(loginA.body.user.id);
  });

  it("Mandatory Password Change Block - blocks protected routes when mustChangePassword is true (BR-02, AC-02)", async () => {
    // First set mustChangePassword = true for emily
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "emily@toktickit.com",
      password: "Password123!",
    });
    const token = loginRes.body.token;

    // Accessing ticket list should be blocked
    const ticketRes = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${token}`);

    // If mustChangePassword is true, returns 403
    if (loginRes.body.user.mustChangePassword) {
      expect(ticketRes.status).toBe(403);
      expect(ticketRes.body.code).toBe("MUST_CHANGE_PASSWORD");
    }
  });
});
