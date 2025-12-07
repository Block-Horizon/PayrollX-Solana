"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function WalletInfo() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;

    setIsLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Wallet Information
      </h3>
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Address:</span>
          <p className="text-sm text-gray-600 font-mono break-all">
            {publicKey.toString()}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Balance:</span>
          <p className="text-sm text-gray-600">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : balance !== null ? (
              `${balance.toFixed(4)} SOL`
            ) : (
              "Unable to fetch"
            )}
          </p>
        </div>
        <button
          onClick={fetchBalance}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh Balance"}
        </button>
      </div>
    </div>
  );
}
