import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";

describe("Lab 3 Authentication APIs", () => {
  const prisma = getPrisma();

  beforeEach(async () => {
    const defaultHash = hashPassword("Password123!");
    // Reset test users to initial test states
    await prisma.user.updateMany({
      where: { email: "david@toktickit.com" },
      data: {
        passwordHash: defaultHash,
        mustChangePassword: true,
        isActive: true,
      },
    });
    await prisma.user.updateMany({
      where: { email: "jennifer@toktickit.com" },
      data: {
        passwordHash: defaultHash,
        mustChangePassword: false,
        isActive: true,
      },
    });
    await prisma.user.updateMany({
      where: { email: "robert@toktickit.com" },
      data: {
        passwordHash: defaultHash,
        isActive: false,
      },
    });
  });

  it("POST /api/auth/login - valid login returns user identity and role (API-AUTH-01, AC-01)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jennifer@toktickit.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({
      email: "jennifer@toktickit.com",
      role: "REQUESTER",
      mustChangePassword: false,
      isActive: true,
    });
    expect(res.body.user).not.toHaveProperty("passwordHash");
  });

  it("POST /api/auth/login - invalid credentials returns 401 Unauthorized (API-AUTH-02, BR-01)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jennifer@toktickit.com",
        password: "WrongPassword!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid credentials/i);
  });

  it("POST /api/auth/login - inactive user is rejected (API-AUTH-03, BR-01, AC-03)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "robert@toktickit.com",
        password: "Password123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid credentials or inactive account/i);
  });

  it("POST /api/auth/login - mandatory password change user flagged (API-AUTH-04, BR-02, AC-02)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "david@toktickit.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.user.mustChangePassword).toBe(true);
  });

  it("GET /api/auth/me - retrieves authenticated user context (API-AUTH-06, AC-01)", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jennifer@toktickit.com",
        password: "Password123!",
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("jennifer@toktickit.com");
  });

  it("POST /api/auth/change-password - changes password and clears mustChangePassword flag (BR-02, BR-04)", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "david@toktickit.com",
        password: "Password123!",
      });

    const token = loginRes.body.token;

    const changeRes = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "Password123!",
        newPassword: "NewStrongPassword123!",
        confirmPassword: "NewStrongPassword123!",
      });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.user.mustChangePassword).toBe(false);

    // Re-verify login with new password
    const reLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "david@toktickit.com",
        password: "NewStrongPassword123!",
      });

    expect(reLoginRes.status).toBe(200);
  });

  it("POST /api/auth/logout - invalidates session token (API-AUTH-05, AC-01)", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "jennifer@toktickit.com",
        password: "Password123!",
      });

    const token = loginRes.body.token;

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutRes.status).toBe(200);

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(401);
  });
});
