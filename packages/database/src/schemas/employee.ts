import { z } from "zod";

export enum KycStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const kycStatusSchema = z.nativeEnum(KycStatus);

export const employeeSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  userId: z.string(),
  walletAddress: z.string().nullable(),
  kycStatus: kycStatusSchema,
  kycDocuments: z.record(z.unknown()).nullable(),
  salary: z.number().nullable(),
  paymentToken: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type Employee = z.infer<typeof employeeSchema>;
