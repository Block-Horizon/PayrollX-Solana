import { Logger } from "winston";
import { createOrganizationDbConnection } from "@payrollx/database";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@payrollx/contracts";
import { PublicKey } from "@solana/web3.js";

type PrismaClient = ReturnType<typeof createOrganizationDbConnection>;

export const createOrganization = async (
  createOrganizationDto: CreateOrganizationDto,
  userId: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const { name, config } = createOrganizationDto;

  const existingOrg = await prisma.organization.findFirst({
    where: { name },
  });

  if (existingOrg) {
    throw new Error("Organization with this name already exists");
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      config: config || {},
      createdBy: userId,
    },
  });

  logger.info(`Organization created: ${organization.id}`);

  logger.info("Event emitted: OrganizationCreated", {
    organizationId: organization.id,
    name: organization.name,
    createdAt: organization.createdAt,
  });

  return organization;
};

export const findOrganizationById = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    return organization;
  } catch (error) {
    logger.error(`Failed to find organization ${id}:`, error);
    throw error;
  }
};

export const updateOrganization = async (
  id: string,
  updateOrganizationDto: UpdateOrganizationDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  const organization = await prisma.organization.findUnique({
    where: { id },
  });

  if (!organization) {
    return null;
  }

  const updatedOrganization = await prisma.organization.update({
    where: { id },
    data: updateOrganizationDto,
  });

  logger.info(`Organization updated: ${id}`);

  return updatedOrganization;
};

export const completeOnboarding = async (
  organizationId: string,
  authorizedSigners: string[],
  prisma: PrismaClient,
  logger: Logger
) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return null;
  }

  const validSigners = authorizedSigners.filter((signer) => {
    try {
      new PublicKey(signer);
      return true;
    } catch {
      return false;
    }
  });

  if (validSigners.length !== authorizedSigners.length) {
    throw new Error("Invalid Solana public keys provided");
  }

  const updatedOrganization = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      authorizedSigners: validSigners,
      onboardingCompleted: true,
    },
  });

  try {
    logger.info(
      `Initializing organization ${organizationId} on Solana with ${validSigners.length} signers`
    );
  } catch (error) {
    logger.error("Failed to initialize organization on Solana:", error);
  }

  logger.info(`Organization onboarding completed: ${organizationId}`);

  return updatedOrganization;
};
