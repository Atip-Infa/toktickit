import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Setup Multer Storage for Lab 2 file uploads
const uploadDir = path.join(process.cwd(), "uploads", "lab-02");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "File size exceeds 5 MB limit" });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

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

// GET /api/tickets - Query paginated tickets for selected Requester (Issue #16, BR-06, BR-19, BR-20, BR-21, AC-10)
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterId = Number(req.query.requesterId || req.headers["x-requester-id"]);
    if (!requesterId || isNaN(requesterId)) {
      return res.status(400).json({ error: "requesterId is required" });
    }

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = req.query.category ? Number(req.query.category) : undefined;
    const priority = typeof req.query.priority === "string" && req.query.priority.trim() ? req.query.priority.trim() : undefined;
    const status = typeof req.query.status === "string" && req.query.status.trim() ? req.query.status.trim() : undefined;
    const sortBy = typeof req.query.sortBy === "string" && ["createdAt", "ticketNumber", "updatedAt"].includes(req.query.sortBy.trim()) ? req.query.sortBy.trim() : "createdAt";
    const sortOrder = typeof req.query.sortOrder === "string" && req.query.sortOrder.toLowerCase() === "asc" ? "asc" : "desc";
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const pageSize = req.query.pageSize ? Math.min(50, Math.max(1, Number(req.query.pageSize))) : 10;

    const where: any = {
      requesterId,
    };

    if (category && !isNaN(category)) {
      where.categoryId = category;
    }
    if (priority) {
      where.requestedPriority = priority;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    const prisma = getPrisma();
    const totalItems = await prisma.ticket.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const skip = (page - 1) * pageSize;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: [{ [sortBy]: sortOrder }, { id: "desc" }],
      skip,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true, code: true } },
        relatedSystem: { select: { id: true, name: true, code: true } },
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      data: tickets,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// GET /api/tickets/:id - Get Ticket Detail for owned ticket (Issue #17, BR-06, AC-02, AC-03)
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const requesterId = Number(req.query.requesterId || req.headers["x-requester-id"]);

    if (!ticketId || isNaN(ticketId)) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    if (!requesterId || isNaN(requesterId)) {
      return res.status(400).json({ error: "requesterId is required" });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        requester: { select: { id: true, name: true, email: true, department: true } },
        category: { select: { id: true, name: true, code: true } },
        relatedSystem: { select: { id: true, name: true, code: true } },
        attachments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            ticketId: true,
            filename: true,
            fileSize: true,
            mimeType: true,
            uploadedByRequesterId: true,
            isRemoved: true,
            createdAt: true,
            removedAt: true,
            removalReason: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Ownership check (BR-06, AC-03)
    if (ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to ticket" });
    }

    return res.status(200).json({ data: ticket });
  } catch {
    return res.status(500).json({ error: "Failed to fetch ticket detail" });
  }
});

// POST /api/tickets - Create a new ticket (Issue #13)
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterId = Number(req.body.requesterId || req.headers["x-requester-id"]);
    const categoryId = Number(req.body.categoryId);
    const relatedSystemId = Number(req.body.relatedSystemId);
    const requestedPriority = req.body.requestedPriority || "MEDIUM";
    const summary = typeof req.body.summary === "string" ? req.body.summary.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";

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

// ---------------------------------------------------------------------------
// Issue #14 — Attachment Lifecycle APIs
// ---------------------------------------------------------------------------

