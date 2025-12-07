import { Request, Response, NextFunction } from 'express';

export const corsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      statusCode: 403,
      message: 'CORS policy: Origin not allowed',
      error: 'CORS_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }

  next(err);
};
