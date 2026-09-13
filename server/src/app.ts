import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import multer from "multer";
import { getPrisma } from "./prisma.js";
import { generateTicketNumber } from "./utils/ticketNumber.js";
import {
  authenticateUser,
  requireAuth,
  requirePasswordChanged,
  requireRole,
} from "./middleware/auth.js";
import {
  comparePassword,
  hashPassword,
  validatePasswordStrength,
  generateToken,
  invalidateToken,
} from "./utils/auth.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(authenticateUser);

// Setup Multer Storage for file uploads
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

// ---------------------------------------------------------------------------
// Authentication APIs (Lab 3)
// ---------------------------------------------------------------------------

// POST /api/auth/login
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required", code: "INVALID_INPUT" });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials or inactive account", code: "INVALID_CREDENTIALS" });
    }

    const isMatch = comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials or inactive account", code: "INVALID_CREDENTIALS" });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie("toktickit_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: "Authentication failed", code: "SERVER_ERROR" });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", requireAuth, (req: Request, res: Response) => {
  if (req.token) {
    invalidateToken(req.token);
  }
  res.clearCookie("toktickit_session");
  return res.status(200).json({ message: "Logged out successfully" });
});

// GET /api/auth/me
app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
});

// POST /api/auth/change-password
app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All password fields are required", code: "INVALID_INPUT" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match", code: "PASSWORD_MISMATCH" });
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message, code: "WEAK_PASSWORD" });
    }

    const prisma = getPrisma();
    const dbUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!dbUser) {
      return res.status(401).json({ error: "User not found", code: "UNAUTHENTICATED" });
    }

    const isMatch = comparePassword(currentPassword, dbUser.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect", code: "INVALID_CURRENT_PASSWORD" });
    }

    const newHash = hashPassword(newPassword);
    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mustChangePassword: true,
        isActive: true,
        department: true,
      },
    });

    return res.status(200).json({ message: "Password updated successfully", user: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to change password", code: "SERVER_ERROR" });
  }
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

// GET /api/requesters - Returns active Development Requesters (Lab 2 compatibility)
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

// GET /api/tickets - Query paginated tickets
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    if (req.user && req.user.mustChangePassword) {
      return res.status(403).json({ error: "Mandatory password change required", code: "MUST_CHANGE_PASSWORD" });
    }

    const requesterId = req.user ? req.user.id : Number(req.query.requesterId || req.headers["x-requester-id"]);
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

// GET /api/tickets/:id - Get Ticket Detail
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    if (req.user && req.user.mustChangePassword) {
      return res.status(403).json({ error: "Mandatory password change required", code: "MUST_CHANGE_PASSWORD" });
    }

    const ticketId = Number(req.params.id);
    const requesterId = req.user ? req.user.id : Number(req.query.requesterId || req.headers["x-requester-id"]);

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
        owner: { select: { id: true, name: true, email: true } },
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

    // Server-side Authorization Check (BR-06, BR-07, AC-04)
    if (req.user) {
      if (req.user.role === "REQUESTER" && ticket.requesterId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to ticket", code: "FORBIDDEN" });
      }
    } else {
      if (ticket.requesterId !== requesterId) {
        return res.status(403).json({ error: "Access denied to ticket" });
      }
    }

    return res.status(200).json({ data: ticket });
  } catch {
    return res.status(500).json({ error: "Failed to fetch ticket detail" });
  }
});

// POST /api/tickets - Create a new ticket
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    if (req.user && req.user.mustChangePassword) {
      return res.status(403).json({ error: "Mandatory password change required", code: "MUST_CHANGE_PASSWORD" });
    }

    const requesterId = req.user ? req.user.id : Number(req.body.requesterId || req.headers["x-requester-id"]);
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

