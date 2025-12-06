import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    userId?: string;
    email: string;
    role: string;
    organizationId?: string | null;
  };
}

export const jwtAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized - Missing or invalid token",
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET || "your-secret-key";

  try {
    const decoded = jwt.verify(token, secret) as {
      email: string;
      sub: string;
      role: string;
      organizationId?: string | null;
    };

    req.user = {
      id: decoded.sub,
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      statusCode: 401,
      message: "Unauthorized - Invalid token",
      timestamp: new Date().toISOString(),
    });
  }
};
