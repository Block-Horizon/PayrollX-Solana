"use client";
import { useWallet } from "@/lib/hooks/useWallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/api-client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MpcWalletLink() {
  const { publicKey, connected } = useWallet();
  const [mpcAddress, setMpcAddress] = useState<string | null>(null);

  const generateMpcMutation = useMutation({
    mutationFn: async () => {
      if (!publicKey) throw new Error("Connect Solana wallet first");
      const response = await axiosInstance.post("/api/wallets/generate", {
        employeeId: "current-user-id", // TODO: Get from auth store
        solanaPublicKey: publicKey.toString(),
      });
      return response.data?.walletAddress || response.data;
    },
    onSuccess: (walletAddress) => {
      setMpcAddress(walletAddress);
      toast.success("MPC Wallet Generated", {
        description:
          "Your MPC wallet has been successfully linked to your account.",
      });
    },
    onError: (error: any) => {
      console.error("MPC wallet generation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to generate MPC wallet. Please try again.";
      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={!connected}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
        >
          <Wallet className="w-4 h-4" />
          {mpcAddress ? "MPC Wallet Linked" : "Link MPC Wallet"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/5 backdrop-blur-sm border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Link MPC Wallet</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {!mpcAddress ? (
            <>
              <p className="text-gray-300">
                Generate a secure MPC wallet for payroll disbursements. This
                wallet will be linked to your Solana wallet and used for
                automated payroll transactions.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Connected Wallet: {publicKey?.toString().slice(0, 8)}...
                  {publicKey?.toString().slice(-4)}
                </p>
              </div>
              <Button
                onClick={() => generateMpcMutation.mutate()}
                disabled={generateMpcMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {generateMpcMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate & Link MPC Wallet"
                )}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-white font-semibold">
                  MPC Wallet Successfully Linked!
                </p>
                <p className="text-gray-300 text-sm">
                  Address: {mpcAddress.slice(0, 8)}...{mpcAddress.slice(-4)}
                </p>
                <p className="text-gray-400 text-xs">
                  This wallet will be used for automated payroll disbursements.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
