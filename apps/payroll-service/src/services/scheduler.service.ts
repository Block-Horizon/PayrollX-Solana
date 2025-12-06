import { Logger } from "winston";
import { createPayrollDbConnection } from "@payrollx/database";
import cron from "node-cron";
import { PayrollStatus } from "@payrollx/contracts";
import { executePayrollRun } from "./payroll.service";

type PrismaClient = ReturnType<typeof createPayrollDbConnection>;

export const startScheduler = (prisma: PrismaClient, logger: Logger) => {
  cron.schedule("0 9 * * *", async () => {
    logger.info("Processing scheduled payrolls...");

    const now = new Date();
    const scheduledPayrolls = await prisma.payrollRun.findMany({
      where: {
        status: PayrollStatus.DRAFT,
        scheduledDate: {
          lte: now,
        },
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            employee: {
              include: {
                wallets: true,
              },
            },
          },
        },
      },
    });

    for (const payroll of scheduledPayrolls) {
      try {
        await executePayrollRun(payroll.id, {}, prisma, logger);
        logger.info(`Scheduled payroll executed: ${payroll.id}`);
      } catch (error) {
        logger.error(
          `Failed to execute scheduled payroll ${payroll.id}:`,
          error
        );
      }
    }

    logger.info(`Processed ${scheduledPayrolls.length} scheduled payrolls`);
  });

  cron.schedule("0 * * * *", async () => {
    logger.info("Retrying failed payroll items...");

    const failedItems = await prisma.payrollItem.findMany({
      where: {
        status: PayrollStatus.FAILED,
        retryCount: { lt: 3 },
        deletedAt: null,
      },
      include: {
        payrollRun: true,
        employee: {
          include: {
            wallets: true,
          },
        },
      },
    });

    for (const item of failedItems) {
      try {
        await prisma.payrollItem.update({
          where: { id: item.id },
          data: {
            retryCount: (item.retryCount || 0) + 1,
          },
        });

        logger.info(`Retried payroll item: ${item.id}`);
      } catch (error) {
        logger.error(`Failed to retry payroll item ${item.id}:`, error);
      }
    }

    logger.info(`Retried ${failedItems.length} failed payroll items`);
  });

  logger.info("Scheduler started");
};
