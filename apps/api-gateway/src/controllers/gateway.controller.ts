import type { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { proxyRequest } from '../services/gateway.service';
import type { AppError } from '../middleware/error-handler';

export const createGatewayController = (logger: Logger) => {
  const proxyToService = async (
    service: string,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const pathMatch = req.path.match(new RegExp(`^/${service}/(.*)$`));
      const wildcardPath = pathMatch ? pathMatch[1] : '';
      const params: Record<string, string | string[]> = {
        '0': wildcardPath,
      };
      const query = req.query as Record<string, string | string[]>;
      const body = req.body;
      const method = req.method;
      const correlationId = req.headers['x-correlation-id'] as
        | string
        | undefined;
      const headers = req.headers as Record<string, string>;

      const result = await proxyRequest(
        service,
        params,
        query,
        body,
        method,
        correlationId,
        headers,
        logger,
      );

      res.status(200).json(result);
    } catch (error) {
      logger.error(`Failed to proxy request to ${service}:`, error);

      if (error instanceof Error && 'statusCode' in error) {
        const appError = error as AppError;
        next(appError);
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode =
        error && typeof error === 'object' && 'statusCode' in error
          ? (error.statusCode as number)
          : 500;

      const appError: AppError = new Error(errorMessage);
      appError.statusCode = statusCode;
      appError.error =
        error && typeof error === 'object' && 'error' in error
          ? (error.error as string)
          : undefined;

      next(appError);
    }
  };

  return {
    proxyToAuth: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('auth', req, res, next),
    proxyToOrg: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('org', req, res, next),
    proxyToEmployee: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('employee', req, res, next),
    proxyToWallet: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('wallet', req, res, next),
    proxyToPayroll: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('payroll', req, res, next),
    proxyToTransaction: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('transaction', req, res, next),
    proxyToNotification: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('notification', req, res, next),
    proxyToCompliance: (req: Request, res: Response, next: NextFunction) =>
      proxyToService('compliance', req, res, next),
  };
};
