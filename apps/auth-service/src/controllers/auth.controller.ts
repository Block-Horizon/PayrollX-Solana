import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createAuthDbConnection } from "@payrollx/database";
import {
  validateUser,
  login,
  register,
  refreshToken,
  logout,
} from "../services/auth.service";

type PrismaClient = ReturnType<typeof createAuthDbConnection>;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  organizationId: z.string().uuid().optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationId: z.string().uuid().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createAuthController = (prisma: PrismaClient, logger: Logger) => {
  const loginHandler = async (req: Request, res: Response) => {
    try {
      const validated = loginSchema.parse(req.body);
      const user = await validateUser(
        validated.email,
        validated.password,
        validated.organizationId,
        prisma,
        logger
      );

      if (!user) {
        return res.status(401).json({
          statusCode: 401,
          message: "Invalid email or password",
          timestamp: new Date().toISOString(),
        });
      }

      const result = await login(user, prisma, logger);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to login:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Login failed. Please try again.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const registerHandler = async (req: Request, res: Response) => {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await register(validated, prisma, logger);

      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("already exists")) {
        return res.status(409).json({
          statusCode: 409,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to register:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Registration failed. Please try again.",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
      const validated = refreshTokenSchema.parse(req.body);
      const result = await refreshToken(validated.refreshToken, prisma, logger);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.includes("Invalid refresh token") ||
        errorMessage.includes("expired")
      ) {
        return res.status(401).json({
          statusCode: 401,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to refresh token:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Token refresh failed",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const logoutHandler = async (req: Request, res: Response) => {
    try {
      const validated = refreshTokenSchema.parse(req.body);
      const result = await logout(validated.refreshToken, prisma, logger);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to logout:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Logout failed",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    login: loginHandler,
    register: registerHandler,
    refreshToken: refreshTokenHandler,
    logout: logoutHandler,
  };
};
