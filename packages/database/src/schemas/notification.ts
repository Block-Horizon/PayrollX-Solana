import { z } from "zod";

export enum NotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENDING = "SENDING",
  SENT = "SENT",
  FAILED = "FAILED",
}

export const notificationTypeSchema = z.nativeEnum(NotificationType);
export const notificationStatusSchema = z.nativeEnum(NotificationStatus);

export const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: notificationTypeSchema,
  subject: z.string(),
  content: z.string(),
  status: notificationStatusSchema,
  metadata: z.record(z.unknown()).nullable(),
  sentAt: z.date().nullable(),
  deliveredAt: z.date().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Notification = z.infer<typeof notificationSchema>;
