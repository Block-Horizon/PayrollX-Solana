import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createWinstonLogger } from "@payrollx/common/logging";
import { getAppConfig } from "@payrollx/common/config";
import { createAuthDbConnection } from "@payrollx/database";
import { connectPrisma } from "@payrollx/common/prisma";
import {
  createPrismaHealthCheck,
  createHealthRoutes,
} from "@payrollx/common/health";
import { createAuthRoutes } from "./routes/auth.routes";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { swaggerSpec } from "./config/swagger.config";

const app = express();
const config = getAppConfig();
const logger = createWinstonLogger({ serviceName: "auth-service" });

const prisma = createAuthDbConnection();

const limiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-Correlation-ID",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger(logger));

app.use("/api", limiter);

const healthCheck = createPrismaHealthCheck({
  serviceName: "auth-service",
  prisma,
});

app.use("/health", createHealthRoutes({ healthCheck }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs-json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

app.use("/api/auth", createAuthRoutes(prisma, logger));

app.use(errorHandler);

const port = config.port || 3001;

async function bootstrap() {
  try {
    await connectPrisma(prisma);
    logger.info("Database connected successfully");

    app.listen(port, () => {
      logger.info(`🚀 Auth Service running on port ${port}`);
      logger.info(
        `📚 Swagger documentation: http://localhost:${port}/api/docs`
      );
      logger.info(`🔍 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});