// POST /api/tickets/:id/attachments - Upload attachment
app.post("/api/tickets/:id/attachments", handleMulterUpload, async (req: Request, res: Response) => {
  const file = req.file;
  const ticketId = Number(req.params.id);
  const requesterId = req.user ? req.user.id : Number(req.body.requesterId || req.headers["x-requester-id"]);

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
    if (req.user && req.user.mustChangePassword) {
      removeTempFile();
      return res.status(403).json({ error: "Mandatory password change required", code: "MUST_CHANGE_PASSWORD" });
    }

    if (!file) {
      return res.status(400).json({ error: "Attachment file is required" });
    }

    if (!ticketId || isNaN(ticketId)) {
      removeTempFile();
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    if (!requesterId || isNaN(requesterId)) {
      removeTempFile();
      return res.status(400).json({ error: "requesterId is required" });
    }

    const prisma = getPrisma();
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      removeTempFile();
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (req.user) {
      if (req.user.role === "REQUESTER" && ticket.requesterId !== req.user.id) {
        removeTempFile();
        return res.status(403).json({ error: "Access denied to ticket attachments" });
      }
    } else {
      if (ticket.requesterId !== requesterId) {
        removeTempFile();
        return res.status(403).json({ error: "Access denied to ticket attachments" });
      }
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
  } catch {
    removeTempFile();
    return res.status(500).json({ error: "Failed to upload attachment" });
  }
});

// GET /api/attachments/:id/metadata - Fetch attachment metadata
app.get("/api/attachments/:id/metadata", async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);
    const requesterId = req.user ? req.user.id : Number(req.query.requesterId || req.headers["x-requester-id"]);

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

    if (req.user) {
      if (req.user.role === "REQUESTER" && attachment.ticket.requesterId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to attachment" });
      }
    } else if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to attachment" });
    }

    const { ticket, ...metadata } = attachment;
    return res.status(200).json({ data: metadata });
  } catch {
    return res.status(500).json({ error: "Failed to fetch attachment metadata" });
  }
});

// GET /api/attachments/:id/download - Download attachment
app.get("/api/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);
    const requesterId = req.user ? req.user.id : Number(req.query.requesterId || req.headers["x-requester-id"]);

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

    if (req.user) {
      if (req.user.role === "REQUESTER" && attachment.ticket.requesterId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to attachment" });
      }
    } else if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to attachment" });
    }

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

// PATCH /api/attachments/:id/remove
const handleSoftRemove = async (req: Request, res: Response) => {
  try {
    const attachmentId = Number(req.params.id);
    const requesterId = req.user ? req.user.id : Number(req.body.requesterId || req.headers["x-requester-id"]);
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

    if (req.user) {
      if (req.user.role === "REQUESTER" && attachment.ticket.requesterId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to attachment" });
      }
    } else if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: "Access denied to attachment" });
    }

    if (attachment.isRemoved) {
      return res.status(400).json({ error: "Attachment is already removed" });
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
    return res.status(500).json({ error: "Failed to remove attachment" });
  }
};

// ---------------------------------------------------------------------------
// IT Staff Ticket Queue & Workflow APIs (Lab 3)
// ---------------------------------------------------------------------------

