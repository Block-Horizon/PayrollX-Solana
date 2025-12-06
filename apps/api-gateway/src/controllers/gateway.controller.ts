import { Request, Response } from 'express';
import { Logger } from 'winston';
import { proxyRequest } from '../services/gateway.service';

export const createGatewayController = (logger: Logger) => {
  const proxyToService = async (
    service: string,
    req: Request,
    res: Response,
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode =
        error && typeof error === 'object' && 'statusCode' in error
          ? (error.statusCode as number)
          : 500;

      logger.error(`Failed to proxy request to ${service}:`, error);
      res.status(statusCode).json({
        statusCode,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        path: `/api/${service}/*`,
      });
    }
  };

  return {
    proxyToAuth: (req: Request, res: Response) =>
      proxyToService('auth', req, res),
    proxyToOrg: (req: Request, res: Response) =>
      proxyToService('org', req, res),
    proxyToEmployee: (req: Request, res: Response) =>
      proxyToService('employee', req, res),
    proxyToWallet: (req: Request, res: Response) =>
      proxyToService('wallet', req, res),
    proxyToPayroll: (req: Request, res: Response) =>
      proxyToService('payroll', req, res),
    proxyToTransaction: (req: Request, res: Response) =>
      proxyToService('transaction', req, res),
    proxyToNotification: (req: Request, res: Response) =>
      proxyToService('notification', req, res),
    proxyToCompliance: (req: Request, res: Response) =>
      proxyToService('compliance', req, res),
  };
};
