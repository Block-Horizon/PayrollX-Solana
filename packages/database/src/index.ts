// Export database utilities
export * from "./utils";

// Export database connection helpers
export const createAuthDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/auth/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_auth",
      },
    },
  });
};

export const createOrganizationDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/organization/index.js");

  // Ensure DATABASE_URL is set for localhost
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgresql://admin:adminpass@localhost:5432/payrollx_org";

  console.log("Creating organization DB connection with URL:", databaseUrl);

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const createEmployeeDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/employee/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_employee",
      },
    },
  });
};

export const createWalletDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/wallet/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_wallet",
      },
    },
  });
};

export const createPayrollDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/payroll/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_payroll",
      },
    },
  });
};

export const createTransactionDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/transaction/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_transaction",
      },
    },
  });
};

export const createNotificationDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/notification/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_notification",
      },
    },
  });
};

export const createComplianceDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/compliance/index.js");
  return new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://admin:adminpass@localhost:5432/payrollx_compliance",
      },
    },
  });
};
