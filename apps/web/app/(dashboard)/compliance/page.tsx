"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  userId: string;
  details: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ipAddress?: string;
  userAgent?: string;
}

const exportSingleLog = async (logId: string, auditLogs: AuditLog[]) => {
  try {
    const log = auditLogs.find((l) => l.id === logId);
    if (!log) return;

    const content = `Audit Log Export\n\nID: ${log.id}\nTimestamp: ${log.timestamp}\nEvent: ${log.eventType}\nUser: ${log.userId}\nSeverity: ${log.severity}\nDetails: ${log.details}\nIP: ${log.ipAddress}\nUser Agent: ${log.userAgent}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${logId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Log Exported", {
      description: "Audit log has been exported successfully.",
    });
  } catch (err) {
    toast.error("Export Failed", {
      description: "Failed to export log. Please try again.",
    });
  }
};

const auditColumns = (auditLogs: AuditLog[]) => [
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }: any) => (
      <span className="text-white text-sm">
        {new Date(row.original.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    accessorKey: "eventType",
    header: "Event",
    cell: ({ row }: any) => (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
        {row.original.eventType}
      </Badge>
    ),
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }: any) => (
      <span className="text-white font-mono text-sm">
        {row.original.userId}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }: any) => {
      const severity = row.original.severity;
      const getSeverityColor = () => {
        switch (severity) {
          case "CRITICAL":
            return "bg-red-500/20 text-red-400 border-red-500/30";
          case "HIGH":
            return "bg-orange-500/20 text-orange-400 border-orange-500/30";
          case "MEDIUM":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
          default:
            return "bg-green-500/20 text-green-400 border-green-500/30";
        }
      };
      return <Badge className={getSeverityColor()}>{severity}</Badge>;
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }: any) => (
      <span className="text-gray-300 text-sm max-w-xs truncate">
        {row.original.details}
      </span>
    ),
  },
  {
    id: "export",
    header: "Export",
    cell: ({ row }: any) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => exportSingleLog(row.original.id, auditLogs)}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Download className="w-4 h-4" />
      </Button>
    ),
  },
];

export default function CompliancePage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      const mockLogs: AuditLog[] = [
        {
          id: "audit-001",
          timestamp: "2024-01-20T10:30:00Z",
          eventType: "PAYROLL_EXECUTED",
          userId: "user-123",
          details:
            "Payroll run #run-001 executed successfully for 25 employees",
          severity: "LOW",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0...",
        },
        {
          id: "audit-002",
          timestamp: "2024-01-20T09:15:00Z",
          eventType: "WALLET_LINKED",
          userId: "user-456",
          details: "MPC wallet linked to employee account",
          severity: "MEDIUM",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0...",
        },
        {
          id: "audit-003",
          timestamp: "2024-01-20T08:45:00Z",
          eventType: "KYC_UPLOADED",
          userId: "user-789",
          details: "KYC documents uploaded and verified",
          severity: "HIGH",
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0...",
        },
        {
          id: "audit-004",
          timestamp: "2024-01-19T16:20:00Z",
          eventType: "LOGIN_FAILED",
          userId: "user-999",
          details: "Multiple failed login attempts detected",
          severity: "CRITICAL",
          ipAddress: "192.168.1.103",
          userAgent: "Mozilla/5.0...",
        },
      ];

      setTimeout(() => {
        setAuditLogs(mockLogs);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch audit logs"
      );
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      // Mock CSV export
      const csvContent = auditLogs
        .map(
          (log) =>
            `${log.timestamp},${log.eventType},${log.userId},${log.severity},${log.details}`
        )
        .join("\n");

      const blob = new Blob(
        [`Date,Event,User,Severity,Details\n${csvContent}`],
        { type: "text/csv" }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("CSV Exported", {
        description: "All audit logs have been exported successfully.",
      });
    } catch (err) {
      toast.error("Export Failed", {
        description: "Failed to export CSV. Please try again.",
      });
    }
  };

  const getSeverityStats = () => {
    const stats = auditLogs.reduce(
      (acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      critical: stats.CRITICAL || 0,
      high: stats.HIGH || 0,
      medium: stats.MEDIUM || 0,
      low: stats.LOW || 0,
    };
  };

  const stats = getSeverityStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Card className="bg-red-500/10 border-red-500/30 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Error Loading Data
            </h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchAuditLogs}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Compliance & Audit
            </h1>
            <p className="text-gray-400">
              Monitor security events and export audit logs
            </p>
          </div>
          <Button
            onClick={exportCSV}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {stats.critical}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-orange-500" />
                High
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {stats.high}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                Medium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.medium}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Low
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {stats.low}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Logs Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Audit Logs</CardTitle>
            <CardDescription className="text-gray-400">
              Security events and system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={auditColumns(auditLogs)} data={auditLogs} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
