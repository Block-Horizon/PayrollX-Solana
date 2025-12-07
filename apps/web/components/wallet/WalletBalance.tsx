"use client";
import { useWallet } from "@/lib/hooks/useWallet";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC mint on devnet

export default function WalletBalance() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const publicKeyObj = publicKey ? new PublicKey(publicKey) : null;

  const { data: solBalance } = useQuery({
    queryKey: ["solBalance", publicKey],
    queryFn: async () => {
      if (!publicKeyObj) return 0;
      const balance = await connection.getBalance(publicKeyObj);
      return balance / LAMPORTS_PER_SOL;
    },
    enabled: !!publicKeyObj,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: usdcBalance } = useQuery({
    queryKey: ["usdcBalance", publicKey],
    queryFn: async () => {
      if (!publicKeyObj) return 0;
      try {
        const tokenAddress = await getAssociatedTokenAddress(
          USDC_MINT,
          publicKeyObj
        );
        const tokenAccount =
          await connection.getTokenAccountBalance(tokenAddress);
        return tokenAccount.value.uiAmount || 0;
      } catch (error) {
        return 0; // Token account doesn't exist
      }
    },
    enabled: !!publicKeyObj,
    refetchInterval: 10000,
  });

  if (!connected || !publicKey) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Connect your wallet to view balances</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">◎</span>
              </div>
              <span className="text-white">SOL</span>
            </div>
            <span className="text-white font-semibold">
              {solBalance?.toFixed(4) || "0.0000"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">USDC</span>
            </div>
            <span className="text-white font-semibold">
              {usdcBalance?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-gray-400">
              Wallet: {publicKey.slice(0, 8)}...
              {publicKey.slice(-4)}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
