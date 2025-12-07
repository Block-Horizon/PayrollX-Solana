import { z } from 'zod';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export const createTransactionSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  payrollRunId: z.string().optional(),
  payrollItemId: z.string().optional(),
  transactionType: z.enum(['payroll', 'wallet_funding', 'token_swap', 'fee_payment']),
  fromAddress: z.string().min(1, 'From address is required'),
  toAddress: z.string().min(1, 'To address is required'),
  amount: z.number().positive('Amount must be positive'),
  tokenMint: z.string().min(1, 'Token mint is required'),
  signature: z.string().min(1, 'Signature is required'),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  confirmationCount: z.number().int().nonnegative().optional(),
  blockTime: z.date().optional(),
  errorMessage: z.string().optional(),
});

export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export interface TransactionResponseDto {
  id: string;
  organizationId: string;
  payrollRunId?: string;
  payrollItemId?: string;
  transactionType: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint: string;
  signature: string;
  status: TransactionStatus;
  confirmationCount: number;
  blockTime?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
