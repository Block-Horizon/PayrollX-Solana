import { Logger } from "winston";
import { createComplianceDbConnection } from "@payrollx/database";
import {
  findAllAuditLogs,
  createAuditLog,
  AuditLogQuery,
} from "./audit.service";
import {
  findAllReports,
  generateReport,
  downloadReport,
  ReportQuery,
  GenerateReportDto,
} from "./report.service";

type PrismaClient = ReturnType<typeof createComplianceDbConnection>;

export const getAuditLogs = async (
  query: AuditLogQuery,
  prisma: PrismaClient,
  logger: Logger
) => {
  return findAllAuditLogs(query, prisma, logger);
};

export const getReports = async (
  query: ReportQuery,
  prisma: PrismaClient,
  logger: Logger
) => {
  return findAllReports(query, prisma, logger);
};

export const createAuditLogEntry = async (
  createAuditLogDto: Record<string, unknown>,
  prisma: PrismaClient,
  logger: Logger
) => {
  return createAuditLog(createAuditLogDto, prisma, logger);
};

export const generateComplianceReport = async (
  generateReportDto: GenerateReportDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  return generateReport(generateReportDto, prisma, logger);
};

export const downloadComplianceReport = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  return downloadReport(id, prisma, logger);
};
