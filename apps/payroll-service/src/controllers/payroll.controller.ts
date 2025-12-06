import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createPayrollDbConnection } from "@payrollx/database";
import { jwtAuth, AuthRequest } from "../middleware/jwt-auth";
import {
  createPayrollRun,
  getPayrollRun,
  getPayrollRuns,
  executePayrollRun,
} from "../services/payroll.service";

type PrismaClient = ReturnType<typeof createPayrollDbConnection>;

const payrollItemSchema = z.object({
  employeeId: z.string().uuid(),
  amount: z.number(),
});

const createPayrollRunSchema = z.object({
  organizationId: z.string().uuid(),
  scheduledDate: z.string(),
  currency: z.string(),
  items: z.array(payrollItemSchema),
});

const executePayrollRunSchema = z.object({
  force: z.string().optional(),
});

export const createPayrollController = (
  prisma: PrismaClient,
  logger: Logger
) => {
  const create = async (req: AuthRequest, res: Response) => {
    try {
      const validated = createPayrollRunSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
      }

      const payrollRun = await createPayrollRun(
        validated,
        userId,
        prisma,
        logger
      );

      res.status(201).json(payrollRun);
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

      if (errorMessage.includes("not found or not approved")) {
        return res.status(400).json({
          statusCode: 400,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to create payroll run:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to create payroll run",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const payrollRun = await getPayrollRun(id, prisma, logger);

      if (!payrollRun) {
        return res.status(404).json({
          statusCode: 404,
          message: "Payroll run not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(payrollRun);
    } catch (error) {
      logger.error("Failed to get payroll run:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get payroll run",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getAll = async (req: AuthRequest, res: Response) => {
    try {
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized - Organization ID required",
          timestamp: new Date().toISOString(),
        });
      }

      const payrollRuns = await getPayrollRuns(organizationId, prisma, logger);

      res.status(200).json(payrollRuns);
    } catch (error) {
      logger.error("Failed to get payroll runs:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get payroll runs",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const execute = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = executePayrollRunSchema.parse(req.body);

      const result = await executePayrollRun(id, validated, prisma, logger);

      if (!result) {
        return res.status(404).json({
          statusCode: 404,
          message: "Payroll run not found",
          timestamp: new Date().toISOString(),
        });
      }

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

      if (errorMessage.includes("cannot be executed")) {
        return res.status(400).json({
          statusCode: 400,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to execute payroll run:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to execute payroll run",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    create,
    getById,
    getAll,
    execute,
  };
};
