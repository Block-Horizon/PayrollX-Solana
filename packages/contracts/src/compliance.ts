import { z } from 'zod';

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  UNDER_INVESTIGATION = 'under_investigation',
}

export const createAuditLogSchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceId: z.string().optional(),
  details: z.record(z.unknown()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;

export interface AuditLogResponseDto {
  id: string;
  organizationId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export const complianceReportSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  status: z.nativeEnum(ComplianceStatus),
  reportType: z.string().min(1, 'Report type is required'),
  findings: z.record(z.unknown()),
  recommendations: z.string().optional(),
});

export type ComplianceReportDto = z.infer<typeof complianceReportSchema>;
