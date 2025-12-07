import { z } from "zod";

export const createPrismaClient = (databaseUrl: string) => {
  return new (require("@prisma/client").PrismaClient)({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const connectDatabase = async (prisma: any) => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export const disconnectDatabase = async (prisma: any) => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Database disconnection failed:", error);
    throw error;
  }
};

export const validateDatabaseUrl = (url: string) => {
  const urlSchema = z.string().url();
  return urlSchema.safeParse(url);
};

export const getDefaultDatabaseUrl = (service: string): string => {
  const serviceUrls: Record<string, string> = {
    auth: "postgresql://admin:adminpass@localhost:5432/payrollx_auth",
    org: "postgresql://admin:adminpass@localhost:5432/payrollx_org",
    organization: "postgresql://admin:adminpass@localhost:5432/payrollx_org",
    employee: "postgresql://admin:adminpass@localhost:5432/payrollx_employee",
    wallet: "postgresql://admin:adminpass@localhost:5432/payrollx_wallet",
    payroll: "postgresql://admin:adminpass@localhost:5432/payrollx_payroll",
    transaction:
      "postgresql://admin:adminpass@localhost:5432/payrollx_transaction",
    notification:
      "postgresql://admin:adminpass@localhost:5432/payrollx_notification",
    compliance:
      "postgresql://admin:adminpass@localhost:5432/payrollx_compliance",
  };

  return (
    serviceUrls[service] ||
    "postgresql://admin:adminpass@localhost:5432/payrollx"
  );
};
