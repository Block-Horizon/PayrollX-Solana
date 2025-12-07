"use client";

import { Upload } from "@/components/ui/upload";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api-client";
import { toast } from "sonner";

interface KYCUploadProps {
  employeeId: string;
  onSuccess?: () => void;
}

export default function KYCUpload({ employeeId, onSuccess }: KYCUploadProps) {
  const mutation = useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("kycDocs", file));
      return axiosInstance.post(`/api/employees/${employeeId}/kyc`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("KYC documents uploaded successfully!", {
        description:
          "Your documents are being reviewed. You'll be notified once verification is complete.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("KYC upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to upload KYC documents. Please try again.";
      toast.error("Upload Error", {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  return (
    <Upload
      onUpload={mutation.mutate}
      maxFiles={3}
      accept={{
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
        "application/pdf": [".pdf"],
      }}
      disabled={mutation.isPending}
    />
  );
}
