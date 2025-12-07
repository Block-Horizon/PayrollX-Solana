import { z } from 'zod';

export const generateWalletSchema = z.object({
  employeeId: z.string().uuid('Employee ID must be a valid UUID'),
  participantCount: z.number().int().positive().optional().default(3),
});

export type GenerateWalletDto = z.infer<typeof generateWalletSchema>;

export const signTransactionSchema = z.object({
  toAddress: z.string().min(1, 'Recipient address is required'),
  amount: z.number().positive('Amount must be positive'),
  memo: z.string().optional(),
  recentBlockHash: z.string().min(1, 'Recent block hash is required'),
});

export type SignTransactionDto = z.infer<typeof signTransactionSchema>;

export const getBalanceSchema = z.object({
  address: z.string().optional(),
});

export type GetBalanceDto = z.infer<typeof getBalanceSchema>;

export interface WalletResponseDto {
  id: string;
  employeeId: string;
  publicKey: string;
  keyShareIds: string[];
  provider: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignTransactionResponseDto {
  signature: string;
  transactionId: string;
  walletId: string;
  signedAt: string;
}

export interface BalanceResponseDto {
  walletId: string;
  address: string;
  balance: number;
  lamports: number;
  sol: number;
  checkedAt: string;
}
