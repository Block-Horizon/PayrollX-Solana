import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createOrganizationDbConnection } from "@payrollx/database";
import { jwtAuth, AuthRequest } from "../middleware/jwt-auth";
import {
  createOrganization,
  findOrganizationById,
  updateOrganization,
  completeOnboarding,
} from "../services/organization.service";

type PrismaClient = ReturnType<typeof createOrganizationDbConnection>;

const createOrganizationSchema = z.object({
  name: z.string().min(1),
  config: z.record(z.unknown()).optional(),
});

const updateOrganizationSchema = z.object({
  name: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

const onboardSchema = z.object({
  authorizedSigners: z.array(z.string()),
});

export const createOrganizationController = (
  prisma: PrismaClient,
  logger: Logger
) => {
  const create = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createOrganizationSchema.parse(authReq.body);
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
      }

      const organization = await createOrganization(
        validated,
        userId,
        prisma,
        logger
      );

      res.status(201).json(organization);
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

      logger.error("Failed to create organization:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to create organization",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const organization = await findOrganizationById(id, prisma, logger);

      if (!organization) {
        return res.status(404).json({
          statusCode: 404,
          message: "Organization not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(organization);
    } catch (error) {
      logger.error("Failed to get organization:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get organization",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = updateOrganizationSchema.parse(req.body);

      const organization = await updateOrganization(
        id,
        validated,
        prisma,
        logger
      );

      if (!organization) {
        return res.status(404).json({
          statusCode: 404,
          message: "Organization not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to update organization:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to update organization",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const onboard = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = onboardSchema.parse(req.body);

      const organization = await completeOnboarding(
        id,
        validated.authorizedSigners,
        prisma,
        logger
      );

      if (!organization) {
        return res.status(404).json({
          statusCode: 404,
          message: "Organization not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(organization);
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

      if (errorMessage.includes("Invalid Solana public keys")) {
        return res.status(400).json({
          statusCode: 400,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to complete onboarding:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to complete onboarding",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    create,
    getById,
    update,
    onboard,
  };
};
