import { z } from "zod";

export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export enum TransactionType {
  PAYROLL = "PAYROLL",
  BONUS = "BONUS",
  REFUND = "REFUND",
}

export const transactionStatusSchema = z.nativeEnum(TransactionStatus);
export const transactionTypeSchema = z.nativeEnum(TransactionType);

export const transactionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  payrollRunId: z.string().nullable(),
  payrollItemId: z.string().nullable(),
  transactionType: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  amount: z.number(),
  tokenMint: z.string(),
  signature: z.string(),
  status: transactionStatusSchema,
  confirmationCount: z.number(),
  blockTime: z.date().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof transactionSchema>;
