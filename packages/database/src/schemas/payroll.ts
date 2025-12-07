import { z } from "zod";

export enum PayrollStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export const payrollStatusSchema = z.nativeEnum(PayrollStatus);

export const payrollItemSchema = z.object({
  employeeId: z.string(),
  amount: z.number(),
});

export const payrollRunSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  name: z.string().nullable(),
  payPeriodStart: z.date(),
  payPeriodEnd: z.date(),
  payDate: z.date(),
  totalAmount: z.number(),
  currency: z.string(),
  status: payrollStatusSchema,
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PayrollRun = z.infer<typeof payrollRunSchema>;
export type PayrollItem = z.infer<typeof payrollItemSchema>;
