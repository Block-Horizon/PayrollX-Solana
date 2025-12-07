"use client";
import { WalletMultiButton as SolanaWalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const WalletMultiButton = ({ className }: { className?: string }) => {
  return <SolanaWalletMultiButton className={className} />;
};
