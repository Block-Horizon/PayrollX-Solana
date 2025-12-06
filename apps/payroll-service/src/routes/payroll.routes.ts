import { Router } from "express";
import { Logger } from "winston";
import { createPayrollDbConnection } from "@payrollx/database";
import { createPayrollController } from "../controllers/payroll.controller";
import { jwtAuth } from "../middleware/jwt-auth";

/**
 * @swagger
 * /api/payroll/runs:
 *   post:
 *     summary: Create a new payroll run
 *     tags: [Payroll]
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
 *               - scheduledDate
 *               - items
 *             properties:
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - employeeId
 *                     - amount
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: number
 *     responses:
 *       201:
 *         description: Payroll run created successfully
 *   get:
 *     summary: Get all payroll runs
 *     tags: [Payroll]
 *     security:
 *       - JWT-auth: []
 *     responses:
 *       200:
 *         description: List of payroll runs
 */
/**
 * @swagger
 * /api/payroll/runs/{id}:
 *   get:
 *     summary: Get payroll run by ID
 *     tags: [Payroll]
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
 *         description: Payroll run retrieved successfully
 *       404:
 *         description: Payroll run not found
 */
/**
 * @swagger
 * /api/payroll/runs/{id}/execute:
 *   post:
 *     summary: Execute a payroll run
 *     tags: [Payroll]
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
 *             properties:
 *               force:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Payroll run executed successfully
 *       404:
 *         description: Payroll run not found
 */

type PrismaClient = ReturnType<typeof createPayrollDbConnection>;

export const createPayrollRoutes = (
  prisma: PrismaClient,
  logger: Logger
): Router => {
  const router = Router();
  const controller = createPayrollController(prisma, logger);

  router.use(jwtAuth);

  router.post("/runs", controller.create);
  router.get("/runs", controller.getAll);
  router.get("/runs/:id", controller.getById);
  router.post("/runs/:id/execute", controller.execute);

  return router;
};
