import { z } from 'zod';
import { KycStatus } from './employee';

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  config: z.record(z.unknown()).optional(),
});

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  config: z.record(z.unknown()).optional(),
  authorizedSigners: z.array(z.string()).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;

export interface OrganizationResponseDto {
  id: string;
  name: string;
  config: Record<string, unknown>;
  authorizedSigners: string[];
  onboardingCompleted: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDto {
  id: string;
  organizationId: string;
  userId: string;
  walletAddress?: string;
  kycStatus: KycStatus;
  kycDocuments?: Record<string, unknown>;
  salary?: number;
  paymentToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
