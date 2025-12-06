import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createTransactionDbConnection } from "@payrollx/database";
import {
  findAllTransactions,
  findTransactionById,
  createTransaction,
  executeTransaction,
} from "../services/transaction.service";

type PrismaClient = ReturnType<typeof createTransactionDbConnection>;

const createTransactionSchema = z.object({
  organizationId: z.string().uuid(),
  payrollRunId: z.string().uuid().optional(),
  payrollItemId: z.string().uuid().optional(),
  transactionType: z.enum([
    "payroll",
    "wallet_funding",
    "token_swap",
    "fee_payment",
  ]),
  fromAddress: z.string(),
  toAddress: z.string(),
  amount: z.number(),
  tokenMint: z.string(),
  signature: z.string(),
});

export const createTransactionController = (
  prisma: PrismaClient,
  logger: Logger
) => {
  const getAll = async (req: Request, res: Response) => {
    try {
      const transactions = await findAllTransactions(prisma, logger);
      res.status(200).json(transactions);
    } catch (error) {
      logger.error("Failed to get transactions:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get transactions",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transaction = await findTransactionById(id, prisma, logger);

      if (!transaction) {
        return res.status(404).json({
          statusCode: 404,
          message: "Transaction not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(transaction);
    } catch (error) {
      logger.error("Failed to find transaction:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to find transaction",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const create = async (req: Request, res: Response) => {
    try {
      const validated = createTransactionSchema.parse(req.body);
      const transaction = await createTransaction(validated, prisma, logger);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to create transaction:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to create transaction",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const execute = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await executeTransaction(id, prisma, logger);

      if (!result) {
        return res.status(404).json({
          statusCode: 404,
          message: "Transaction not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("not in PENDING status")) {
        return res.status(400).json({
          statusCode: 400,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to execute transaction:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to execute transaction",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    getAll,
    getById,
    create,
    execute,
  };
};