// GET /api/staff/tickets - Query staff ticket queue with filters, sorting, and pagination
app.get(
  "/api/staff/tickets",
  requireAuth,
  requirePasswordChanged,
  requireRole("IT_STAFF", "ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const categoryId = req.query.category ? Number(req.query.category) : undefined;
      const priority = typeof req.query.priority === "string" && req.query.priority.trim() ? req.query.priority.trim() : undefined;
      const status = typeof req.query.status === "string" && req.query.status.trim() ? req.query.status.trim() : undefined;
      const ownerIdQuery = typeof req.query.ownerId === "string" ? req.query.ownerId.trim() : undefined;

      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
      const skip = (page - 1) * pageSize;

      const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy.trim() : "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

      const where: any = {};

      if (search) {
        where.OR = [
          { ticketNumber: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (categoryId && !isNaN(categoryId)) {
        where.categoryId = categoryId;
      }

      if (priority) {
        where.OR = [
          { itPriority: priority },
          { requestedPriority: priority },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (ownerIdQuery) {
        if (ownerIdQuery.toLowerCase() === "unassigned" || ownerIdQuery === "null") {
          where.ownerId = null;
        } else if (!isNaN(Number(ownerIdQuery))) {
          where.ownerId = Number(ownerIdQuery);
        }
      }

      const orderBy: any = {};
      if (["createdAt", "updatedAt", "itPriority", "requestedPriority", "status", "ticketNumber", "id"].includes(sortBy)) {
        orderBy[sortBy] = sortOrder;
      } else {
        orderBy.createdAt = "desc";
      }

      const prisma = getPrisma();
      const [tickets, totalItems] = await Promise.all([
        prisma.ticket.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          include: {
            requester: { select: { id: true, name: true, email: true, department: true } },
            owner: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true, code: true } },
            relatedSystem: { select: { id: true, name: true, code: true } },
            _count: {
              select: { attachments: true, publicComments: true, internalNotes: true },
            },
          },
        }),
        prisma.ticket.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / pageSize) || 1;

      return res.status(200).json({
        data: tickets,
        meta: { page, pageSize, totalItems, totalPages },
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to fetch staff tickets" });
    }
  }
);

// PATCH /api/staff/tickets/:id - Claim, reassign, set IT Priority, update status
app.patch(
  "/api/staff/tickets/:id",
  requireAuth,
  requirePasswordChanged,
  requireRole("IT_STAFF", "ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const existing = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      if (!existing) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const { ownerId, itPriority, status, resolutionSummary } = req.body;

      const dataToUpdate: any = {};

      if (ownerId !== undefined) {
        if (ownerId === "claim") {
          dataToUpdate.ownerId = req.user!.id;
        } else if (ownerId === null || ownerId === "unassigned") {
          dataToUpdate.ownerId = null;
        } else if (!isNaN(Number(ownerId))) {
          dataToUpdate.ownerId = Number(ownerId);
        }

        if (existing.status === "NEW" && !status && dataToUpdate.ownerId) {
          dataToUpdate.status = "ASSIGNED";
        }
      }

      if (itPriority) {
        if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(itPriority)) {
          return res.status(400).json({ error: "Invalid IT Priority" });
        }
        dataToUpdate.itPriority = itPriority;
      }

      if (status && status !== existing.status) {
        const allowedTransitionsMap: Record<string, string[]> = {
          NEW: ["OPEN", "ASSIGNED", "IN_PROGRESS", "CANCELLED"],
          OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "CANCELLED"],
          ASSIGNED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "CANCELLED"],
          IN_PROGRESS: ["WAITING_FOR_REQUESTER", "PENDING_CLIENT", "RESOLVED", "CANCELLED"],
          WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
          PENDING_CLIENT: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
          RESOLVED: ["CLOSED", "REOPENED"],
          CLOSED: ["REOPENED"],
          REOPENED: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "PENDING_CLIENT", "RESOLVED"],
          CANCELLED: [],
        };

        const allowed = allowedTransitionsMap[existing.status] || [];
        if (!allowed.includes(status)) {
          return res.status(400).json({
            error: `Invalid status transition from ${existing.status} to ${status}`,
          });
        }

        if (
          (status === "RESOLVED" || status === "CLOSED") &&
          (!resolutionSummary || typeof resolutionSummary !== "string" || !resolutionSummary.trim())
        ) {
          return res.status(400).json({
            error: "Resolution summary is required when resolving or closing a ticket",
          });
        }

        dataToUpdate.status = status;
      }

      if (resolutionSummary !== undefined) {
        dataToUpdate.resolutionSummary =
          typeof resolutionSummary === "string" ? resolutionSummary.trim() : "";
      }

      const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: dataToUpdate,
        include: {
          requester: { select: { id: true, name: true, email: true, department: true } },
          owner: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, code: true } },
          relatedSystem: { select: { id: true, name: true, code: true } },
        },
      });

      return res.status(200).json({ data: updated });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update ticket" });
    }
  }
);

// ---------------------------------------------------------------------------
// Public Comments & Internal Notes APIs (Lab 3)
// ---------------------------------------------------------------------------

// GET /api/tickets/:id/public-comments
app.get(
  "/api/tickets/:id/public-comments",
  requireAuth,
  requirePasswordChanged,
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (req.user!.role === "REQUESTER" && ticket.requesterId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied to public comments" });
      }

      const comments = await prisma.publicComment.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      const formatted = comments.map((c) => ({
        ...c,
        body: c.content,
      }));

      return res.status(200).json({ data: formatted });
    } catch {
      return res.status(500).json({ error: "Failed to fetch public comments" });
    }
  }
);

