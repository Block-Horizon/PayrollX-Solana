"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import { Calendar, DollarSign, Users } from "lucide-react";

interface PayrollFormProps {
  onSuccess: () => void;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  salary?: number;
}

export default function PayrollForm({ onSuccess }: PayrollFormProps) {
  const { user } = useAuthStore();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("SOL");
  const [amount, setAmount] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  useEffect(() => {
    // Mock employees data for now
    const mockEmployees: Employee[] = [
      { id: "emp-001", name: "John Doe", email: "john@acme.com", salary: 5000 },
      {
        id: "emp-002",
        name: "Jane Smith",
        email: "jane@acme.com",
        salary: 4500,
      },
      {
        id: "emp-003",
        name: "Bob Johnson",
        email: "bob@acme.com",
        salary: 4000,
      },
      {
        id: "emp-004",
        name: "Alice Brown",
        email: "alice@acme.com",
        salary: 4200,
      },
    ];

    setTimeout(() => {
      setEmployees(mockEmployees);
      setEmployeesLoading(false);
    }, 500);
  }, []);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployees.length === 0) {
      toast.error("Validation Error", {
        description: "Please select at least one employee",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Validation Error", {
        description: "Please enter a valid amount",
      });
      return;
    }

    if (!scheduledDate) {
      toast.error("Validation Error", {
        description: "Please select a scheduled date",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Payroll Run Created", {
        description: "Payroll run created successfully!",
      });
      onSuccess();

      // Reset form
      setSelectedEmployees([]);
      setAmount("");
      setScheduledDate("");
      setSelectedToken("SOL");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create payroll run";
      toast.error("Payroll Error", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Token Type
        </label>
        <Select value={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger className="bg-white/5 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOL">SOL</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Amount per Employee
        </label>
        <Input
          type="number"
          step="0.01"
          placeholder="Enter amount per employee"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Scheduled Date
        </label>
        <Input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Users className="w-4 h-4" />
          Select Employees ({selectedEmployees.length} selected)
        </label>
        <div className="max-h-48 overflow-y-auto space-y-2 border border-white/20 rounded-lg p-3 bg-white/5">
          {employees?.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded"
            >
              <Checkbox
                id={emp.id}
                checked={selectedEmployees.includes(emp.id)}
                onCheckedChange={() => handleEmployeeToggle(emp.id)}
              />
              <label
                htmlFor={emp.id}
                className="text-white text-sm cursor-pointer flex-1"
              >
                <div className="font-medium">{emp.name}</div>
                <div className="text-gray-400 text-xs">{emp.email}</div>
                <div className="text-purple-400 text-xs">
                  Salary: {emp.salary || "Not set"}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || selectedEmployees.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSubmitting ? "Creating..." : "Create Payroll Run"}
        </Button>
      </div>
    </form>
  );
}
