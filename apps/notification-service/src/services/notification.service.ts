import { Logger } from "winston";
import { createNotificationDbConnection } from "@payrollx/database";
import { createEmailService } from "./email.service";
import { createSmsService } from "./sms.service";

type PrismaClient = ReturnType<typeof createNotificationDbConnection>;

export interface CreateNotificationDto {
  userId?: string;
  type: "EMAIL" | "SMS";
  recipient: string;
  subject?: string;
  content: string;
  status?: string;
}

export const findAllNotifications = async (
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    return await prisma.notification.findMany({
      include: {
        user: true,
      },
    });
  } catch (error) {
    logger.error("Failed to find all notifications:", error);
    throw error;
  }
};

export const findNotificationById = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    return await prisma.notification.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  } catch (error) {
    logger.error(`Failed to find notification ${id}:`, error);
    throw error;
  }
};

export const createNotification = async (
  createNotificationDto: CreateNotificationDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const notification = await prisma.notification.create({
      data: createNotificationDto,
    });

    logger.info(`Notification created: ${notification.id}`);
    return notification;
  } catch (error) {
    logger.error("Failed to create notification:", error);
    throw error;
  }
};

export const sendNotification = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  const notification = await findNotificationById(id, prisma, logger);

  if (!notification) {
    throw new Error(`Notification with ID ${id} not found`);
  }

  try {
    await prisma.notification.update({
      where: { id },
      data: { status: "SENDING" },
    });

    const emailService = createEmailService(logger);
    const smsService = createSmsService(logger);

    let result;
    switch (notification.type) {
      case "EMAIL":
        result = await emailService.sendEmail({
          recipient: notification.recipient,
          subject: notification.subject || "",
          content: notification.content,
        });
        break;
      case "SMS":
        result = await smsService.sendSms({
          recipient: notification.recipient,
          content: notification.content,
        });
        break;
      default:
        throw new Error(`Unsupported notification type: ${notification.type}`);
    }

    await prisma.notification.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    logger.info(`Notification sent successfully: ${id}`);
    return result;
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);

    await prisma.notification.update({
      where: { id },
      data: {
        status: "FAILED",
        error: errorMessage,
      },
    });

    logger.error(`Notification sending failed: ${id}`, error);
    throw error;
  }
};