// POST /api/tickets/:id/attachments - Upload attachment
app.post("/api/tickets/:id/attachments", handleMulterUpload, async (req: Request, res: Response) => {
  const file = req.file;
  const ticketId = Number(req.params.id);
  const requesterId = Number(req.body.requesterId || req.headers["x-requester-id"]);

  const removeTempFile = () => {
    if (file && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        // ignore cleanup error
      }
    }
  };

  try {
    if (!ticketId || isNaN(ticketId)) {
      removeTempFile();
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    if (!requesterId || isNaN(requesterId)) {
      removeTempFile();
      return res.status(400).json({ error: "requesterId is required" });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      removeTempFile();
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Ownership check (BR-06, AC-03)
    if (ticket.requesterId !== requesterId) {
      removeTempFile();
      return res.status(403).json({ error: "Access denied to ticket attachments" });
    }

    if (!file) {
      return res.status(400).json({ error: "Attachment file is required" });
    }

    // File type & MIME validation (BR-12, AC-05)
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExts.includes(ext) || !allowedMimes.includes(file.mimetype)) {
      removeTempFile();
      return res.status(415).json({
        error: "File type not supported. Allowed formats: JPG, PNG, WEBP, PDF",
      });
    }

    // Max active attachments count check (BR-14, AC-07)
    const activeCount = await prisma.attachment.count({
      where: { ticketId, isRemoved: false },
    });

    if (activeCount >= 5) {
      removeTempFile();
      return res.status(422).json({
        error: "Maximum 5 active attachments allowed per ticket",
      });
    }

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        ticketId,
        filename: file.originalname,
        storagePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedByRequesterId: requesterId,
        isRemoved: false,
      },
    });

    return res.status(201).json({ data: attachment });
  } catch (err: any) {
    removeTempFile();
    return res.status(500).json({ error: "Failed to upload attachment" });
  }
});

// GET /api/attachments/:id/metadata - Fetch attachment metadata
app.get("/api/attachments/:id/metadata", async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);
    const requesterId = Number(req.query.requesterId || req.headers["x-requester-id"]);

    if (!attachmentId || isNaN(attachmentId)) {
      return res.status(400).json({ error: "Invalid attachment ID" });
    }

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to attachment" });
    }

    const { ticket, ...metadata } = attachment;
    return res.status(200).json({ data: metadata });
  } catch {
    return res.status(500).json({ error: "Failed to fetch attachment metadata" });
  }
});

// GET /api/attachments/:id/download - Stream/download active attachment
app.get("/api/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);
    const requesterId = Number(req.query.requesterId || req.headers["x-requester-id"]);

    if (!attachmentId || isNaN(attachmentId)) {
      return res.status(400).json({ error: "Invalid attachment ID" });
    }

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Ownership check (BR-06)
    if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to attachment" });
    }

    // Soft-removed download block check (BR-17, AC-09)
    if (attachment.isRemoved) {
      return res.status(403).json({
        error: "Removed attachments cannot be downloaded or previewed",
      });
    }

    if (!fs.existsSync(attachment.storagePath)) {
      return res.status(404).json({ error: "Attachment file not found on disk" });
    }

    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(attachment.filename)}"`
    );

    return res.sendFile(path.resolve(attachment.storagePath));
  } catch {
    return res.status(500).json({ error: "Failed to download attachment" });
  }
});

// PATCH /api/attachments/:id/remove - Soft-remove attachment with reason (BR-15, BR-16, AC-08)
const handleSoftRemove = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);
    const requesterId = Number(req.body.requesterId || req.headers["x-requester-id"]);
    const removalReason = typeof req.body.removalReason === "string" ? req.body.removalReason.trim() : "";

    if (!attachmentId || isNaN(attachmentId)) {
      return res.status(400).json({ error: "Invalid attachment ID" });
    }

    if (!removalReason || removalReason.length < 3) {
      return res.status(400).json({
        error: "Removal reason is required (min 3 characters)",
      });
    }

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to attachment" });
    }

    const updated = await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        isRemoved: true,
        removedAt: new Date(),
        removalReason,
      },
    });

    const { ticket, ...data } = updated as any;
    return res.status(200).json({ data });
  } catch {
    return res.status(500).json({ error: "Failed to soft-remove attachment" });
  }
};

app.patch("/api/attachments/:id/remove", handleSoftRemove);
app.delete("/api/attachments/:id/remove", handleSoftRemove);
app.delete("/api/attachments/:id", handleSoftRemove);

export default app;
