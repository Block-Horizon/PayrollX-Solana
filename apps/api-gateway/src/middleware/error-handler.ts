import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  error?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const error = err.error || getErrorCode(statusCode);

  if (res.headersSent) {
    return _next(err);
  }

  res.status(statusCode).json({
    statusCode,
    message,
    error,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

const getErrorCode = (statusCode: number): string => {
  const errorCodes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };

  return errorCodes[statusCode] || 'INTERNAL_SERVER_ERROR';
};
