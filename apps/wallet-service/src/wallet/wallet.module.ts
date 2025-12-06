import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";

@Module({
  imports: [HttpModule],
  controllers: [WalletController],
  providers: [WalletService, JwtStrategy],
  exports: [WalletService],
})
export class WalletModule {}
