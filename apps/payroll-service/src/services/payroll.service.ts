import { Logger } from "winston";
import { createPayrollDbConnection } from "@payrollx/database";
import {
  CreatePayrollRunDto,
  ExecutePayrollRunDto,
  PayrollStatus,
} from "@payrollx/contracts";

type PrismaClient = ReturnType<typeof createPayrollDbConnection>;

export const createPayrollRun = async (
  createPayrollRunDto: CreatePayrollRunDto,
  createdBy: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const { organizationId, scheduledDate, currency, items } =
    createPayrollRunDto;

  const employeeIds = items.map((item) => item.employeeId);
  const employees = await prisma.employee.findMany({
    where: {
      id: { in: employeeIds },
      organizationId,
      kycStatus: "APPROVED",
      deletedAt: null,
    },
    include: {
      wallets: true,
    },
  });

  if (employees.length !== employeeIds.length) {
    throw new Error("Some employees are not found or not approved for payroll");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const payrollRun = await prisma.payrollRun.create({
    data: {
      organizationId,
      status: PayrollStatus.DRAFT,
      scheduledDate: new Date(scheduledDate),
      totalAmount,
      currency,
      createdBy,
      items: {
        create: items.map((item) => ({
          employeeId: item.employeeId,
          amount: item.amount,
          status: PayrollStatus.DRAFT,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  logger.info(`Payroll run created: ${payrollRun.id}`);

  return payrollRun;
};

export const getPayrollRun = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const payrollRun = await prisma.payrollRun.findUnique({
      where: { id, deletedAt: null },
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

    return payrollRun;
  } catch (error) {
    logger.error(`Failed to get payroll run ${id}:`, error);
    throw error;
  }
};

export const getPayrollRuns = async (
  organizationId: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    return await prisma.payrollRun.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error(
      `Failed to get payroll runs for organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

export const executePayrollRun = async (
  id: string,
  executePayrollRunDto: ExecutePayrollRunDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  const payrollRun = await prisma.payrollRun.findUnique({
    where: { id, deletedAt: null },
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

  if (!payrollRun) {
    return null;
  }

  if (payrollRun.status !== PayrollStatus.DRAFT) {
    throw new Error("Payroll run cannot be executed in current status");
  }

  await prisma.payrollRun.update({
    where: { id },
    data: { status: PayrollStatus.PENDING },
  });

  try {
    logger.log("Event emitted: PayrollInitiated", {
      payrollRunId: payrollRun.id,
      organizationId: payrollRun.organizationId,
      totalAmount: payrollRun.totalAmount,
      currency: payrollRun.currency,
      items: payrollRun.items.map(
        (item: {
          employeeId: string;
          amount: number;
          employee: { wallets: Array<{ publicKey: string }> };
        }) => ({
          employeeId: item.employeeId,
          amount: item.amount,
          walletAddress: item.employee.wallets[0]?.publicKey,
        })
      ),
    });

    logger.info(`Payroll run initiated: ${id}`);

    return {
      id: payrollRun.id,
      status: PayrollStatus.PENDING,
      message: "Payroll run initiated successfully",
    };
  } catch (error) {
    await prisma.payrollRun.update({
      where: { id },
      data: { status: PayrollStatus.DRAFT },
    });

    logger.error(`Failed to initiate payroll run ${id}:`, error);
    throw error;
  }
};

export const updatePayrollItemStatus = async (
  itemId: string,
  status: PayrollStatus,
  prisma: PrismaClient,
  logger: Logger,
  txSignature?: string
) => {
  await prisma.payrollItem.update({
    where: { id: itemId },
    data: {
      status,
      txSignature,
    },
  });

  const payrollItem = await prisma.payrollItem.findUnique({
    where: { id: itemId },
    include: { payrollRun: true },
  });

  if (payrollItem) {
    const allItems = await prisma.payrollItem.findMany({
      where: { payrollRunId: payrollItem.payrollRunId },
    });

    const allCompleted = allItems.every(
      (item: { status: PayrollStatus }) =>
        item.status === PayrollStatus.COMPLETED ||
        item.status === PayrollStatus.FAILED
    );

    if (allCompleted) {
      const completedCount = allItems.filter(
        (item: { status: PayrollStatus }) =>
          item.status === PayrollStatus.COMPLETED
      ).length;
      const finalStatus =
        completedCount === allItems.length
          ? PayrollStatus.COMPLETED
          : PayrollStatus.FAILED;

      await prisma.payrollRun.update({
        where: { id: payrollItem.payrollRunId },
        data: { status: finalStatus },
      });

      logger.log("Event emitted: PayrollCompleted", {
        payrollRunId: payrollItem.payrollRunId,
        status: finalStatus,
        completedItems: completedCount,
        totalItems: allItems.length,
      });
    }
  }
};
