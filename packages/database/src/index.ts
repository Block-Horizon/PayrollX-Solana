export * from "./utils";

export * from "./schemas/auth";
export * from "./schemas/organization";
export * from "./schemas/employee";
export * from "./schemas/wallet";
export * from "./schemas/payroll";
export * from "./schemas/transaction";
export * from "./schemas/notification";
export * from "./schemas/compliance";

import { getDefaultDatabaseUrl } from "./utils";
export const createAuthDbConnection = () => {
  const { PrismaClient } = require("./prisma/auth");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("auth"),
      },
    },
  });
};

export const createOrganizationDbConnection = () => {
  const { PrismaClient } = require("./prisma/org");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("org"),
      },
    },
  });
};

export const createEmployeeDbConnection = () => {
  const { PrismaClient } = require("./prisma/employee");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("employee"),
      },
    },
  });
};

export const createWalletDbConnection = () => {
  const { PrismaClient } = require("./prisma/wallet");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("wallet"),
      },
    },
  });
};

export const createPayrollDbConnection = () => {
  const { PrismaClient } = require("./prisma/payroll");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("payroll"),
      },
    },
  });
};

export const createTransactionDbConnection = () => {
  const { PrismaClient } = require("./prisma/transaction");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("transaction"),
      },
    },
  });
};

export const createNotificationDbConnection = () => {
  const { PrismaClient } = require("./prisma/notification");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("notification"),
      },
    },
  });
};

export const createComplianceDbConnection = () => {
  const { PrismaClient } = require("./prisma/compliance");

  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || getDefaultDatabaseUrl("compliance"),
      },
    },
  });
};
