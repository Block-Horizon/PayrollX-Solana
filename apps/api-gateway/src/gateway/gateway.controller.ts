import {
  Controller,
  All,
  Body,
  Param,
  Query,
  Req,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

/**
 * Gateway Controller
 *
 * This controller handles all incoming API requests and routes them to the appropriate
 * microservice using the GatewayService. It acts as a single entry point for all
 * microservice communications.
 *
 * Route Pattern:
 * - All routes use wildcard patterns like 'auth/*', 'org/*', etc.
 * - The '*' captures the remaining path which is passed to the target service
 * - The controller extracts query params, body, and path params from the request
 *
 * Example:
 * - GET /api/auth/login -> proxies to auth service at /api/auth/login
 * - POST /api/org/create -> proxies to org service at /api/org/create
 *
 * @class GatewayController
 */
@ApiTags('Gateway')
@Controller()
export class GatewayController {
  /**
   * Constructor injects the GatewayService for proxying requests.
   *
   * @param gatewayService - Service responsible for routing requests to microservices
   */
  constructor(private readonly gatewayService: GatewayService) {}

  /**
   * Proxies all requests matching 'auth/*' pattern to the authentication service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the auth service
   */
  @All('auth/*')
  @ApiOperation({ summary: 'Proxy to auth service' })
  async proxyToAuth(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'auth',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'org/*' pattern to the organization service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the org service
   */
  @All('org/*')
  @ApiOperation({ summary: 'Proxy to org service' })
  async proxyToOrg(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'org',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'employee/*' pattern to the employee service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the employee service
   */
  @All('employee/*')
  @ApiOperation({ summary: 'Proxy to employee service' })
  async proxyToEmployee(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'employee',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'wallet/*' pattern to the wallet service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the wallet service
   */
  @All('wallet/*')
  @ApiOperation({ summary: 'Proxy to wallet service' })
  async proxyToWallet(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'wallet',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'payroll/*' pattern to the payroll service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the payroll service
   */
  @All('payroll/*')
  @ApiOperation({ summary: 'Proxy to payroll service' })
  async proxyToPayroll(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'payroll',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'transaction/*' pattern to the transaction service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the transaction service
   */
  @All('transaction/*')
  @ApiOperation({ summary: 'Proxy to transaction service' })
  async proxyToTransaction(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'transaction',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'notification/*' pattern to the notification service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the notification service
   */
  @All('notification/*')
  @ApiOperation({ summary: 'Proxy to notification service' })
  async proxyToNotification(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'notification',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }

  /**
   * Proxies all requests matching 'compliance/*' pattern to the compliance service.
   * Handles GET, POST, PUT, DELETE, PATCH methods.
   *
   * @param req - Express request object containing method, headers, etc.
   * @param params - Route parameters (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests
   * @returns Response from the compliance service
   */
  @All('compliance/*')
  @ApiOperation({ summary: 'Proxy to compliance service' })
  async proxyToCompliance(
    @Req() req: Request,
    @Param() params: Record<string, string>,
    @Query() query: Record<string, string | string[]>,
    @Body() body: unknown,
    @Headers('x-correlation-id') correlationId?: string,
  ): Promise<unknown> {
    return this.gatewayService.proxyRequest(
      'compliance',
      params,
      query,
      body,
      req.method,
      correlationId,
      req.headers as Record<string, string>,
    );
  }
}
