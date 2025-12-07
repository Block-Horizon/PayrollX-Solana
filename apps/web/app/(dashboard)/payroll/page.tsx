"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import PayrollForm from "@/components/payroll/PayrollForm";
import { usePayrollSocket } from "@/lib/hooks/usePayrollSocket";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Eye,
} from "lucide-react";

interface PayrollRun {
  id: string;
  organizationName: string;
  scheduledDate: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  employeeCount: number;
  token: "SOL" | "USDC";
  createdAt: string;
  completedAt?: string;
  transactions?: Array<{
    id: string;
    employeeName: string;
    amount: number;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    signature?: string;
  }>;
}

// Define functions that will be used in columns
let setSelectedRun: (run: PayrollRun | null) => void;
let executeRun: (runId: string) => void;

const payrollColumns = (
  setSelectedRunFn: typeof setSelectedRun,
  executeRunFn: typeof executeRun
) => [
    {
      accessorKey: "id",
      header: "Run ID",
      cell: ({ row }: any) => (
        <span className="font-mono text-sm text-[#5eead4]">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "scheduledDate",
      header: "Scheduled Date",
      cell: ({ row }: any) => (
        <span className="text-[#fafafa]">
          {new Date(row.original.scheduledDate).toLocaleDateString("en-US", {
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
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }: any) => (
        <span className="text-[#fafafa] font-medium">
          {row.original.totalAmount.toLocaleString()} {row.original.token}
        </span>
      ),
    },
    {
      accessorKey: "employeeCount",
      header: "Employees",
      cell: ({ row }: any) => (
        <span className="text-[#fafafa]">{row.original.employeeCount}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        const getStatusIcon = () => {
          switch (status) {
            case "COMPLETED":
              return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "PROCESSING":
              return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
            case "FAILED":
              return <XCircle className="w-4 h-4 text-red-500" />;
            default:
              return <AlertCircle className="w-4 h-4 text-yellow-500" />;
          }
        };

        const getStatusColor = () => {
          switch (status) {
            case "COMPLETED":
              return "bg-green-500/20 text-green-400 border-green-500/30";
            case "PROCESSING":
              return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "FAILED":
              return "bg-red-500/20 text-red-400 border-red-500/30";
            default:
              return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
          }
        };

        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>{status}</Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedRunFn(row.original)}
            className="border-[#27272a] text-[#fafafa] hover:bg-[#27272a]"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === "PENDING" && (
            <Button
              size="sm"
              onClick={() => executeRunFn(row.original.id)}
              className="bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#09090b] font-medium"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);

  // Initialize WebSocket connection for real-time updates
  const { isConnected } = usePayrollSocket();

  useEffect(() => {
    // Mock data for now
    const mockRuns: PayrollRun[] = [
      {
        id: "run-001",
        organizationName: "Acme Corp",
        scheduledDate: "2024-01-15T09:00:00Z",
        totalAmount: 50000,
        status: "COMPLETED",
        employeeCount: 25,
        token: "USDC",
        createdAt: "2024-01-10T10:00:00Z",
        completedAt: "2024-01-15T09:15:00Z",
        transactions: [
          {
            id: "tx-001",
            employeeName: "John Doe",
            amount: 2000,
            status: "COMPLETED",
            signature: "5K7...abc",
          },
          {
            id: "tx-002",
            employeeName: "Jane Smith",
            amount: 2000,
            status: "COMPLETED",
            signature: "3M2...def",
          },
        ],
      },
      {
        id: "run-002",
        organizationName: "Acme Corp",
        scheduledDate: "2024-01-22T09:00:00Z",
        totalAmount: 50000,
        status: "PENDING",
        employeeCount: 25,
        token: "USDC",
        createdAt: "2024-01-17T14:30:00Z",
        transactions: [],
      },
      {
        id: "run-003",
        organizationName: "Acme Corp",
        scheduledDate: "2024-01-08T09:00:00Z",
        totalAmount: 45000,
        status: "PROCESSING",
        employeeCount: 23,
        token: "SOL",
        createdAt: "2024-01-05T16:45:00Z",
        transactions: [
          {
            id: "tx-003",
            employeeName: "Bob Johnson",
            amount: 1956.52,
            status: "PENDING",
          },
          {
            id: "tx-004",
            employeeName: "Alice Brown",
            amount: 1956.52,
            status: "COMPLETED",
            signature: "7N9...ghi",
          },
        ],
      },
    ];

    setTimeout(() => {
      setPayrollRuns(mockRuns);
      setIsLoading(false);
    }, 1000);

    // Listen for WebSocket events
    const handlePayrollStatusUpdate = (event: CustomEvent) => {
      const { id, status } = event.detail;
      setPayrollRuns((prev) =>
        prev.map((run) => (run.id === id ? { ...run, status } : run))
      );
    };

    const handleTransactionConfirmed = (event: CustomEvent) => {
      const { signature } = event.detail;
      toast.success("Transaction Confirmed", {
        description: `Transaction signature: ${signature}`,
      });
    };

    const handleTransactionFailed = (event: CustomEvent) => {
      const { error } = event.detail;
      toast.error("Transaction Failed", {
        description: error,
      });
    };

    window.addEventListener(
      "payrollStatusUpdate",
      handlePayrollStatusUpdate as EventListener
    );
    window.addEventListener(
      "transactionConfirmed",
      handleTransactionConfirmed as EventListener
    );
    window.addEventListener(
      "transactionFailed",
      handleTransactionFailed as EventListener
    );

    return () => {
      window.removeEventListener(
        "payrollStatusUpdate",
        handlePayrollStatusUpdate as EventListener
      );
      window.removeEventListener(
        "transactionConfirmed",
        handleTransactionConfirmed as EventListener
      );
      window.removeEventListener(
        "transactionFailed",
        handleTransactionFailed as EventListener
      );
    };
  }, []);

  const executeRun = (runId: string) => {
    setPayrollRuns((prev) =>
      prev.map((run) =>
        run.id === runId ? { ...run, status: "PROCESSING" as const } : run
      )
    );

    // Simulate execution
    setTimeout(() => {
      setPayrollRuns((prev) =>
        prev.map((run) =>
          run.id === runId
            ? {
              ...run,
              status: "COMPLETED" as const,
              completedAt: new Date().toISOString(),
            }
            : run
        )
      );
    }, 3000);
  };

  const getStatusIcon = (status: PayrollRun["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "PROCESSING":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: PayrollRun["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PROCESSING":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "FAILED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, token: string) => {
    return `${amount.toLocaleString()} ${token}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5eead4]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#09090b] p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#fafafa] mb-2">
              Payroll Management
            </h1>
            <p className="text-[#71717a] flex items-center gap-2">
              Manage and execute payroll runs for your organization
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-xs">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#09090b] font-medium"
          >
            Create New Run
          </Button>
        </div>

        <Card className="bg-[#18181b] border-[#27272a]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Payroll Runs</CardTitle>
            <CardDescription className="text-[#71717a]">
              View and manage all payroll runs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={payrollColumns(setSelectedRun, executeRun)}
              data={payrollRuns || []}
            />
          </CardContent>
        </Card>

        {/* Create Payroll Run Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-2xl bg-[#18181b] border-[#27272a]">
            <DialogHeader>
              <DialogTitle className="text-[#fafafa]">
                Create Payroll Run
              </DialogTitle>
            </DialogHeader>
            <PayrollForm
              onSuccess={() => {
                setShowCreate(false);
                // Refresh data
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Run Details Modal */}
        <AnimatePresence>
          {selectedRun && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedRun(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#18181b] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-[#27272a]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#fafafa]">Run Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRun(null)}
                    className="border-[#27272a] text-[#fafafa] hover:bg-[#27272a]"
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#71717a] text-sm">Run ID</p>
                      <p className="text-[#fafafa] font-medium">{selectedRun.id}</p>
                    </div>
                    <div>
                      <p className="text-[#71717a] text-sm">Status</p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedRun.status)}
                        <Badge className={getStatusColor(selectedRun.status)}>
                          {selectedRun.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Scheduled Date</p>
                      <p className="text-[#fafafa] font-medium">
                        {formatDate(selectedRun.scheduledDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Amount</p>
                      <p className="text-[#fafafa] font-medium">
                        {formatAmount(
                          selectedRun.totalAmount,
                          selectedRun.token
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedRun.completedAt && (
                    <div>
                      <p className="text-gray-400 text-sm">Completed At</p>
                      <p className="text-[#fafafa] font-medium">
                        {formatDate(selectedRun.completedAt)}
                      </p>
                    </div>
                  )}

                  {selectedRun.transactions &&
                    selectedRun.transactions.length > 0 && (
                      <div>
                        <h4 className="text-[#fafafa] font-medium mb-2">
                          Transaction Details
                        </h4>
                        <div className="space-y-2">
                          {selectedRun.transactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex justify-between items-center p-2 bg-[#09090b] rounded"
                            >
                              <div>
                                <p className="text-[#fafafa] text-sm">
                                  {tx.employeeName}
                                </p>
                                <p className="text-[#71717a] text-xs">
                                  {formatAmount(tx.amount, selectedRun.token)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(tx.status)}
                                <span
                                  className={`text-xs ${getStatusColor(tx.status)}`}
                                >
                                  {tx.status}
                                </span>
                                {tx.signature && (
                                  <a
                                    href={`https://explorer.solana.com/tx/${tx.signature}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#5eead4] hover:text-[#5eead4]/80 text-xs"
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
