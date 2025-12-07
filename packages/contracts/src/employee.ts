import { z } from 'zod';

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const kycStatusSchema = z.nativeEnum(KycStatus);

export const createEmployeeSchema = z.object({
  organizationId: z.string().uuid('Organization ID must be a valid UUID'),
  userId: z.string().uuid('User ID must be a valid UUID'),
  salary: z.number().positive().optional(),
  paymentToken: z.string().optional(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  salary: z.number().positive().optional(),
  paymentToken: z.string().optional(),
  kycStatus: kycStatusSchema.optional(),
});

export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;

export const linkWalletSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
});

export type LinkWalletDto = z.infer<typeof linkWalletSchema>;

export const kycDocumentSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  description: z.string().optional(),
});

export type KycDocumentDto = z.infer<typeof kycDocumentSchema>;

export interface EmployeeResponseDto {
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
