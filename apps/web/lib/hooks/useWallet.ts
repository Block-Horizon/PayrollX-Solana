"use client";
import { useWallet as useWalletAdapter } from "@solana/wallet-adapter-react";

export const useWallet = () => {
  const wallet = useWalletAdapter();

  return {
    connected: wallet.connected,
    publicKey: wallet.publicKey?.toString() || null,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    wallet: wallet.wallet,
    connecting: wallet.connecting,
    disconnecting: wallet.disconnecting,
  };
};
