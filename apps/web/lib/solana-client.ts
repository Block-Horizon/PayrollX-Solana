import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

// Define a simple wallet interface compatible with Anchor
interface Wallet {
  publicKey: PublicKey;
  signTransaction: <T>(tx: T) => Promise<T>;
  signAllTransactions: <T>(txs: T[]) => Promise<T[]>;
}

// Program ID - should match your deployed program
const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

// Configure the cluster.
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet"),
  "confirmed"
);

// Initialize Anchor program
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProgram(wallet: Wallet): Program<any> {
  const _provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  // For now, return a mock program until we have the actual IDL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return {} as Program<any>;
}

// PDA helpers
export function getOrganizationPda(authority: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("organization"), authority.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

export function getEmployeePda(
  organization: PublicKey,
  employeeWallet: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("employee"),
      organization.toBuffer(),
      employeeWallet.toBuffer(),
    ],
    PROGRAM_ID
  );
  return pda;
}

export function getPayrollPda(
  organization: PublicKey,
  payrollId: string
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("payroll"), organization.toBuffer(), Buffer.from(payrollId)],
    PROGRAM_ID
  );
  return pda;
}

export function getTransactionPda(
  payroll: PublicKey,
  transactionId: string
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("transaction"),
      payroll.toBuffer(),
      Buffer.from(transactionId),
    ],
    PROGRAM_ID
  );
  return pda;
}

export function getMintPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    PROGRAM_ID
  );
  return pda;
}

export function getVaultPda(payroll: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), payroll.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}
