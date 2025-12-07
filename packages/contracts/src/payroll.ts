import { z } from 'zod';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const payrollItemSchema = z.object({
  employeeId: z.string().uuid('Employee ID must be a valid UUID'),
  amount: z.number().positive('Amount must be positive'),
});

export type PayrollItemDto = z.infer<typeof payrollItemSchema>;

export const createPayrollRunSchema = z.object({
  organizationId: z.string().uuid('Organization ID must be a valid UUID'),
  scheduledDate: z.string().datetime('Scheduled date must be a valid ISO date string'),
  currency: z.string().min(1, 'Currency is required'),
  items: z.array(payrollItemSchema).min(1, 'At least one payroll item is required'),
});

export type CreatePayrollRunDto = z.infer<typeof createPayrollRunSchema>;

export const executePayrollRunSchema = z.object({
  force: z.string().optional(),
});

export type ExecutePayrollRunDto = z.infer<typeof executePayrollRunSchema>;

export interface PayrollItemResponseDto {
  id: string;
  payrollRunId: string;
  employeeId: string;
  amount: number;
  status: PayrollStatus;
  txSignature?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRunResponseDto {
  id: string;
  organizationId: string;
  status: PayrollStatus;
  scheduledDate: Date;
  totalAmount: number;
  currency: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  items: PayrollItemResponseDto[];
}
