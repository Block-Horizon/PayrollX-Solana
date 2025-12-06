import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { FileInterceptor } from "@nestjs/platform-express";
import { EmployeeService } from "./employee.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  LinkWalletDto,
  KycDocumentDto,
} from "@payrollx/contracts";

@ApiTags("Employees")
@Controller("employees")
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: "Create a new employee" })
  @ApiResponse({
    status: 201,
    description: "Employee created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 409, description: "Employee already exists" })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req: any
  ) {
    return this.employeeService.create(createEmployeeDto, req.user.id);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get employee by ID" })
  @ApiResponse({
    status: 200,
    description: "Employee retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  async findOne(@Param("id") id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update employee" })
  @ApiResponse({
    status: 200,
    description: "Employee updated successfully",
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  async update(
    @Param("id") id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Post(":id/wallet/link")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Link wallet to employee" })
  @ApiResponse({
    status: 200,
    description: "Wallet linked successfully",
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  async linkWallet(
    @Param("id") id: string,
    @Body() linkWalletDto: LinkWalletDto
  ) {
    return this.employeeService.linkWallet(id, linkWalletDto.walletAddress);
  }

  @Post(":id/kyc")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload KYC documents" })
  @ApiResponse({
    status: 200,
    description: "KYC documents uploaded successfully",
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  @UseInterceptors(FileInterceptor("document"))
  async uploadKyc(
    @Param("id") id: string,
    @Body() kycDocumentDto: KycDocumentDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.employeeService.uploadKycDocuments(id, kycDocumentDto, file);
  }

  @Post(":id/kyc/verify")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify employee KYC" })
  @ApiResponse({
    status: 200,
    description: "KYC verification completed",
  })
  @ApiResponse({ status: 404, description: "Employee not found" })
  async verifyKyc(@Param("id") id: string) {
    return this.employeeService.verifyKyc(id);
  }
}

