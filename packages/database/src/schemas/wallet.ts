import { z } from "zod";

export enum WalletProvider {
  MPC = "MPC",
  SOLANA = "SOLANA",
}

export const walletProviderSchema = z.nativeEnum(WalletProvider);

export const walletSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string(),
  publicKey: z.string(),
  keyShareIds: z.array(z.string()),
  provider: walletProviderSchema,
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const walletTransactionSchema = z.object({
  id: z.string().uuid(),
  walletId: z.string(),
  toAddress: z.string(),
  amount: z.number(),
  signature: z.string(),
  status: z.string(),
  transactionHash: z.string().nullable(),
  blockNumber: z.string().nullable(),
  gasUsed: z.string().nullable(),
  gasPrice: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Wallet = z.infer<typeof walletSchema>;
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;
