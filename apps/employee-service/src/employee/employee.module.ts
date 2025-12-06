import { Module } from "@nestjs/common";
import { EmployeeController } from "./employee.controller";
import { EmployeeService } from "./employee.service";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, JwtStrategy],
  exports: [EmployeeService],
})
export class EmployeeModule {}

