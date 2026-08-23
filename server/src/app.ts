import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";

export const app = express();

app.use(cors());
app.use(express.json());

// API Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// GET /api/categories - Returns active categories
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    res.status(200).json(categories);
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/requesters - Returns active Development Requesters (BR-04, AC-13)
app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().developmentRequester.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        isActive: true,
      },
    });
    res.status(200).json({ data: requesters });
  } catch {
    res.status(500).json({ error: "Failed to fetch Development Requesters" });
  }
});

// GET /api/related-systems - Returns active Related Systems
app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    });
    res.status(200).json({ data: systems });
  } catch {
    res.status(500).json({ error: "Failed to fetch Related Systems" });
  }
});

// POST /api/tickets - Create a new ticket (Issue #13, BR-01, BR-02, BR-08, BR-09, AC-01, AC-04)
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterId = Number(req.body.requesterId || req.headers["x-requester-id"]);
    const categoryId = Number(req.body.categoryId);
    const relatedSystemId = Number(req.body.relatedSystemId);
    const requestedPriority = req.body.requestedPriority || "MEDIUM";
    const summary = typeof req.body.summary === "string" ? req.body.summary.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";

    // 1. Validation checks
    if (!requesterId || isNaN(requesterId)) {
      return res.status(400).json({ error: "requesterId is required" });
    }
    if (!categoryId || isNaN(categoryId)) {
      return res.status(400).json({ error: "categoryId is required" });
    }
    if (!relatedSystemId || isNaN(relatedSystemId)) {
      return res.status(400).json({ error: "relatedSystemId is required" });
    }
    if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(requestedPriority)) {
      return res.status(400).json({ error: "Invalid requestedPriority" });
    }
    if (summary.length < 5 || summary.length > 120) {
      return res.status(400).json({
        error: "Summary must be between 5 and 120 characters",
      });
    }
    if (description.length < 10 || description.length > 2000) {
      return res.status(400).json({
        error: "Description must be between 10 and 2000 characters",
      });
    }

    // 2. Reference existence checks (active entities)
    const prisma = getPrisma();
    const requester = await prisma.developmentRequester.findFirst({
      where: { id: requesterId, isActive: true },
    });
    if (!requester) {
      return res
        .status(422)
        .json({ error: "Invalid or inactive Development Requester" });
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
    });
    if (!category) {
      return res.status(422).json({ error: "Invalid or inactive Category" });
    }

    const system = await prisma.relatedSystem.findFirst({
      where: { id: relatedSystemId, isActive: true },
    });
    if (!system) {
      return res
        .status(422)
        .json({ error: "Invalid or inactive Related System" });
    }

    // 3. Create ticket in transaction and generate official Ticket Number
    const ticket = await prisma.$transaction(async (tx) => {
      const tempNumber = `TMP-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const created = await tx.ticket.create({
        data: {
          ticketNumber: tempNumber,
          requesterId,
          categoryId,
          relatedSystemId,
          requestedPriority,
          itPriority: "MEDIUM",
          status: "NEW",
          summary,
          description,
        },
      });

      const officialNumber = generateTicketNumber(created.id);
      const updated = await tx.ticket.update({
        where: { id: created.id },
        data: { ticketNumber: officialNumber },
      });

      return updated;
    });

    return res.status(201).json({ data: ticket });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

export default app;
