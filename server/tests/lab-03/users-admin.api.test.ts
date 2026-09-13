import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 3 Administrator User Management APIs", () => {
  const prisma = getPrisma();
  let adminToken: string;
  let staffToken: string;
  let requesterToken: string;
  let createdUserId: number;

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    await prisma.user.updateMany({
      where: {
        email: { in: ["admin@toktickit.com", "michael@toktickit.com", "jennifer@toktickit.com"] },
      },
      data: { passwordHash: defaultHash, mustChangePassword: false, isActive: true },
    });

    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@toktickit.com", password: "Password123!" });
    adminToken = adminRes.body.token;

    const staffRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael@toktickit.com", password: "Password123!" });
    staffToken = staffRes.body.token;

    const reqRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer@toktickit.com", password: "Password123!" });
    requesterToken = reqRes.body.token;
  });

  describe("GET /api/admin/users", () => {
    it("rejects non-admin roles (REQUESTER, IT_STAFF) with 403 Forbidden", async () => {
      const resReq = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${requesterToken}`);
      expect(resReq.status).toBe(403);

      const resStaff = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${staffToken}`);
      expect(resStaff.status).toBe(403);
    });

    it("allows ADMINISTRATOR to query users with filtering", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=IT_STAFF")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((u: any) => {
        expect(u.role).toBe("IT_STAFF");
        expect(u).not.toHaveProperty("passwordHash");
      });
    });
  });

  describe("POST /api/admin/users (Create User)", () => {
    it("creates a new user and forces password change on first login", async () => {
      const newUserEmail = `testuser_${Date.now()}@toktickit.com`;
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test New User",
          email: newUserEmail,
          role: "REQUESTER",
          department: "Cyber Security",
          initialPassword: "Password123!",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(newUserEmail);
      expect(res.body.data.mustChangePassword).toBe(true);
      expect(res.body.data.isActive).toBe(true);
      createdUserId = res.body.data.id;
    });

    it("rejects duplicate email with 409 Conflict", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Duplicate Jennifer",
          email: "jennifer@toktickit.com",
          role: "REQUESTER",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/email already in use/i);
    });
  });

  describe("PATCH /api/admin/users/:id (Edit User / Role / Status)", () => {
    it("updates user role and department", async () => {
      const targetId = createdUserId || 1;
      const res = await request(app)
        .patch(`/api/admin/users/${targetId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          role: "IT_STAFF",
          department: "IT Infrastructure",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe("IT_STAFF");
      expect(res.body.data.department).toBe("IT Infrastructure");
    });

    it("prevents self-deactivation of administrator account", async () => {
      // Get current admin user ID
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);
      const adminId = meRes.body.user.id;

      const res = await request(app)
        .patch(`/api/admin/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot deactivate your own account/i);
    });
  });

  describe("POST /api/admin/users/:id/reset-password", () => {
    it("resets user password and sets mustChangePassword to true", async () => {
      const targetId = createdUserId || 1;
      const res = await request(app)
        .post(`/api/admin/users/${targetId}/reset-password`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ newPassword: "ResetPassword123!" });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/password reset successfully/i);
    });
  });
});
