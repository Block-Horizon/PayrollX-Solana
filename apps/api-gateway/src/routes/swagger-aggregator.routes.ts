import { Router } from 'express';
import { Logger } from 'winston';
import { createSwaggerAggregatorController } from '../controllers/swagger-aggregator.controller';

/**
 * @swagger
 * /api/docs/unified:
 *   get:
 *     summary: Get merged OpenAPI spec
 *     description: Returns the merged OpenAPI spec from all microservices
 *     tags: [Swagger]
 *     parameters:
 *       - in: query
 *         name: forceRefresh
 *         schema:
 *           type: boolean
 *         description: Force refresh of the cached spec
 *     responses:
 *       200:
 *         description: Merged OpenAPI spec
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export const createSwaggerAggregatorRoutes = (logger: Logger): Router => {
  const router = Router();
  const controller = createSwaggerAggregatorController(logger);

  router.get('/docs/unified', controller.getMergedSpec);

  return router;
};
