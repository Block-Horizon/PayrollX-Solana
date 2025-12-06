import { Logger } from "winston";
import { Connection, Transaction } from "@solana/web3.js";

export interface TransactionData {
  type: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenMint?: string;
}

export const createSolanaService = (logger: Logger) => {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");

  const executeTransaction = async (
    transaction: TransactionData
  ): Promise<string> => {
    try {
      const solanaTransaction = new Transaction();

      if (transaction.type === "PAYROLL") {
      }

      const signature = await connection.sendTransaction(solanaTransaction, []);

      await connection.confirmTransaction(signature, "confirmed");

      logger.info(`Solana transaction executed: ${signature}`);
      return signature;
    } catch (error) {
      logger.error("Error executing Solana transaction:", error);
      throw error;
    }
  };

  const getTransactionStatus = async (signature: string) => {
    try {
      const status = await connection.getSignatureStatus(signature);
      return status;
    } catch (error) {
      logger.error(`Error getting transaction status for ${signature}:`, error);
      throw error;
    }
  };

  return {
    executeTransaction,
    getTransactionStatus,
  };
};
