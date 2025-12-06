import { Router, Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createWalletDbConnection } from "@payrollx/database";
import { jwtAuth, AuthRequest } from "../middleware/jwt-auth";
import {
  generateWallet,
  findWallet,
  signTransaction,
  getWalletBalance,
} from "./wallet.service";
import { MpcClient } from "../clients/mpc-client";

/**
 * @swagger
 * /api/wallets/generate:
 *   post:
 *     summary: Generate a new wallet
 *     tags: [Wallets]
 *     security:
 *       - JWT-auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               participantCount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Wallet generated successfully
 */
/**
 * @swagger
 * /api/wallets/{id}:
 *   get:
 *     summary: Get wallet by ID
 *     tags: [Wallets]
 *     security:
 *       - JWT-auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *       404:
 *         description: Wallet not found
 */
/**
 * @swagger
 * /api/wallets/{id}/sign:
 *   post:
 *     summary: Sign a transaction
 *     tags: [Wallets]
 *     security:
 *       - JWT-auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toAddress
 *               - amount
 *               - recentBlockHash
 *             properties:
 *               toAddress:
 *                 type: string
 *               amount:
 *                 type: number
 *               memo:
 *                 type: string
 *               recentBlockHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction signed successfully
 *       404:
 *         description: Wallet not found
 */
/**
 * @swagger
 * /api/wallets/{id}/balance:
 *   post:
 *     summary: Get wallet balance
 *     tags: [Wallets]
 *     security:
 *       - JWT-auth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *       404:
 *         description: Wallet not found
 */

type PrismaClient = ReturnType<typeof createWalletDbConnection>;

const generateWalletSchema = z.object({
  employeeId: z.string().uuid(),
  participantCount: z.number().optional(),
});

const signTransactionSchema = z.object({
  toAddress: z.string(),
  amount: z.number(),
  memo: z.string().optional(),
  recentBlockHash: z.string(),
});

const getBalanceSchema = z.object({
  address: z.string().optional(),
});

export const walletRoutes = (prisma: PrismaClient, logger: Logger): Router => {
  const router = Router();
  const mpcClient = new MpcClient();

  router.use(jwtAuth);

  router.post("/generate", async (req: AuthRequest, res: Response) => {
    try {
      const validated = generateWalletSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: "Unauthorized",
          timestamp: new Date().toISOString(),
        });
      }

      const result = await generateWallet(
        validated,
        userId,
        prisma,
        mpcClient,
        logger
      );

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to generate wallet:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to generate wallet",
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const wallet = await findWallet(id, prisma, logger);

      if (!wallet) {
        return res.status(404).json({
          statusCode: 404,
          message: "Wallet not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(wallet);
    } catch (error) {
      logger.error("Failed to find wallet:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to find wallet",
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.post("/:id/sign", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = signTransactionSchema.parse(req.body);

      const result = await signTransaction(
        id,
        validated,
        prisma,
        mpcClient,
        logger
      );

      if (!result) {
        return res.status(404).json({
          statusCode: 404,
          message: "Wallet not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to sign transaction:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to sign transaction",
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.post("/:id/balance", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = getBalanceSchema.parse(req.body);

      const result = await getWalletBalance(id, validated, prisma, logger);

      if (!result) {
        return res.status(404).json({
          statusCode: 404,
          message: "Wallet not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to get balance:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get balance",
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
};
