import { z } from 'zod';

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export const createNotificationSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  recipientId: z.string().min(1, 'Recipient ID is required'),
  type: z.nativeEnum(NotificationType),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

export interface NotificationResponseDto {
  id: string;
  organizationId: string;
  recipientId: string;
  type: NotificationType;
  subject: string;
  content: string;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
