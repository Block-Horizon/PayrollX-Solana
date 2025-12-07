"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";

interface WalletConnectionButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function WalletConnectionButton({
  onConnect,
  onDisconnect,
}: WalletConnectionButtonProps) {
  const { publicKey, connected, wallet } = useWallet();

  useEffect(() => {
    if (connected && onConnect) {
      onConnect();
    } else if (!connected && onDisconnect) {
      onDisconnect();
    }
  }, [connected, onConnect, onDisconnect]);

  return (
    <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !px-6 !py-3 !text-white !font-semibold" />
  );
}
