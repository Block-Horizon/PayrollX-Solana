"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import KYCUpload from "../../../components/employees/KYCUpload";
import { axiosInstance } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { motion } from "framer-motion";
import {
  Plus,
  User,
  Mail,
  DollarSign,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-purple-500" />
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Mail className="h-4 w-4 text-gray-500" />
        <span>{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <DollarSign className="h-4 w-4 text-green-500" />
        <span>${row.getValue("salary")?.toLocaleString() || 0}</span>
      </div>
    ),
  },
  {
    accessorKey: "walletAddress",
    header: "Wallet",
    cell: ({ row }: any) => {
      const address = row.getValue("walletAddress");
      return address ? (
        <div className="flex items-center space-x-1">
          <Wallet className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-xs">
            {address.slice(0, 8)}...{address.slice(-4)}
          </span>
        </div>
      ) : (
        <span className="text-gray-500 text-sm">Not linked</span>
      );
    },
  },
  {
    accessorKey: "kycStatus",
    header: "KYC Status",
    cell: ({ row }: any) => {
      const status = row.getValue("kycStatus");
      const getStatusIcon = () => {
        switch (status) {
          case "verified":
            return <CheckCircle className="h-3 w-3 mr-1" />;
          case "pending":
            return <Clock className="h-3 w-3 mr-1" />;
          case "rejected":
            return <XCircle className="h-3 w-3 mr-1" />;
          default:
            return null;
        }
      };

      const getStatusVariant = () => {
        switch (status) {
          case "verified":
            return "success";
          case "pending":
            return "warning";
          case "rejected":
            return "destructive";
          default:
            return "outline";
        }
      };

      return (
        <Badge variant={getStatusVariant()}>
          {getStatusIcon()}
          {status || "Not submitted"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </div>
    ),
  },
];

export default function EmployeesPage() {
  const { role } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    salary: "",
    position: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    data: employees,
    isLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/api/employees");
        return response.data || [];
      } catch (error: any) {
        console.error("Failed to fetch employees:", error);
        throw error;
      }
    },
    enabled: role === "ORG_ADMIN" || role === "SUPER_ADMIN",
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      salary: number;
      position: string;
    }) => {
      // Split name into firstName and lastName if needed
      const nameParts = data.name.trim().split(" ");
      const firstName = nameParts[0] || data.name;
      const lastName = nameParts.slice(1).join(" ") || "";

      return axiosInstance.post("/api/employees", {
        email: data.email,
        firstName,
        lastName,
        salary: data.salary,
        position: data.position,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowCreate(false);
      setFormData({ name: "", email: "", salary: "", position: "" });
      setFormErrors({});
      toast.success("Employee created successfully!", {
        description: "The new employee has been added to your organization.",
      });
    },
    onError: (error: any) => {
      console.error("Create employee error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create employee. Please try again.";
      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Employee name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Employee name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.salary && isNaN(parseFloat(formData.salary))) {
      errors.salary = "Salary must be a valid number";
    } else if (formData.salary && parseFloat(formData.salary) < 0) {
      errors.salary = "Salary cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createEmployeeMutation.mutate({
        ...formData,
        salary: parseFloat(formData.salary) || 0,
      });
    }
  };

  if (role !== "ORG_ADMIN" && role !== "SUPER_ADMIN") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-300">
            You don't have permission to view employees. Please contact your
            administrator.
          </p>
        </div>
      </motion.div>
    );
  }

  const verifiedCount =
    employees?.filter((emp: any) => emp.kycStatus === "verified").length || 0;
  const pendingCount =
    employees?.filter((emp: any) => emp.kycStatus === "pending").length || 0;
  const totalSalary =
    employees?.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0) ||
    0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Employees</h1>
          <p className="text-gray-300 mt-1">
            Manage your team members and their payroll information
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowKYC(true)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload KYC
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-white">
                {employees?.length || 0}
              </p>
            </div>
            <User className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">KYC Verified</p>
              <p className="text-2xl font-bold text-white">{verifiedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending KYC</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Payroll</p>
              <p className="text-2xl font-bold text-white">
                ${totalSalary.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4 bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        ) : employeesError ? (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">
              Failed to load employees. Please try refreshing the page.
              {employeesError instanceof Error && (
                <span className="block mt-2 text-xs">
                  {employeesError.message}
                </span>
              )}
            </AlertDescription>
          </Alert>
        ) : employees && employees.length > 0 ? (
          <DataTable
            columns={columns}
            data={employees}
            searchKey="name"
            searchPlaceholder="Search employees..."
          />
        ) : (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No employees found
            </h3>
            <p className="text-gray-400 mb-4">
              Get started by adding your first employee to the system.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {/* Create Employee Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) {
            setFormData({ name: "", email: "", salary: "", position: "" });
            setFormErrors({});
          }
        }}
      >
        <DialogContent className="bg-white/5 backdrop-blur-sm border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Name</label>
                <Input
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: "" });
                    }
                  }}
                  className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 ${
                    formErrors.name ? "border-red-500" : ""
                  }`}
                  required
                />
                {formErrors.name && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-400 text-sm">
                      {formErrors.name}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors({ ...formErrors, email: "" });
                    }
                  }}
                  className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  required
                />
                {formErrors.email && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-400 text-sm">
                      {formErrors.email}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Position
                </label>
                <Input
                  placeholder="Enter job position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Salary</label>
                <Input
                  type="number"
                  placeholder="Enter salary"
                  value={formData.salary}
                  onChange={(e) => {
                    setFormData({ ...formData, salary: e.target.value });
                    if (formErrors.salary) {
                      setFormErrors({ ...formErrors, salary: "" });
                    }
                  }}
                  className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 ${
                    formErrors.salary ? "border-red-500" : ""
                  }`}
                  min="0"
                  step="0.01"
                />
                {formErrors.salary && (
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertDescription className="text-red-400 text-sm">
                      {formErrors.salary}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreate(false)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {createEmployeeMutation.isPending
                  ? "Adding..."
                  : "Add Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* KYC Upload Dialog */}
      <Dialog open={showKYC} onOpenChange={setShowKYC}>
        <DialogContent className="bg-white/5 backdrop-blur-sm border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Upload KYC Documents
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Upload KYC documents for employee verification. Supported formats:
              PDF, PNG, JPG, JPEG, GIF
            </p>
            {selectedEmployee ? (
              <KYCUpload
                employeeId={selectedEmployee}
                onSuccess={() => {
                  setShowKYC(false);
                  setSelectedEmployee(null);
                  queryClient.invalidateQueries({ queryKey: ["employees"] });
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Please select an employee first</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
