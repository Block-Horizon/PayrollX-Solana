import { Logger } from "winston";
import { createWalletDbConnection } from "@payrollx/database";
import {
  GenerateWalletDto,
  SignTransactionDto,
  GetBalanceDto,
} from "@payrollx/contracts";
import { MpcClient } from "../clients/mpc-client";

type PrismaClient = ReturnType<typeof createWalletDbConnection>;

export const generateWallet = async (
  generateWalletDto: GenerateWalletDto,
  userId: string,
  prisma: PrismaClient,
  mpcClient: MpcClient,
  logger: Logger
) => {
  const { employeeId, participantCount } = generateWalletDto;

  try {
    const keygenResponse = await mpcClient.generateWallet(
      2,
      participantCount || 3
    );

    const { wallet_id, public_key, share_ids, threshold } = keygenResponse;

    const wallet = await prisma.wallet.create({
      data: {
        employeeId,
        publicKey: public_key,
        keyShareIds: share_ids,
        provider: "mpc",
        createdBy: userId,
      },
    });

    logger.info(`Wallet generated: ${wallet.id}`);

    return {
      id: wallet.id,
      publicKey: wallet.publicKey,
      walletId: wallet_id,
      shareIds: share_ids,
      threshold,
      createdAt: wallet.createdAt,
    };
  } catch (error) {
    logger.error("Failed to generate wallet:", error);
    throw new Error("Failed to generate wallet");
  }
};

export const findWallet = async (
  id: string,
  prisma: PrismaClient,
  logger: Logger
) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { id, deletedAt: null },
      include: {
        employee: true,
      },
    });

    return wallet;
  } catch (error) {
    logger.error("Failed to find wallet:", error);
    throw error;
  }
};

export const signTransaction = async (
  walletId: string,
  signTransactionDto: SignTransactionDto,
  prisma: PrismaClient,
  mpcClient: MpcClient,
  logger: Logger
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId, deletedAt: null },
  });

  if (!wallet) {
    return null;
  }

  try {
    const transactionData = JSON.stringify(signTransactionDto);

    const signature = await mpcClient.signTransaction(
      walletId,
      Buffer.from(transactionData, "utf8"),
      wallet.keyShareIds.slice(0, 2)
    );

    logger.info(`Transaction signed for wallet: ${walletId}`);

    return {
      signature,
      publicKey: wallet.publicKey,
      walletId,
      signedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to sign transaction:", error);
    throw new Error("Failed to sign transaction");
  }
};

export const getWalletBalance = async (
  walletId: string,
  _getBalanceDto: GetBalanceDto,
  prisma: PrismaClient,
  logger: Logger
) => {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId, deletedAt: null },
  });

  if (!wallet) {
    return null;
  }

  try {
    return {
      walletId,
      address: wallet.publicKey,
      balance: "1000000000",
      lamports: 1000000000,
      sol: "1.0",
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to get balance:", error);
    throw new Error("Failed to get balance");
  }
};
