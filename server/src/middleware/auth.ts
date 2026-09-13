import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../prisma.js";
import { verifyToken } from "../utils/auth.js";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";
  mustChangePassword: boolean;
  isActive: boolean;
  department?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.toktickit_session;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    return next();
  }

  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
  } catch (e) {
    // DB error or client disconnected
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      code: "UNAUTHENTICATED",
    });
  }

  if (!req.user.isActive) {
    return res.status(401).json({
      error: "Account is inactive",
      code: "INACTIVE_ACCOUNT",
    });
  }

  next();
}

export function requirePasswordChanged(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.mustChangePassword) {
    // Exclude change-password, me, and logout routes
    const path = req.path;
    if (path.includes("/auth/change-password") || path.includes("/auth/me") || path.includes("/auth/logout")) {
      return next();
    }
    return res.status(403).json({
      error: "Mandatory password change required before accessing application",
      code: "MUST_CHANGE_PASSWORD",
    });
  }
  next();
}

export function requireRole(...allowedRoles: Array<"REQUESTER" | "IT_STAFF" | "ADMINISTRATOR">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "UNAUTHENTICATED",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
        code: "FORBIDDEN",
      });
    }

    next();
  };
}
