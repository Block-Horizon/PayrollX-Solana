import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { createWinstonLogger } from "@payrollx/common";
import { getAppConfig } from "@payrollx/common";
import { createNotificationDbConnection } from "@payrollx/database";
import { connectPrisma } from "@payrollx/common";
import { createPrismaHealthCheck, createHealthRoutes } from "@payrollx/common";
import { createNotificationRoutes } from "./routes/notification.routes";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { swaggerSpec } from "./config/swagger.config";

const app = express();
const config = getAppConfig();
const logger = createWinstonLogger({ serviceName: "notification-service" });

const prisma = createNotificationDbConnection();

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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger(logger));

app.use("/api", limiter);

const healthCheck = createPrismaHealthCheck({
  serviceName: "notification-service",
  prisma,
});

app.use("/health", createHealthRoutes({ healthCheck }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs-json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

app.use("/api/notifications", createNotificationRoutes(prisma, logger));

app.use(errorHandler);

const port = config.port || 3007;

async function bootstrap() {
  try {
    await connectPrisma(prisma);
    logger.info("Database connected successfully");

    app.listen(port, () => {
      logger.info(`🚀 Notification Service running on port ${port}`);
      logger.info(
        `📚 Swagger documentation: http://localhost:${port}/api/docs`
      );
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
