import { Request, Response } from "express";
import { Logger } from "winston";
import { z } from "zod";
import { createNotificationDbConnection } from "@payrollx/database";
import {
  findAllNotifications,
  findNotificationById,
  createNotification,
  sendNotification,
} from "../services/notification.service";

type PrismaClient = ReturnType<typeof createNotificationDbConnection>;

const createNotificationSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(["EMAIL", "SMS"]),
  recipient: z.string(),
  subject: z.string().optional(),
  content: z.string().min(1),
  status: z.string().optional(),
});

export const createNotificationController = (
  prisma: PrismaClient,
  logger: Logger
) => {
  const getAll = async (req: Request, res: Response) => {
    try {
      const notifications = await findAllNotifications(prisma, logger);
      res.status(200).json(notifications);
    } catch (error) {
      logger.error("Failed to get all notifications:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get notifications",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notification = await findNotificationById(id, prisma, logger);

      if (!notification) {
        return res.status(404).json({
          statusCode: 404,
          message: "Notification not found",
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json(notification);
    } catch (error) {
      logger.error("Failed to get notification:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to get notification",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const create = async (req: Request, res: Response) => {
    try {
      const validated = createNotificationSchema.parse(req.body);
      const notification = await createNotification(validated, prisma, logger);

      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: "Validation error",
          errors: error.errors,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to create notification:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to create notification",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const send = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await sendNotification(id, prisma, logger);

      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("not found")) {
        return res.status(404).json({
          statusCode: 404,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }

      logger.error("Failed to send notification:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Failed to send notification",
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    getAll,
    getById,
    create,
    send,
  };
};
