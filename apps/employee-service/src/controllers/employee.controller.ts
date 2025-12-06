import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import multer from "multer";
import { createEmployeeDbConnection } from "@payrollx/database";
import { jwtAuth, AuthRequest } from "../middleware/jwt-auth";
import {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  linkWallet,
  uploadKycDocuments,
  verifyKyc,
} from "../services/employee.service";

type PrismaClient = ReturnType<typeof createEmployeeDbConnection>;

const upload = multer({ storage: multer.memoryStorage() });

const createEmployeeSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  salary: z.number().optional(),
  paymentToken: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  salary: z.number().optional(),
  paymentToken: z.string().optional(),
});

const linkWalletSchema = z.object({
  walletAddress: z.string(),
});

const kycDocumentSchema = z.object({
  documentType: z.string(),
});

export const createEmployeeController = (
  prisma: PrismaClient,
  logger: Logger
) => {
  const create = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createEmployeeSchema.parse(authReq.body);
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
      }

      const employee = await createEmployee(validated, userId, prisma, logger);

      res.status(201).json(employee);
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

      logger.error("Failed to create employee:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to create employee",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employee = await findEmployeeById(id, prisma, logger);

      if (!employee) {
        return res.status(404).json({
          statusCode: 404,
          message: "Employee not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(employee);
    } catch (error) {
      logger.error("Failed to get employee:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get employee",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = updateEmployeeSchema.parse(req.body);

      const employee = await updateEmployee(id, validated, prisma, logger);

      if (!employee) {
        return res.status(404).json({
          statusCode: 404,
          message: "Employee not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to update employee:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to update employee",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const linkWalletHandler = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = linkWalletSchema.parse(req.body);

      const employee = await linkWallet(
        id,
        validated.walletAddress,
        prisma,
        logger
      );

      if (!employee) {
        return res.status(404).json({
          statusCode: 404,
          message: "Employee not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(employee);
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

      if (errorMessage.includes("Invalid Solana")) {
        return res.status(400).json({
          statusCode: 400,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to link wallet:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to link wallet",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const uploadKyc = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          statusCode: 400,
          message: "No file uploaded",
          timestamp: new Date().toISOString(),
        });
      }

      const validated = kycDocumentSchema.parse(req.body);

      const employee = await uploadKycDocuments(
        id,
        validated,
        file,
        prisma,
        logger
      );

      if (!employee) {
        return res.status(404).json({
          statusCode: 404,
          message: "Employee not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to upload KYC documents:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to upload KYC documents",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const verifyKycHandler = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employee = await verifyKyc(id, prisma, logger);

      if (!employee) {
        return res.status(404).json({
          statusCode: 404,
          message: "Employee not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(employee);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("not in verified status")) {
        return res.status(400).json({
          statusCode: 400,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to verify KYC:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to verify KYC",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    create,
    getById,
    update,
    linkWallet: linkWalletHandler,
    uploadKyc,
    verifyKyc: verifyKycHandler,
  };
};

export { upload };
