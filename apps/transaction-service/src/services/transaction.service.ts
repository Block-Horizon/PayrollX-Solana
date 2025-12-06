import { Logger } from "winston";
import { createTransactionDbConnection } from "@payrollx/database";
import { CreateTransactionDto } from "@payrollx/contracts";
import { createSolanaService, TransactionData } from "./solana.service";

type PrismaClient = ReturnType<typeof createTransactionDbConnection>;

export const findAllTransactions = async (
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    return await prisma.transaction.findMany({
      include: {
        payrollRun: true,
        employee: true,
      },
    });
  } catch (error) {
    logger.error("Failed to find all transactions:", error);
    throw error;
  }
};

export const findTransactionById = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        payrollRun: true,
        employee: true,
      },
    });

    return transaction;
  } catch (error) {
    logger.error(`Failed to find transaction ${id}:`, error);
    throw error;
  }
};

export const createTransaction = async (
  createTransactionDto: CreateTransactionDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const transaction = await prisma.transaction.create({
      data: createTransactionDto,
    });

    logger.info(`Transaction created: ${transaction.id}`);
    return transaction;
  } catch (error) {
    logger.error("Failed to create transaction:", error);
    throw error;
  }
};

export const executeTransaction = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const transaction = await findTransactionById(id, prisma, logger);

  if (!transaction) {
    return null;
  }

  if (transaction.status !== "PENDING") {
    throw new Error(`Transaction ${id} is not in PENDING status`);
  }

  try {
    await prisma.transaction.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    const solanaService = createSolanaService(logger);
    const transactionData: TransactionData = {
      type: transaction.type,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: transaction.amount,
      tokenMint: transaction.tokenMint || undefined,
    };

    const signature = await solanaService.executeTransaction(transactionData);

    await prisma.transaction.update({
      where: { id },
      data: {
        status: "COMPLETED",
        signature,
        completedAt: new Date(),
      },
    });

    logger.info(
      `Transaction executed successfully: ${id}, signature: ${signature}`
    );
    return { signature, status: "COMPLETED" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    await prisma.transaction.update({
      where: { id },
      data: {
        status: "FAILED",
        error: errorMessage,
      },
    });

    logger.error(`Transaction execution failed: ${id}`, error);
    throw error;
  }
};
