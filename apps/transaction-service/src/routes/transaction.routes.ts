import { Router } from "express";
import { Logger } from "winston";
import { createTransactionDbConnection } from "@payrollx/database";
import { createTransactionController } from "../controllers/transaction.controller";

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List of transactions
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - toAddress
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 format: uuid
 *               toAddress:
 *                 type: string
 *               amount:
 *                 type: number
 *               memo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 */
/**
 * @swagger
 * /api/transactions/{id}/execute:
 *   post:
 *     summary: Execute a transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction executed successfully
 *       404:
 *         description: Transaction not found
 */

type PrismaClient = ReturnType<typeof createTransactionDbConnection>;

export const createTransactionRoutes = (
  prisma: PrismaClient,
  logger: Logger
): Router => {
  const router = Router();
  const controller = createTransactionController(prisma, logger);

  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.post("/:id/execute", controller.execute);

  return router;
};
