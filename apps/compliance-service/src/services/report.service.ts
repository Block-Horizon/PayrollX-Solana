import { Logger } from "winston";
import { createComplianceDbConnection } from "@payrollx/database";
import * as fs from "fs";
import * as path from "path";
import * as csvWriter from "csv-writer";
import PDFDocument from "pdfkit";

type PrismaClient = ReturnType<typeof createComplianceDbConnection>;

export interface ReportQuery {
  organizationId?: string;
  status?: string;
}

export interface GenerateReportDto {
  organizationId?: string;
  startDate: Date;
  endDate: Date;
  format: "CSV" | "PDF";
  type: string;
}

const exportPath = process.env.REPORT_EXPORT_PATH || "./exports";

const ensureExportDirectory = () => {
  if (!fs.existsSync(exportPath)) {
    fs.mkdirSync(exportPath, { recursive: true });
  }
};

ensureExportDirectory();

export const findAllReports = async (
  query: ReportQuery,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const where: Record<string, unknown> = {};

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }
    if (query.status) {
      where.status = query.status;
    }

    return await prisma.complianceReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    logger.error("Failed to find reports:", error);
    throw error;
  }
};

export const generateReport = async (
  generateReportDto: GenerateReportDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  const report = await prisma.complianceReport.create({
    data: {
      ...generateReportDto,
      status: "GENERATING",
    },
  });

  try {
    let filePath: string;

    switch (generateReportDto.format) {
      case "CSV":
        filePath = await generateCsvReport(report, prisma, logger);
        break;
      case "PDF":
        filePath = await generatePdfReport(report, prisma, logger);
        break;
      default:
        throw new Error(
          `Unsupported report format: ${generateReportDto.format}`
        );
    }

    await prisma.complianceReport.update({
      where: { id: report.id },
      data: {
        status: "COMPLETED",
        filePath,
        completedAt: new Date(),
      },
    });

    logger.info(`Report generated successfully: ${report.id}`);
    return { ...report, filePath };
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);

    await prisma.complianceReport.update({
      where: { id: report.id },
      data: {
        status: "FAILED",
        error: errorMessage,
      },
    });

    logger.error(`Report generation failed: ${report.id}`, error);
    throw error;
  }
};

const generateCsvReport = async (
  report: { id: string; startDate: Date; endDate: Date },
  prisma: PrismaClient,
  logger: Logger
): Promise<string> => {
  const fileName = `report_${report.id}_${Date.now()}.csv`;
  const filePath = path.join(exportPath, fileName);

  const writer = csvWriter.createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "timestamp", title: "Timestamp" },
      { id: "action", title: "Action" },
      { id: "entityType", title: "Entity Type" },
      { id: "entityId", title: "Entity ID" },
      { id: "userId", title: "User ID" },
      { id: "details", title: "Details" },
    ],
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: report.startDate,
        lte: report.endDate,
      },
    },
  });

  await writer.writeRecords(auditLogs);
  return filePath;
};

const generatePdfReport = async (
  report: { id: string; startDate: Date; endDate: Date },
  prisma: PrismaClient,
  logger: Logger
): Promise<string> => {
  const fileName = `report_${report.id}_${Date.now()}.pdf`;
  const filePath = path.join(exportPath, fileName);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Compliance Report", 100, 100);
  doc.fontSize(12).text(`Report ID: ${report.id}`, 100, 150);
  doc.text(`Generated: ${new Date().toISOString()}`, 100, 170);

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: report.startDate,
        lte: report.endDate,
      },
    },
  });

  let yPosition = 220;
  auditLogs.forEach(
    (log: { createdAt: Date; action: string; entityType: string }) => {
      doc.text(
        `${log.createdAt}: ${log.action} - ${log.entityType}`,
        100,
        yPosition
      );
      yPosition += 20;
    }
  );

  doc.end();
  return filePath;
};

export const downloadReport = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const report = await prisma.complianceReport.findUnique({
      where: { id },
    });

    if (!report || report.status !== "COMPLETED") {
      throw new Error(`Report ${id} not found or not completed`);
    }

    return {
      filePath: report.filePath,
      fileName: path.basename(report.filePath || ""),
    };
  } catch (error) {
    logger.error(`Failed to download report ${id}:`, error);
    throw error;
  }
};
