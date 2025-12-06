import { createHealthCheck } from "./health-check";
import type { PrismaClient } from "../prisma/prisma-client";

export interface PrismaHealthCheckOptions {
  serviceName: string;
  prisma: PrismaClient;
}

export const createPrismaHealthCheck = (options: PrismaHealthCheckOptions) => {
  const { serviceName, prisma } = options;

  const performHealthCheck = async (): Promise<Record<string, unknown>> => {
    await prisma.$queryRaw`SELECT 1`;
    return {
      database: "connected",
    };
  };

  const performReadinessCheck = async (): Promise<void> => {
    await prisma.$queryRaw`SELECT 1`;
  };

  return createHealthCheck({
    serviceName,
    performHealthCheck,
    performReadinessCheck,
  });
};
