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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { axiosInstance } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { motion } from "framer-motion";
import { Plus, Building2, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const columns = [
  {
    accessorKey: "name",
    header: "Organization",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-purple-500" />
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "employeeCount",
    header: "Employees",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4 text-gray-500" />
        <span>{row.getValue("employeeCount") || 0}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      return (
        <Badge
          variant={
            status === "active"
              ? "success"
              : status === "pending"
                ? "warning"
                : "destructive"
          }
        >
          {status === "active" ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : status === "pending" ? (
            <XCircle className="h-3 w-3 mr-1" />
          ) : null}
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm">
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </div>
    ),
  },
];

export default function OrganizationsPage() {
  const { role } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const {
    data: organizations,
    isLoading,
    error: orgsError,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/api/organizations");
        return response.data || [];
      } catch (error: any) {
        console.error("Failed to fetch organizations:", error);
        throw error;
      }
    },
    enabled: role === "SUPER_ADMIN",
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: 2,
    retryDelay: 1000,
  });

  const createOrgMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      axiosInstance.post("/api/organizations", {
        name: data.name,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setShowCreate(false);
      setFormData({ name: "", description: "" });
      setFormErrors({});
      toast.success("Organization created successfully!", {
        description: "The new organization has been added to the system.",
      });
    },
    onError: (error: any) => {
      console.error("Create organization error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create organization. Please try again.";
      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Organization name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Organization name must be at least 2 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createOrgMutation.mutate(formData);
    }
  };

  if (role !== "SUPER_ADMIN") {
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
            You don't have permission to view organizations. Please contact your
            administrator.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizations</h1>
          <p className="text-gray-300 mt-1">
            Manage your organization settings and employees
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Organizations</p>
              <p className="text-2xl font-bold text-white">
                {organizations?.length || 0}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Organizations</p>
              <p className="text-2xl font-bold text-white">
                {organizations?.filter((org: any) => org.status === "active")
                  .length || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-white">
                {organizations?.reduce(
                  (sum: number, org: any) => sum + (org.employeeCount || 0),
                  0
                ) || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
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
          </div>
        ) : orgsError ? (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">
              Failed to load organizations. Please try refreshing the page.
              {orgsError instanceof Error && (
                <span className="block mt-2 text-xs">{orgsError.message}</span>
              )}
            </AlertDescription>
          </Alert>
        ) : organizations && organizations.length > 0 ? (
          <DataTable
            columns={columns}
            data={organizations}
            searchKey="name"
            searchPlaceholder="Search organizations..."
          />
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No organizations found
            </h3>
            <p className="text-gray-400 mb-4">
              Get started by creating your first organization.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) {
            setFormData({ name: "", description: "" });
            setFormErrors({});
          }
        }}
      >
        <DialogContent className="bg-white/5 backdrop-blur-sm border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              Create Organization
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Organization Name
              </label>
              <Input
                placeholder="Enter organization name"
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
              <label className="text-sm font-medium text-white">
                Description
              </label>
              <Textarea
                placeholder="Enter organization description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                rows={3}
              />
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
                disabled={createOrgMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {createOrgMutation.isPending
                  ? "Creating..."
                  : "Create Organization"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
