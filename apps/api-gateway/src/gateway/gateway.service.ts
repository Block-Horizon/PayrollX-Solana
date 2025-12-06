import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

/**
 * Service names that the gateway can proxy requests to
 */
export type ServiceName =
  | 'auth'
  | 'org'
  | 'employee'
  | 'wallet'
  | 'payroll'
  | 'transaction'
  | 'notification'
  | 'compliance';

/**
 * HTTP methods supported by the gateway
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Interface for service URL configuration
 */
interface ServiceUrls {
  [key: string]: string;
}

/**
 * Gateway Service
 *
 * This service acts as a reverse proxy/router for all microservices in the PayrollX system.
 * It handles routing incoming requests to the appropriate microservice based on the URL path.
 *
 * Responsibilities:
 * - Maintains service discovery and URL mapping
 * - Proxies HTTP requests (GET, POST, PUT, DELETE) to backend services
 * - Handles error propagation and logging
 * - Provides centralized request routing
 *
 * @class GatewayService
 */
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly serviceUrls: ServiceUrls;

  /**
   * Constructor initializes the service URL mappings from environment variables.
   * Falls back to localhost defaults if environment variables are not set.
   *
   * @param httpService - NestJS HTTP service for making outgoing requests
   * @param configService - Configuration service for accessing environment variables
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Initialize service URL mappings from environment variables
    // Each service has its own port as defined in PORT_ASSIGNMENTS.md
    this.serviceUrls = {
      auth:
        this.configService.get<string>('AUTH_SERVICE_URL') ||
        'http://localhost:3001',
      org:
        this.configService.get<string>('ORG_SERVICE_URL') ||
        'http://localhost:3002',
      employee:
        this.configService.get<string>('EMPLOYEE_SERVICE_URL') ||
        'http://localhost:3003',
      wallet:
        this.configService.get<string>('WALLET_SERVICE_URL') ||
        'http://localhost:3004',
      payroll:
        this.configService.get<string>('PAYROLL_SERVICE_URL') ||
        'http://localhost:3005',
      transaction:
        this.configService.get<string>('TRANSACTION_SERVICE_URL') ||
        'http://localhost:3006',
      notification:
        this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
        'http://localhost:3007',
      compliance:
        this.configService.get<string>('COMPLIANCE_SERVICE_URL') ||
        'http://localhost:3008',
    };

    // Log service URL configuration at startup
    this.logger.log('Gateway service initialized with service URLs');
    Object.entries(this.serviceUrls).forEach(([service, url]) => {
      this.logger.debug(`${service} service URL: ${url}`);
    });
  }

  /**
   * Proxies an HTTP request to the specified microservice.
   *
   * This method:
   * 1. Validates the service name exists in configuration
   * 2. Constructs the target URL based on service and path
   * 3. Makes the HTTP request to the backend service
   * 4. Returns the response data
   * 5. Handles and logs errors appropriately
   *
   * @param service - The target service name (e.g., 'auth', 'org')
   * @param params - URL path parameters from the route (wildcard captures)
   * @param query - Query string parameters
   * @param body - Request body for POST/PUT requests (optional)
   * @param method - HTTP method (GET, POST, PUT, DELETE) - defaults to GET
   * @param correlationId - Optional correlation ID for request tracing
   * @returns Promise resolving to the response data from the target service
   * @throws HttpException if service is unknown or request fails
   */
  async proxyRequest(
    service: string,
    params: Record<string, string | string[]>,
    query: Record<string, string | string[]>,
    body?: unknown,
    method: string = 'GET',
    correlationId?: string,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const requestId = correlationId || this.generateCorrelationId();
    const serviceName = service as ServiceName;
    const serviceUrl = this.serviceUrls[serviceName];

    // Validate service exists in configuration
    if (!serviceUrl) {
      const errorMessage = `Unknown service: ${service}`;
      this.logger.error(errorMessage, {
        service,
        requestId,
        method,
      });
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: errorMessage,
          error: 'Bad Request',
          timestamp: new Date().toISOString(),
          path: `/api/${service}/*`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Extract the wildcard path parameter (first element of params object)
      // The route pattern 'service/*' captures the remaining path
      const pathParams = params['0'] as string | undefined;
      const wildcardPath = pathParams || '';

      // Special handling for auth service: it uses /api/auth/* pattern
      // Other services use /api/* directly
      const path = service === 'auth' ? `auth/${wildcardPath}` : wildcardPath;
      const url = `${serviceUrl}/api/${path}`;

      // Log request details
      this.logger.log(`Proxying ${method} request to ${service} service`, {
        service: serviceName,
        method: method.toUpperCase(),
        url,
        path,
        requestId,
        hasBody: !!body,
        queryParams: Object.keys(query).length > 0 ? query : undefined,
      });

      // Make HTTP request based on method
      let response: AxiosResponse<unknown>;

      // Forward all headers, especially Authorization
      const forwardedHeaders: Record<string, string> = {
        'X-Correlation-ID': requestId,
      };

      // Forward Authorization header if present
      if (headers?.['authorization']) {
        forwardedHeaders['Authorization'] = headers['authorization'];
      }
      if (headers?.['Authorization']) {
        forwardedHeaders['Authorization'] = headers['Authorization'];
      }

      // Forward other headers
      if (headers) {
        Object.keys(headers).forEach((key) => {
          if (
            key.toLowerCase() !== 'authorization' &&
            key.toLowerCase() !== 'x-correlation-id'
          ) {
            forwardedHeaders[key] = headers[key];
          }
        });
      }

      const requestConfig = {
        params: query,
        headers: forwardedHeaders,
      };

      switch (method.toUpperCase()) {
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, body, requestConfig),
          );
          break;
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, body, requestConfig),
          );
          break;
        case 'PATCH':
          response = await firstValueFrom(
            this.httpService.patch(url, body, requestConfig),
          );
          break;
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, requestConfig),
          );
          break;
        case 'GET':
        default:
          response = await firstValueFrom(
            this.httpService.get(url, requestConfig),
          );
          break;
      }

      // Log successful response
      this.logger.debug(
        `Successfully proxied ${method} request to ${service} service`,
        {
          service: serviceName,
          method: method.toUpperCase(),
          url,
          statusCode: response.status,
          requestId,
        },
      );

      return response.data;
    } catch (error) {
      // Enhanced error logging with structured data
      const errorDetails = this.extractErrorDetails(error);

      this.logger.error(
        `Error proxying ${method} request to ${service} service`,
        {
          service: serviceName,
          method: method.toUpperCase(),
          requestId,
          error: errorDetails.message,
          statusCode: errorDetails.statusCode,
          response: errorDetails.response,
          stack: errorDetails.stack,
        },
      );

      // Transform axios errors to NestJS HTTP exceptions
      if (errorDetails.isAxiosError) {
        const statusCode =
          errorDetails.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
        throw new HttpException(
          {
            statusCode,
            message: errorDetails.message || 'Service request failed',
            error: HttpStatus[statusCode] || 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path: `/api/${service}/*`,
            requestId,
          },
          statusCode,
        );
      }

      // Re-throw unknown errors
      throw error;
    }
  }

  /**
   * Generates a unique correlation ID for request tracing.
   * Format: timestamp-randomString
   *
   * @returns Correlation ID string
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Extracts error details from various error types (Axios, standard Error, etc.)
   *
   * @param error - The error object to extract details from
   * @returns Object containing error details
   */
  private extractErrorDetails(error: unknown): {
    message: string;
    statusCode?: number;
    response?: unknown;
    stack?: string;
    isAxiosError: boolean;
  } {
    // Check if it's an Axios error
    if (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as { isAxiosError: unknown }).isAxiosError === true
    ) {
      // Type guard for axios error
      const axiosError = error as {
        response?: { status: number; data: unknown };
        message?: string;
      };
      return {
        message: axiosError.message || 'HTTP request failed',
        statusCode: axiosError.response?.status,
        response: axiosError.response?.data,
        isAxiosError: true,
      };
    }

    // Check if it's a standard Error
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        isAxiosError: false,
      };
    }

    // Fallback for unknown error types
    return {
      message: String(error),
      isAxiosError: false,
    };
  }
}
