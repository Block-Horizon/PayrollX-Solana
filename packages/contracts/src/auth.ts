import { z } from 'zod';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  HR_MANAGER = 'hr_manager',
  EMPLOYEE = 'employee',
}

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  organizationId: z.string().uuid('Organization ID must be a valid UUID').optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name must be a string'),
  lastName: z.string().min(1, 'Last name must be a string'),
  organizationId: z.string().uuid('Organization ID must be a valid UUID').optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token must be a string'),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface LogoutResponseDto {
  message: string;
}
