import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createComplianceDbConnection } from "@payrollx/database";
import {
  getAuditLogs,
  getReports,
  createAuditLogEntry,
  generateComplianceReport,
  downloadComplianceReport,
} from "../services/compliance.service";

type PrismaClient = ReturnType<typeof createComplianceDbConnection>;

const createAuditLogSchema = z.object({
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  userId: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

const generateReportSchema = z.object({
  organizationId: z.string().uuid().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  format: z.enum(["CSV", "PDF"]),
  type: z.string(),
});

export const createComplianceController = (
  prisma: PrismaClient,
  logger: Logger
) => {
  const getAuditLogsHandler = async (req: Request, res: Response) => {
    try {
      const query = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        entityType: req.query.entityType as string | undefined,
        entityId: req.query.entityId as string | undefined,
        userId: req.query.userId as string | undefined,
      };

      const auditLogs = await getAuditLogs(query, prisma, logger);
      res.status(200).json(auditLogs);
    } catch (error) {
      logger.error("Failed to get audit logs:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get audit logs",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getReportsHandler = async (req: Request, res: Response) => {
    try {
      const query = {
        organizationId: req.query.organizationId as string | undefined,
        status: req.query.status as string | undefined,
      };

      const reports = await getReports(query, prisma, logger);
      res.status(200).json(reports);
    } catch (error) {
      logger.error("Failed to get reports:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get reports",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const createAuditLog = async (req: Request, res: Response) => {
    try {
      const validated = createAuditLogSchema.parse(req.body);
      const auditLog = await createAuditLogEntry(validated, prisma, logger);

      res.status(201).json(auditLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to create audit log:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to create audit log",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const generateReport = async (req: Request, res: Response) => {
    try {
      const validated = generateReportSchema.parse(req.body);
      const result = await generateComplianceReport(validated, prisma, logger);

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

      logger.error("Failed to generate report:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to generate report",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const downloadReport = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await downloadComplianceReport(id, prisma, logger);

      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("not completed")
      ) {
        return res.status(404).json({
          statusCode: 404,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to download report:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to download report",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    getAuditLogs: getAuditLogsHandler,
    getReports: getReportsHandler,
    createAuditLog,
    generateReport,
    downloadReport,
  };
};
