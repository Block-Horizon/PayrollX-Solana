import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prisma: any;

  constructor() {
    // Create PrismaClient directly with correct URL
    const {
      PrismaClient,
    } = require("../../../../node_modules/.prisma/organization/index.js");
    const databaseUrl =
      process.env.DATABASE_URL ||
      "postgresql://admin:adminpass@localhost:5432/payrollx_main";

    this.logger.log("Creating PrismaClient with URL:", databaseUrl);

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log("Database connected successfully");
    } catch (error) {
      this.logger.error("Database connection failed:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.prisma.$disconnect();
      this.logger.log("Database disconnected successfully");
    } catch (error) {
      this.logger.error("Database disconnection failed:", error);
      throw error;
    }
  }

  // Expose the prisma client properties
  get organization() {
    return this.prisma.organization;
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }
}