// POST /api/tickets/:id/public-comments
app.post(
  "/api/tickets/:id/public-comments",
  requireAuth,
  requirePasswordChanged,
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const body = typeof req.body.body === "string" ? req.body.body.trim() : (typeof req.body.content === "string" ? req.body.content.trim() : "");
      if (!body || body.length > 2000) {
        return res
          .status(400)
          .json({ error: "Comment body is required (max 2000 characters)" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (req.user!.role === "REQUESTER" && ticket.requesterId !== req.user!.id) {
        return res
          .status(403)
          .json({ error: "Access denied to post comment on this ticket" });
      }

      const comment = await prisma.publicComment.create({
        data: {
          ticketId,
          authorId: req.user!.id,
          content: body,
        },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      // Side Effect (BR-12): If requester comments when PENDING_CLIENT, move back to IN_PROGRESS
      if (req.user!.role === "REQUESTER" && ticket.status === "PENDING_CLIENT") {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: "IN_PROGRESS" },
        });
      }

      return res.status(201).json({
        data: {
          ...comment,
          body: comment.content,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to post public comment" });
    }
  }
);

// POST /api/tickets/:id/resolve - Requester "Problem Appears Resolved" indication action
app.post(
  "/api/tickets/:id/resolve",
  requireAuth,
  requirePasswordChanged,
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (req.user!.role === "REQUESTER" && ticket.requesterId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied to ticket" });
      }

      // Add a Public Comment indicating problem appears resolved
      await prisma.publicComment.create({
        data: {
          ticketId,
          authorId: req.user!.id,
          content: "Requester indicated: Problem Appears Resolved. Requesting IT Staff review.",
        },
      });

      const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
        include: {
          requester: { select: { id: true, name: true, email: true, department: true } },
          owner: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, code: true } },
          relatedSystem: { select: { id: true, name: true, code: true } },
          attachments: true,
        },
      });

      return res.status(200).json({ data: updated });
    } catch {
      return res.status(500).json({ error: "Failed to mark problem as resolved" });
    }
  }
);

// GET /api/tickets/:id/internal-notes
app.get(
  "/api/tickets/:id/internal-notes",
  requireAuth,
  requirePasswordChanged,
  requireRole("IT_STAFF", "ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const notes = await prisma.internalNote.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      const formatted = notes.map((n) => ({
        ...n,
        body: n.content,
      }));

      return res.status(200).json({ data: formatted });
    } catch {
      return res.status(500).json({ error: "Failed to fetch internal notes" });
    }
  }
);

// POST /api/tickets/:id/internal-notes
app.post(
  "/api/tickets/:id/internal-notes",
  requireAuth,
  requirePasswordChanged,
  requireRole("IT_STAFF", "ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const body = typeof req.body.body === "string" ? req.body.body.trim() : (typeof req.body.content === "string" ? req.body.content.trim() : "");
      if (!body || body.length > 2000) {
        return res
          .status(400)
          .json({ error: "Note body is required (max 2000 characters)" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      const note = await prisma.internalNote.create({
        data: {
          ticketId,
          authorId: req.user!.id,
          content: body,
        },
        include: {
          author: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(201).json({
        data: {
          ...note,
          body: note.content,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to post internal note" });
    }
  }
);

// POST /api/tickets/:id/resolve (Requester mark problem resolved)
app.post(
  "/api/tickets/:id/resolve",
  requireAuth,
  requirePasswordChanged,
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      if (!ticketId || isNaN(ticketId)) {
        return res.status(400).json({ error: "Invalid ticket ID" });
      }

      const prisma = getPrisma();
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      if (req.user!.role === "REQUESTER" && ticket.requesterId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied to resolve this ticket" });
      }

      const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "RESOLVED" },
      });

      return res.status(200).json({ data: updated });
    } catch {
      return res.status(500).json({ error: "Failed to resolve ticket" });
    }
  }
);

// ---------------------------------------------------------------------------
// Administrator User Management APIs (Lab 3)
// ---------------------------------------------------------------------------

// GET /api/admin/users - Query users list with role, search, active filters and pagination
app.get(
  "/api/admin/users",
  requireAuth,
  requirePasswordChanged,
  requireRole("ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
      const role = typeof req.query.role === "string" && req.query.role.trim() ? req.query.role.trim() : undefined;
      const isActiveQuery =
        req.query.isActive !== undefined
          ? req.query.isActive === "true" || req.query.isActive === "1"
          : undefined;

      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (role) {
        where.role = role;
      }

      if (isActiveQuery !== undefined) {
        where.isActive = isActiveQuery;
      }

      const prisma = getPrisma();
      const [users, totalItems] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { id: "asc" },
          skip,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
            department: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(totalItems / pageSize) || 1;

      return res.status(200).json({
        data: users,
        meta: { page, pageSize, totalItems, totalPages },
      });
    } catch {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// POST /api/admin/users - Create User
app.post(
  "/api/admin/users",
  requireAuth,
  requirePasswordChanged,
  requireRole("ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const { name, email, role, department, initialPassword } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      if (!role || !["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(role)) {
        return res.status(400).json({ error: "Valid role is required" });
      }

      const prisma = getPrisma();
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ error: "Email already in use", code: "DUPLICATE_EMAIL" });
      }

      const rawPassword =
        initialPassword &&
        typeof initialPassword === "string" &&
        initialPassword.length >= 8
          ? initialPassword
          : "Password123!";
      const passwordHash = hashPassword(rawPassword);

      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
          department: department ? String(department).trim() : null,
          passwordHash,
          mustChangePassword: true,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(201).json({ data: newUser });
    } catch {
      return res.status(500).json({ error: "Failed to create user" });
    }
  }
);

