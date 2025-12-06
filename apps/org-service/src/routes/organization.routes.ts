import { Router } from "express";
import { Logger } from "winston";
import { createOrganizationDbConnection } from "@payrollx/database";
import { createOrganizationController } from "../controllers/organization.controller";
import { jwtAuth } from "../middleware/jwt-auth";

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - JWT-auth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Acme Corp
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Organization created successfully
 *       409:
 *         description: Organization already exists
 */
/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
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
 *         description: Organization retrieved successfully
 *       404:
 *         description: Organization not found
 *   patch:
 *     summary: Update organization
 *     tags: [Organizations]
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
 *               name:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       404:
 *         description: Organization not found
 */
/**
 * @swagger
 * /api/organizations/{id}/onboard:
 *   post:
 *     summary: Complete organization onboarding
 *     tags: [Organizations]
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
 *               - authorizedSigners
 *             properties:
 *               authorizedSigners:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Organization onboarding completed
 *       404:
 *         description: Organization not found
 */

type PrismaClient = ReturnType<typeof createOrganizationDbConnection>;

export const createOrganizationRoutes = (
  prisma: PrismaClient,
  logger: Logger
): Router => {
  const router = Router();
  const controller = createOrganizationController(prisma, logger);

  router.use(jwtAuth);

  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.post("/:id/onboard", controller.onboard);

  return router;
};
