import { Router } from "express";
import { Logger } from "winston";
import { createEmployeeDbConnection } from "@payrollx/database";
import {
  createEmployeeController,
  upload,
} from "../controllers/employee.controller";
import { jwtAuth } from "../middleware/jwt-auth";

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     security:
 *       - JWT-auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - userId
 *             properties:
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               userId:
 *                 type: string
 *                 format: uuid
 *               salary:
 *                 type: number
 *               paymentToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       409:
 *         description: Employee already exists
 */
/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
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
 *         description: Employee retrieved successfully
 *       404:
 *         description: Employee not found
 *   patch:
 *     summary: Update employee
 *     tags: [Employees]
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
 *               salary:
 *                 type: number
 *               paymentToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 */
/**
 * @swagger
 * /api/employees/{id}/wallet/link:
 *   post:
 *     summary: Link wallet to employee
 *     tags: [Employees]
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
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet linked successfully
 *       404:
 *         description: Employee not found
 */
/**
 * @swagger
 * /api/employees/{id}/kyc:
 *   post:
 *     summary: Upload KYC documents
 *     tags: [Employees]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - documentType
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC documents uploaded successfully
 *       404:
 *         description: Employee not found
 */
/**
 * @swagger
 * /api/employees/{id}/kyc/verify:
 *   post:
 *     summary: Verify employee KYC
 *     tags: [Employees]
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
 *         description: KYC verification completed
 *       404:
 *         description: Employee not found
 */

type PrismaClient = ReturnType<typeof createEmployeeDbConnection>;

export const createEmployeeRoutes = (
  prisma: PrismaClient,
  logger: Logger
): Router => {
  const router = Router();
  const controller = createEmployeeController(prisma, logger);

  router.use(jwtAuth);

  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.post("/:id/wallet/link", controller.linkWallet);
  router.post("/:id/kyc", upload.single("document"), controller.uploadKyc);
  router.post("/:id/kyc/verify", controller.verifyKyc);

  return router;
};
