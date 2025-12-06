import { Router } from "express";
import { Logger } from "winston";
import { createNotificationDbConnection } from "@payrollx/database";
import { createNotificationController } from "../controllers/notification.controller";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - recipient
 *               - content
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [EMAIL, SMS]
 *               recipient:
 *                 type: string
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       404:
 *         description: Notification not found
 */
/**
 * @swagger
 * /api/notifications/{id}/send:
 *   post:
 *     summary: Send notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       404:
 *         description: Notification not found
 */

type PrismaClient = ReturnType<typeof createNotificationDbConnection>;

export const createNotificationRoutes = (
  prisma: PrismaClient,
  logger: Logger
): Router => {
  const router = Router();
  const controller = createNotificationController(prisma, logger);

  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.post("/:id/send", controller.send);

  return router;
};
