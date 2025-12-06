import { Logger } from 'winston';
import axios, { AxiosError, AxiosResponse } from 'axios';

export type ServiceName =
  | 'auth'
  | 'org'
  | 'employee'
  | 'wallet'
  | 'payroll'
  | 'transaction'
  | 'notification'
  | 'compliance';

interface ServiceUrls {
  [key: string]: string;
}

const getServiceUrls = (): ServiceUrls => {
  return {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    org: process.env.ORG_SERVICE_URL || 'http://localhost:3002',
    employee: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3003',
    wallet: process.env.WALLET_SERVICE_URL || 'http://localhost:3004',
    payroll: process.env.PAYROLL_SERVICE_URL || 'http://localhost:3005',
    transaction: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3006',
    notification:
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    compliance: process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3008',
  };
};

const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

interface ErrorDetails {
  message: string;
  statusCode?: number;
  response?: unknown;
  stack?: string;
  isAxiosError: boolean;
}

const extractErrorDetails = (error: unknown): ErrorDetails => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { isAxiosError: unknown }).isAxiosError === true
  ) {
    const axiosError = error as AxiosError;
    return {
      message: axiosError.message || 'HTTP request failed',
      statusCode: axiosError.response?.status,
      response: axiosError.response?.data,
      isAxiosError: true,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      isAxiosError: false,
    };
  }

  return {
    message: String(error),
    isAxiosError: false,
  };
};

export const proxyRequest = async (
  service: string,
  params: Record<string, string | string[]>,
  query: Record<string, string | string[]>,
  body: unknown,
  method: string,
  correlationId: string | undefined,
  headers: Record<string, string>,
  logger: Logger,
): Promise<unknown> => {
  const requestId = correlationId || generateCorrelationId();
  const serviceName = service as ServiceName;
  const serviceUrls = getServiceUrls();
  const serviceUrl = serviceUrls[serviceName];

  if (!serviceUrl) {
    const errorMessage = `Unknown service: ${service}`;
    logger.error(errorMessage, {
      service,
      requestId,
      method,
    });
    throw new Error(errorMessage);
  }

  try {
    const pathParams = params['0'] as string | undefined;
    const wildcardPath = pathParams || '';

    const path = service === 'auth' ? `auth/${wildcardPath}` : wildcardPath;
    const url = `${serviceUrl}/api/${path}`;

    logger.info(`Proxying ${method} request to ${service} service`, {
      service: serviceName,
      method: method.toUpperCase(),
      url,
      path,
      requestId,
      hasBody: !!body,
      queryParams: Object.keys(query).length > 0 ? query : undefined,
    });

    const forwardedHeaders: Record<string, string> = {
      'X-Correlation-ID': requestId,
    };

    if (headers?.['authorization']) {
      forwardedHeaders['Authorization'] = headers['authorization'];
    }
    if (headers?.['Authorization']) {
      forwardedHeaders['Authorization'] = headers['Authorization'];
    }

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
      timeout: 30000,
    };

    let response: AxiosResponse<unknown>;

    switch (method.toUpperCase()) {
      case 'POST':
        response = await axios.post(url, body, requestConfig);
        break;
      case 'PUT':
        response = await axios.put(url, body, requestConfig);
        break;
      case 'PATCH':
        response = await axios.patch(url, body, requestConfig);
        break;
      case 'DELETE':
        response = await axios.delete(url, requestConfig);
        break;
      case 'GET':
      default:
        response = await axios.get(url, requestConfig);
        break;
    }

    logger.debug(
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
    const errorDetails = extractErrorDetails(error);

    logger.error(`Error proxying ${method} request to ${service} service`, {
      service: serviceName,
      method: method.toUpperCase(),
      requestId,
      error: errorDetails.message,
      statusCode: errorDetails.statusCode,
      response: errorDetails.response,
      stack: errorDetails.stack,
    });

    if (errorDetails.isAxiosError) {
      const statusCode = errorDetails.statusCode || 500;
      const errorObj: AppError = new Error(
        errorDetails.message || 'Service request failed',
      );
      errorObj.statusCode = statusCode;
      throw errorObj;
    }

    throw error;
  }
};

export interface AppError extends Error {
  statusCode?: number;
}