// PATCH /api/admin/users/:id - Edit User Details / Role / Deactivate
app.patch(
  "/api/admin/users/:id",
  requireAuth,
  requirePasswordChanged,
  requireRole("ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const { name, email, role, isActive, department } = req.body;

      const prisma = getPrisma();
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Safety check: Cannot deactivate own account
      if (isActive === false && req.user!.id === userId) {
        return res
          .status(400)
          .json({ error: "Cannot deactivate your own account" });
      }

      // Safety check: Cannot deactivate or demote last active Administrator
      if (existingUser.role === "ADMINISTRATOR" && existingUser.isActive) {
        const isDeactivating = isActive === false;
        const isDemoting = role && role !== "ADMINISTRATOR";
        if (isDeactivating || isDemoting) {
          const activeAdminCount = await prisma.user.count({
            where: { role: "ADMINISTRATOR", isActive: true },
          });
          if (activeAdminCount <= 1) {
            return res
              .status(400)
              .json({ error: "Cannot deactivate or demote the last active administrator" });
          }
        }
      }

      const dataToUpdate: any = {};

      if (name && typeof name === "string") dataToUpdate.name = name.trim();

      if (
        email &&
        typeof email === "string" &&
        email.toLowerCase().trim() !== existingUser.email
      ) {
        const emailCheck = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });
        if (emailCheck) {
          return res
            .status(409)
            .json({ error: "Email already in use", code: "DUPLICATE_EMAIL" });
        }
        dataToUpdate.email = email.toLowerCase().trim();
      }

      if (role && ["REQUESTER", "IT_STAFF", "ADMINISTRATOR"].includes(role)) {
        dataToUpdate.role = role;
      }

      if (typeof isActive === "boolean") {
        dataToUpdate.isActive = isActive;
      }

      if (department !== undefined) {
        dataToUpdate.department = department ? String(department).trim() : null;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({ data: updated });
    } catch {
      return res.status(500).json({ error: "Failed to update user" });
    }
  }
);

// POST /api/admin/users/:id/reset-password - Admin Reset Password
app.post(
  "/api/admin/users/:id/reset-password",
  requireAuth,
  requirePasswordChanged,
  requireRole("ADMINISTRATOR"),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const prisma = getPrisma();
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const newPassword =
        req.body.newPassword && typeof req.body.newPassword === "string"
          ? req.body.newPassword
          : "Password123!";
      const passwordHash = hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          mustChangePassword: true,
        },
      });

      return res.status(200).json({ message: "User password reset successfully" });
    } catch {
      return res.status(500).json({ error: "Failed to reset password" });
    }
  }
);

app.patch("/api/attachments/:id/remove", handleSoftRemove);
app.delete("/api/attachments/:id/remove", handleSoftRemove);
app.delete("/api/attachments/:id", handleSoftRemove);
app.delete("/api/tickets/:id/attachments/:attachmentId", handleSoftRemove);

export default app;
