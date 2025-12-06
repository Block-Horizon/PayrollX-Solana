import { Router } from "express";
import { Logger } from "winston";
import { createComplianceDbConnection } from "@payrollx/database";
import { createComplianceController } from "../controllers/compliance.controller";

/**
 * @swagger
 * /api/compliance/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Compliance]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *   post:
 *     summary: Create audit log entry
 *     tags: [Compliance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - entityType
 *               - entityId
 *             properties:
 *               action:
 *                 type: string
 *               entityType:
 *                 type: string
 *               entityId:
 *                 type: string
 *               userId:
 *                 type: string
 *               details:
 *                 type: object
 *     responses:
 *       201:
 *         description: Audit log created successfully
 */
/**
 * @swagger
 * /api/compliance/reports:
 *   get:
 *     summary: Get compliance reports
 *     tags: [Compliance]
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
/**
 * @swagger
 * /api/compliance/reports/generate:
 *   post:
 *     summary: Generate compliance report
 *     tags: [Compliance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - format
 *               - type
 *             properties:
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               format:
 *                 type: string
 *                 enum: [CSV, PDF]
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report generated successfully
 */
/**
 * @swagger
 * /api/compliance/reports/{id}/download:
 *   get:
 *     summary: Download compliance report
 *     tags: [Compliance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Report download information
 *       404:
 *         description: Report not found or not completed
 */

type PrismaClient = ReturnType<typeof createComplianceDbConnection>;

export const createComplianceRoutes = (
  prisma: PrismaClient,
  logger: Logger
): Router => {
  const router = Router();
  const controller = createComplianceController(prisma, logger);

  router.get("/audit-logs", controller.getAuditLogs);
  router.get("/reports", controller.getReports);
  router.post("/audit-logs", controller.createAuditLog);
  router.post("/reports/generate", controller.generateReport);
  router.get("/reports/:id/download", controller.downloadReport);

  return router;
};
