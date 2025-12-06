import { Logger } from "winston";
import { createEmployeeDbConnection } from "@payrollx/database";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  KycStatus,
} from "@payrollx/contracts";

type PrismaClient = ReturnType<typeof createEmployeeDbConnection>;

export const createEmployee = async (
  createEmployeeDto: CreateEmployeeDto,
  createdBy: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const { organizationId, userId, salary, paymentToken } = createEmployeeDto;

  const existingEmployee = await prisma.employee.findFirst({
    where: {
      organizationId,
      userId,
      deletedAt: null,
    },
  });

  if (existingEmployee) {
    throw new Error(
      "Employee already exists for this user in this organization"
    );
  }

  const employee = await prisma.employee.create({
    data: {
      organizationId,
      userId,
      salary: salary ? parseFloat(salary.toString()) : null,
      paymentToken,
      kycStatus: KycStatus.PENDING,
    },
  });

  logger.info(`Employee created: ${employee.id}`);

  logger.info("Event emitted: EmployeeCreated", {
    employeeId: employee.id,
    organizationId: employee.organizationId,
    userId: employee.userId,
    createdAt: employee.createdAt,
  });

  return employee;
};

export const findEmployeeById = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: {
        organization: true,
      },
    });

    return employee;
  } catch (error) {
    logger.error(`Failed to find employee ${id}:`, error);
    throw error;
  }
};

export const updateEmployee = async (
  id: string,
  updateEmployeeDto: UpdateEmployeeDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  const employee = await prisma.employee.findUnique({
    where: { id, deletedAt: null },
  });

  if (!employee) {
    return null;
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: {
      ...updateEmployeeDto,
      salary: updateEmployeeDto.salary
        ? parseFloat(updateEmployeeDto.salary.toString())
        : undefined,
    },
  });

  logger.info(`Employee updated: ${id}`);

  return updatedEmployee;
};

export const linkWallet = async (
  employeeId: string,
  walletAddress: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, deletedAt: null },
  });

  if (!employee) {
    return null;
  }

  if (!isValidSolanaAddress(walletAddress)) {
    throw new Error("Invalid Solana wallet address");
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: { walletAddress },
  });

  logger.info(`Wallet linked for employee: ${employeeId}`);

  return updatedEmployee;
};

export const uploadKycDocuments = async (
  employeeId: string,
  kycDocumentDto: { documentType: string },
  file: Express.Multer.File,
  prisma: PrismaClient,
  logger: Logger
) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, deletedAt: null },
  });

  if (!employee) {
    return null;
  }

  const documentMetadata = {
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    documentType: kycDocumentDto.documentType,
  };

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      kycDocuments: documentMetadata,
      kycStatus: KycStatus.VERIFIED,
    },
  });

  logger.info(`KYC documents uploaded for employee: ${employeeId}`);

  return updatedEmployee;
};

export const verifyKyc = async (
  employeeId: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, deletedAt: null },
  });

  if (!employee) {
    return null;
  }

  if (employee.kycStatus !== KycStatus.VERIFIED) {
    throw new Error("Employee KYC is not in verified status");
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employeeId },
    data: { kycStatus: KycStatus.APPROVED },
  });

  logger.info(`KYC approved for employee: ${employeeId}`);

  logger.info("Event emitted: EmployeeVerified", {
    employeeId: employee.id,
    organizationId: employee.organizationId,
    verifiedAt: new Date().toISOString(),
  });

  return updatedEmployee;
};

const isValidSolanaAddress = (address: string): boolean => {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
};
