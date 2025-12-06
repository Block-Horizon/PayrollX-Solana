import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  GenerateWalletDto,
  SignTransactionDto,
  GetBalanceDto,
} from "@payrollx/contracts";

@ApiTags("Wallets")
@Controller("wallets")
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate a new wallet using MPC" })
  @ApiResponse({
    status: 201,
    description: "Wallet generated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 500, description: "MPC server error" })
  async generateWallet(
    @Body() generateWalletDto: GenerateWalletDto,
    @Request() req: any
  ) {
    return this.walletService.generateWallet(generateWalletDto, req.user.id);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get wallet by ID" })
  @ApiResponse({
    status: 200,
    description: "Wallet retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  async findOne(@Param("id") id: string) {
    return this.walletService.findOne(id);
  }

  @Post(":id/sign")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Sign a transaction using MPC" })
  @ApiResponse({
    status: 200,
    description: "Transaction signed successfully",
  })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  @ApiResponse({ status: 500, description: "MPC server error" })
  async signTransaction(
    @Param("id") id: string,
    @Body() signTransactionDto: SignTransactionDto
  ) {
    return this.walletService.signTransaction(id, signTransactionDto);
  }

  @Post(":id/balance")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get wallet balance" })
  @ApiResponse({
    status: 200,
    description: "Balance retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  async getBalance(
    @Param("id") id: string,
    @Body() getBalanceDto: GetBalanceDto
  ) {
    return this.walletService.getBalance(id, getBalanceDto);
  }
}

