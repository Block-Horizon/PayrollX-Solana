import { Logger } from "winston";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { createAuthDbConnection } from "@payrollx/database";
import { RegisterDto, UserDto, UserRole } from "@payrollx/contracts";

type PrismaClient = ReturnType<typeof createAuthDbConnection>;

interface UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JwtPayload {
  email: string;
  sub: string;
  role: string;
  organizationId?: string | null;
}

export const validateUser = async (
  email: string,
  password: string,
  organizationId: string | undefined,
  prisma: PrismaClient,
  logger: Logger
): Promise<UserEntity | null> => {
  logger.debug(`Validating user credentials for email: ${email}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return null;
    }

    if (organizationId && user.organizationId !== organizationId) {
      logger.warn(
        `User ${email} does not belong to organization ${organizationId}`
      );
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    logger.debug(`User ${email} validated successfully`);

    return userWithoutPassword as UserEntity;
  } catch (error) {
    logger.error(`Error validating user ${email}:`, error);
    return null;
  }
};

export const login = async (
  user: UserEntity,
  prisma: PrismaClient,
  logger: Logger
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}> => {
  const correlationId = generateCorrelationId();
  logger.info(`User login initiated: ${user.email}`, {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    correlationId,
  });

  try {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });

    const refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || jwtSecret || "refresh-secret-key";
    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: refreshTokenExpiresIn,
    });

    const expiresInDays = parseInt(refreshTokenExpiresIn, 10) || 7;
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    logger.info(`User ${user.email} logged in successfully`, {
      userId: user.id,
      correlationId,
    });

    return {
      accessToken,
      refreshToken,
      user: userDto,
    };
  } catch (error) {
    logger.error(`Error during login for user ${user.email}:`, error);
    throw new Error("Login failed. Please try again.");
  }
};

export const register = async (
  registerDto: RegisterDto,
  prisma: PrismaClient,
  logger: Logger
): Promise<UserDto> => {
  const correlationId = generateCorrelationId();
  logger.info(`User registration initiated: ${registerDto.email}`, {
    email: registerDto.email,
    organizationId: registerDto.organizationId,
    correlationId,
  });

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      logger.warn(
        `Registration attempt with existing email: ${registerDto.email}`,
        { correlationId }
      );
      throw new Error("User with this email already exists");
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: "EMPLOYEE",
        organizationId: registerDto.organizationId || null,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User ${registerDto.email} registered successfully`, {
      userId: user.id,
      correlationId,
    });

    return {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      firstName: userWithoutPassword.firstName,
      lastName: userWithoutPassword.lastName,
      role: userWithoutPassword.role as UserRole,
      organizationId: userWithoutPassword.organizationId,
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("already exists")) {
      throw error;
    }

    logger.error(`Error during registration for ${registerDto.email}:`, error);
    throw new Error("Registration failed. Please try again.");
  }
};

export const refreshToken = async (
  refreshTokenString: string,
  prisma: PrismaClient,
  logger: Logger
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}> => {
  const correlationId = generateCorrelationId();
  logger.debug("Token refresh initiated", { correlationId });

  try {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: { user: true },
    });

    if (!tokenRecord) {
      logger.warn("Token refresh attempt with non-existent token", {
        correlationId,
      });
      throw new Error("Invalid refresh token");
    }

    if (tokenRecord.expiresAt < new Date()) {
      logger.warn("Token refresh attempt with expired token", {
        tokenId: tokenRecord.id,
        correlationId,
      });
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new Error("Refresh token has expired");
    }

    const user = tokenRecord.user;

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      organizationId: user.organizationId,
    };

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const newAccessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    });

    logger.info(`Token refreshed successfully for user ${user.email}`, {
      userId: user.id,
      correlationId,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage.includes("Invalid refresh token") ||
      errorMessage.includes("expired")
    ) {
      throw error;
    }

    logger.error("Error during token refresh:", error);
    throw new Error("Token refresh failed");
  }
};

export const logout = async (
  refreshTokenString: string,
  prisma: PrismaClient,
  logger: Logger
): Promise<{ message: string }> => {
  const correlationId = generateCorrelationId();
  logger.debug("Logout initiated", { correlationId });

  try {
    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenString },
    });

    if (deletedTokens.count === 0) {
      logger.warn("Logout attempt with non-existent or already deleted token", {
        correlationId,
      });
      return { message: "Logged out successfully" };
    }

    logger.info("User logged out successfully", {
      tokensDeleted: deletedTokens.count,
      correlationId,
    });

    return { message: "Logged out successfully" };
  } catch (error) {
    logger.error("Error during logout:", error);
    return { message: "Logged out successfully" };
  }
};

const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
