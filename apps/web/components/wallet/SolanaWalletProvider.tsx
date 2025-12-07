"use client";

// Temporarily disabled due to React compatibility issues
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import {
//   ConnectionProvider,
//   WalletProvider,
// } from "@solana/wallet-adapter-react";
// import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import {
//   PhantomWalletAdapter,
//   SolflareWalletAdapter,
// } from "@solana/wallet-adapter-wallets";
// import { clusterApiUrl } from "@solana/web3.js";
// import { useMemo } from "react";

// Import wallet adapter CSS
// import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

export function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Temporarily return children directly due to React compatibility issues
  return <>{children}</>;

  // Original implementation (commented out due to React version conflicts):
  // const network = WalletAdapterNetwork.Devnet;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const wallets = useMemo(
  //   () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
  //   []
  // );
  // return (
  //   <ConnectionProvider endpoint={endpoint}>
  //     <WalletProvider wallets={wallets} autoConnect>
  //       <WalletModalProvider>{children}</WalletModalProvider>
  //     </WalletProvider>
  //   </ConnectionProvider>
  // );
}
