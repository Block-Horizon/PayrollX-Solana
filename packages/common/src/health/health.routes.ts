import { Router, Request, Response } from "express";
import { createHealthCheck, HealthCheckOptions } from "./health-check";

export interface HealthRoutesOptions {
  healthCheck: ReturnType<typeof createHealthCheck>;
  router?: Router;
}

export const createHealthRoutes = (options: HealthRoutesOptions): Router => {
  const router = options.router || Router();
  const { healthCheck } = options;

  router.get("/", async (req: Request, res: Response) => {
    try {
      const result = await healthCheck.check();
      res.status(200).json(result);
    } catch {
      res.status(500).json({
        statusCode: 500,
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.get("/ready", async (req: Request, res: Response) => {
    try {
      const result = await healthCheck.ready();
      res.status(200).json(result);
    } catch {
      res.status(503).json({
        statusCode: 503,
        message: "Service not ready",
        timestamp: new Date().toISOString(),
      });
    }
  });

  router.get("/live", async (req: Request, res: Response) => {
    const result = await healthCheck.live();
    res.status(200).json(result);
  });

  return router;
};

export const createHealthRoutesFromOptions = (
  options: HealthCheckOptions,
  router?: Router
): Router => {
  const healthCheck = createHealthCheck(options);
  return createHealthRoutes({ healthCheck, router });
};
