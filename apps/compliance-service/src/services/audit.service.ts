import { Logger } from "winston";
import { createComplianceDbConnection } from "@payrollx/database";

type PrismaClient = ReturnType<typeof createComplianceDbConnection>;

export interface AuditLogQuery {
  limit?: number;
  offset?: number;
  entityType?: string;
  entityId?: string;
  userId?: string;
}

export const findAllAuditLogs = async (
  query: AuditLogQuery,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const where: Record<string, unknown> = {};

    if (query.entityType) {
      where.entityType = query.entityType;
    }
    if (query.entityId) {
      where.entityId = query.entityId;
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit || 100,
      skip: query.offset || 0,
    });
  } catch (error) {
    logger.error("Failed to find audit logs:", error);
    throw error;
  }
};

export const createAuditLog = async (
  createAuditLogDto: Record<string, unknown>,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: createAuditLogDto,
    });

    logger.info(`Audit log created: ${auditLog.id}`);
    return auditLog;
  } catch (error) {
    logger.error("Failed to create audit log:", error);
    throw error;
  }
};

export const findAuditLogsByEntity = async (
  entityType: string,
  entityId: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    return await prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to find audit logs by entity:", error);
    throw error;
  }
};

export const findAuditLogsByUser = async (
  userId: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to find audit logs by user:", error);
    throw error;
  }
};
