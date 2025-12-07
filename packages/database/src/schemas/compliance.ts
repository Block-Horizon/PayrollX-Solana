import { z } from "zod";

export enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PENDING_REVIEW = "pending_review",
  UNDER_INVESTIGATION = "under_investigation",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
  EXECUTE = "EXECUTE",
}

export enum ReportFormat {
  CSV = "CSV",
  PDF = "PDF",
  JSON = "JSON",
}

export enum ReportStatus {
  GENERATING = "GENERATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export const complianceStatusSchema = z.nativeEnum(ComplianceStatus);
export const auditActionSchema = z.nativeEnum(AuditAction);
export const reportFormatSchema = z.nativeEnum(ReportFormat);
export const reportStatusSchema = z.nativeEnum(ReportStatus);

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().nullable(),
  details: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  timestamp: z.date(),
});

export const complianceReportSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string(),
  status: z.string(),
  reportType: z.string(),
  findings: z.record(z.unknown()),
  recommendations: z.string().nullable(),
  generatedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
export type ComplianceReport = z.infer<typeof complianceReportSchema>;
