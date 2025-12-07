import { z } from "zod";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ORG_ADMIN = "org_admin",
  HR_MANAGER = "hr_manager",
  EMPLOYEE = "employee",
}

export const userRoleSchema = z.nativeEnum(UserRole);

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: userRoleSchema,
  organizationId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const refreshTokenSchema = z.object({
  id: z.string().uuid(),
  token: z.string(),
  userId: z.string().uuid(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const authAuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  details: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type AuthAuditLog = z.infer<typeof authAuditLogSchema>;
