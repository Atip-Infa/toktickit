import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Attachment Lifecycle APIs (Issue #14)", () => {
  let requesterId1: number;
  let requesterId2: number;
  let ticketId1: number;
  let ticketId2: number;

  const samplePdfBuffer = Buffer.from("%PDF-1.4 sample pdf content for attachment testing");
  const sampleExeBuffer = Buffer.from("MZ dummy executable content");
  const sampleOversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5MB + 1KB

  beforeAll(async () => {
    const prisma = getPrisma();
    const requesters = await prisma.developmentRequester.findMany({
      where: { isActive: true },
      take: 2,
    });
    const category = await prisma.category.findFirst({ where: { isActive: true } });
    const system = await prisma.relatedSystem.findFirst({ where: { isActive: true } });

    requesterId1 = requesters[0].id;
    requesterId2 = requesters[1].id;

    // Create ticket for Requester 1
    const ticket1 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-2026-TEST01-${Date.now()}`,
        requesterId: requesterId1,
        categoryId: category!.id,
        relatedSystemId: system!.id,
        summary: "Attachment testing ticket for Requester 1",
        description: "Detailed description for attachment testing.",
      },
    });
    ticketId1 = ticket1.id;

    // Create ticket for Requester 2
    const ticket2 = await prisma.ticket.create({
      data: {
        ticketNumber: `TKT-2026-TEST02-${Date.now()}`,
        requesterId: requesterId2,
        categoryId: category!.id,
        relatedSystemId: system!.id,
        summary: "Attachment testing ticket for Requester 2",
        description: "Detailed description for attachment testing.",
      },
    });
    ticketId2 = ticket2.id;
  });

  it("uploads a valid PDF attachment successfully (API-17, BR-12)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId1}/attachments`)
      .field("requesterId", requesterId1)
      .attach("file", samplePdfBuffer, {
        filename: "test_doc.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.filename).toBe("test_doc.pdf");
    expect(res.body.data.isRemoved).toBe(false);
  });

  it("rejects unpermitted file types e.g. .exe (API-11, BR-12, AC-05)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId1}/attachments`)
      .field("requesterId", requesterId1)
      .attach("file", sampleExeBuffer, {
        filename: "malicious.exe",
        contentType: "application/x-msdownload",
      });

    expect(res.status).toBe(415);
    expect(res.body.error).toMatch(/File type not supported/i);
  });

  it("rejects oversized file uploads > 5MB (API-12, BR-13, AC-06)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId1}/attachments`)
      .field("requesterId", requesterId1)
      .attach("file", sampleOversizedBuffer, {
        filename: "large.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(413);
    expect(res.body.error).toMatch(/exceeds 5 MB limit/i);
  });

  it("rejects attachment upload for unowned ticket (BR-06, AC-03)", async () => {
    // Requester 2 attempts to upload to Ticket 1 (owned by Requester 1)
    const res = await request(app)
      .post(`/api/tickets/${ticketId1}/attachments`)
      .field("requesterId", requesterId2)
      .attach("file", samplePdfBuffer, {
        filename: "unauthorized.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Access denied/i);
  });

  it("enforces maximum 5 active attachments limit (API-13, BR-14, AC-07)", async () => {
    const prisma = getPrisma();
    // Clear existing active attachments for ticket 1 and seed 5 active attachments
    await prisma.attachment.deleteMany({ where: { ticketId: ticketId1 } });

    for (let i = 1; i <= 5; i++) {
      await prisma.attachment.create({
        data: {
          ticketId: ticketId1,
          filename: `seed_${i}.pdf`,
          storagePath: `/tmp/fake_${i}.pdf`,
          fileSize: 1024,
          mimeType: "application/pdf",
          uploadedByRequesterId: requesterId1,
          isRemoved: false,
        },
      });
    }

    // Attempt to upload a 6th attachment
    const res = await request(app)
      .post(`/api/tickets/${ticketId1}/attachments`)
      .field("requesterId", requesterId1)
      .attach("file", samplePdfBuffer, {
        filename: "sixth_file.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/Maximum 5 active attachments allowed/i);
  });

  it("fetches attachment metadata for owned attachment", async () => {
    const prisma = getPrisma();
    const attachment = await prisma.attachment.findFirst({
      where: { ticketId: ticketId1, isRemoved: false },
    });

    const res = await request(app)
      .get(`/api/attachments/${attachment!.id}/metadata`)
      .set("X-Requester-Id", String(requesterId1));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(attachment!.id);
    expect(res.body.data.filename).toBe(attachment!.filename);
  });

  it("soft-removes an attachment with mandatory reason (API-14, BR-15, BR-16, AC-08)", async () => {
    const prisma = getPrisma();
    const attachment = await prisma.attachment.findFirst({
      where: { ticketId: ticketId1, isRemoved: false },
    });

    // Attempt soft remove without reason
    const failRes = await request(app)
      .patch(`/api/attachments/${attachment!.id}/remove`)
      .send({ requesterId: requesterId1, removalReason: "" });

    expect(failRes.status).toBe(400);
    expect(failRes.body.error).toMatch(/Removal reason is required/i);

    // Soft remove with valid reason
    const successRes = await request(app)
      .patch(`/api/attachments/${attachment!.id}/remove`)
      .send({
        requesterId: requesterId1,
        removalReason: "Uploaded duplicate file by mistake",
      });

    expect(successRes.status).toBe(200);
    expect(successRes.body.data.isRemoved).toBe(true);
    expect(successRes.body.data.removalReason).toBe("Uploaded duplicate file by mistake");
    expect(successRes.body.data.removedAt).toBeDefined();
  });

  it("blocks download for soft-removed attachment (API-16, BR-17, AC-09)", async () => {
    const prisma = getPrisma();
    const removedAttachment = await prisma.attachment.findFirst({
      where: { ticketId: ticketId1, isRemoved: true },
    });

    const res = await request(app)
      .get(`/api/attachments/${removedAttachment!.id}/download`)
      .set("X-Requester-Id", String(requesterId1));

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Removed attachments cannot be downloaded/i);
  });
});
