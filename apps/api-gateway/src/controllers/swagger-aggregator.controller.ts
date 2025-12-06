import { Request, Response } from 'express';
import { Logger } from 'winston';
import { getMergedSpec } from '../services/swagger-aggregator.service';

export const createSwaggerAggregatorController = (logger: Logger) => {
  const getMergedSpecHandler = async (req: Request, res: Response) => {
    try {
      const forceRefresh = req.query.forceRefresh === 'true';
      const spec = await getMergedSpec(logger, forceRefresh);

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(spec);
    } catch (error) {
      logger.error('Failed to get merged spec:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Failed to get merged spec',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    getMergedSpec: getMergedSpecHandler,
  };
};
