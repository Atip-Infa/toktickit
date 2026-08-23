import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/requesters", () => {
  it("returns active Development Requesters only (excludes inactive)", async () => {
    const res = await request(app).get("/api/requesters");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);

    // Verify all returned requesters have isActive: true
    for (const requester of res.body.data) {
      expect(requester.isActive).toBe(true);
      expect(requester).toHaveProperty("id");
      expect(requester).toHaveProperty("name");
      expect(requester).toHaveProperty("email");
      expect(requester).toHaveProperty("department");
    }

    // Check that inactive requester 'Robert Paulson' is not present
    const robert = res.body.data.find(
      (r: { name: string }) => r.name === "Robert Paulson"
    );
    expect(robert).toBeUndefined();
  });
});

describe("GET /api/related-systems", () => {
  it("returns active related systems", async () => {
    const res = await request(app).get("/api/related-systems");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);
  });
});
