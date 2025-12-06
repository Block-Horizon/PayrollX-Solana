export interface PrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $queryRaw: (
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<unknown>;
}

export const connectPrisma = async (prisma: PrismaClient): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export const disconnectPrisma = async (prisma: PrismaClient): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Database disconnection failed:", error);
    throw error;
  }
};

export const createPrismaClientHelpers = (prisma: PrismaClient) => {
  return {
    connect: () => connectPrisma(prisma),
    disconnect: () => disconnectPrisma(prisma),
    queryRaw: prisma.$queryRaw,
  };
};
