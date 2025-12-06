import { Module } from "@nestjs/common";
import { OrganizationController } from "./organization.controller";
import { OrganizationService } from "./organization.service";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, JwtStrategy],
  exports: [OrganizationService],
})
export class OrganizationModule {}
