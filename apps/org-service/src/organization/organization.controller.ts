 import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { OrganizationService } from "./organization.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@payrollx/contracts";

@ApiTags("Organizations")
@Controller("organizations")
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  @ApiResponse({
    status: 201,
    description: "Organization created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 409, description: "Organization already exists" })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Request() req: any
  ) {
    return this.organizationService.create(createOrganizationDto, req.user.id);
  }

  @Get(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get organization by ID" })
  @ApiResponse({
    status: 200,
    description: "Organization retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  async findOne(@Param("id") id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update organization" })
  @ApiResponse({
    status: 200,
    description: "Organization updated successfully",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  async update(
    @Param("id") id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Post(":id/onboard")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Complete organization onboarding" })
  @ApiResponse({
    status: 200,
    description: "Organization onboarding completed",
  })
  @ApiResponse({ status: 404, description: "Organization not found" })
  async onboard(
    @Param("id") id: string,
    @Body() body: { authorizedSigners: string[] }
  ) {
    return this.organizationService.completeOnboarding(
      id,
      body.authorizedSigners
    );
  }
}
