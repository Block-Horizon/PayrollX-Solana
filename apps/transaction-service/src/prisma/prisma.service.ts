import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { createTransactionDbConnection } from "@payrollx/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private prisma = createTransactionDbConnection();

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
  get transaction() {
    return this.prisma.transaction;
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }
}
