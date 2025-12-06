import { Router } from 'express';
import { Logger } from 'winston';
import { createGatewayController } from '../controllers/gateway.controller';

/**
 * @swagger
 * /api/auth/{path}:
 *   get:
 *     summary: Proxy to auth service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to auth service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/org/{path}:
 *   get:
 *     summary: Proxy to org service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to org service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/employee/{path}:
 *   get:
 *     summary: Proxy to employee service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to employee service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/wallet/{path}:
 *   get:
 *     summary: Proxy to wallet service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to wallet service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/payroll/{path}:
 *   get:
 *     summary: Proxy to payroll service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to payroll service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/transaction/{path}:
 *   get:
 *     summary: Proxy to transaction service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to transaction service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/notification/{path}:
 *   get:
 *     summary: Proxy to notification service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to notification service
 *     responses:
 *       200:
 *         description: Success
 */
/**
 * @swagger
 * /api/compliance/{path}:
 *   get:
 *     summary: Proxy to compliance service
 *     tags: [Gateway]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to proxy to compliance service
 *     responses:
 *       200:
 *         description: Success
 */
export const createGatewayRoutes = (logger: Logger): Router => {
  const router = Router();
  const controller = createGatewayController(logger);

  router.all('/auth/*', controller.proxyToAuth);
  router.all('/org/*', controller.proxyToOrg);
  router.all('/employee/*', controller.proxyToEmployee);
  router.all('/wallet/*', controller.proxyToWallet);
  router.all('/payroll/*', controller.proxyToPayroll);
  router.all('/transaction/*', controller.proxyToTransaction);
  router.all('/notification/*', controller.proxyToNotification);
  router.all('/compliance/*', controller.proxyToCompliance);

  return router;
};
