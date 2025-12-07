import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { createWinstonLogger } from '@payrollx/common';
import { getAppConfig } from '@payrollx/common';
import { createHealthCheck, createHealthRoutes } from '@payrollx/common';
import { createGatewayRoutes } from './routes/gateway.routes';
import { createSwaggerAggregatorRoutes } from './routes/swagger-aggregator.routes';
import { errorHandler } from './middleware/error-handler';
import { corsErrorHandler } from './middleware/cors-error-handler';
import { requestLogger } from './middleware/request-logger';
import { swaggerSpec } from './config/swagger.config';

const app = express();
const config = getAppConfig();
const logger = createWinstonLogger({ serviceName: 'api-gateway' });

const limiter = rateLimit({
  windowMs: 60000,
  max: 100,
  handler: (req, res) => {
    res.status(429).json({
      statusCode: 429,
      message: 'Too many requests from this IP, please try again later.',
      error: 'TOO_MANY_REQUESTS',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  },
});

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (config.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const error = new Error('Not allowed by CORS') as Error & {
          statusCode?: number;
          error?: string;
        };
        error.statusCode = 403;
        error.error = 'CORS_ERROR';
        callback(error, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Correlation-ID',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger(logger));

app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  return limiter(req, res, next);
});

app.get('/', (_req, res) => {
  res.json({ message: 'PayrollX API Gateway' });
});

const healthCheck = createHealthCheck({
  serviceName: 'api-gateway',
  performHealthCheck: async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
  }),
  performReadinessCheck: async () => {
    return;
  },
});

app.use('/health', createHealthRoutes({ healthCheck }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', createSwaggerAggregatorRoutes(logger));
app.use('/api', createGatewayRoutes(logger));

app.use((_req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found',
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: _req.path,
  });
});

app.use(corsErrorHandler);
app.use(errorHandler);

const port = config.port || 3000;

async function bootstrap() {
  try {
    app.listen(port, () => {
      logger.info(`🚀 API Gateway running on port ${port}`);
      logger.info(
        `📚 Swagger documentation: http://localhost:${port}/api/docs`,
      );
      logger.info(`🔍 Health check: http://localhost:${port}/health`);
      logger.info(
        `📋 Unified API spec: http://localhost:${port}/api/docs/unified`,
      );
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
