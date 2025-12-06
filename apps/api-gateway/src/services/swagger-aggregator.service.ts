import { Logger } from 'winston';
import axios from 'axios';

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

const fetchServiceSpec = async (
  serviceName: string,
  serviceUrl: string,
  logger: Logger,
): Promise<unknown> => {
  const swaggerUrl = `${serviceUrl}/api/docs-json`;

  try {
    logger.debug(`Fetching OpenAPI spec from ${serviceName} at ${swaggerUrl}`);

    const response = await axios.get(swaggerUrl, {
      timeout: 5000,
    });

    logger.debug(`Successfully fetched spec from ${serviceName}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.warn(
      `Failed to fetch OpenAPI spec from ${serviceName}: ${errorMessage}`,
    );

    return {
      openapi: '3.0.0',
      info: {
        title: `${serviceName} Service`,
        version: '1.0',
        description: 'API temporarily unavailable',
      },
      paths: {},
      components: {},
    };
  }
};

const mergeSpecs = (specs: Array<{ name: string; spec: unknown }>): unknown => {
  const merged: Record<string, unknown> = {
    openapi: '3.0.0',
    info: {
      title: 'PayrollX Unified API',
      version: '1.0',
      description: 'Combined API for all PayrollX microservices',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'API Gateway',
      },
    ],
    paths: {},
    components: {
      schemas: {},
      parameters: {},
      responses: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [],
  };

  specs.forEach(({ name, spec }) => {
    const specObj = spec as {
      paths?: Record<string, Record<string, unknown>>;
      components?: {
        schemas?: Record<string, unknown>;
        parameters?: Record<string, unknown>;
        responses?: Record<string, unknown>;
      };
      tags?: Array<{ name: string } | string>;
    };

    if (specObj.paths) {
      const mergedPaths = merged.paths as Record<
        string,
        Record<string, unknown>
      >;
      Object.keys(specObj.paths).forEach((path) => {
        let prefixedPath = path;
        if (!path.startsWith('/api/')) {
          prefixedPath = `/api/${name}${path}`;
        } else {
          const pathWithoutApi = path.replace(/^\/api\//, '');
          if (!pathWithoutApi.startsWith(`${name}/`)) {
            prefixedPath = `/api/${name}/${pathWithoutApi}`;
          }
        }
        if (!mergedPaths[prefixedPath]) {
          mergedPaths[prefixedPath] = {};
        }
        Object.keys(specObj.paths![path]).forEach((method) => {
          const pathMethod = specObj.paths![path][method] as {
            tags?: string[];
          };
          mergedPaths[prefixedPath][method] = {
            ...pathMethod,
            tags: [
              ...(pathMethod.tags || []),
              name.charAt(0).toUpperCase() + name.slice(1),
            ],
          };
        });
      });
    }

    if (specObj.components) {
      const mergedComponents = merged.components as {
        schemas?: Record<string, unknown>;
        parameters?: Record<string, unknown>;
        responses?: Record<string, unknown>;
      };

      if (specObj.components.schemas) {
        if (!mergedComponents.schemas) {
          mergedComponents.schemas = {};
        }
        Object.keys(specObj.components.schemas).forEach((schema) => {
          mergedComponents.schemas![schema] =
            specObj.components!.schemas![schema];
        });
      }

      if (specObj.components.parameters) {
        if (!mergedComponents.parameters) {
          mergedComponents.parameters = {};
        }
        Object.keys(specObj.components.parameters).forEach((param) => {
          mergedComponents.parameters![param] =
            specObj.components!.parameters![param];
        });
      }

      if (specObj.components.responses) {
        if (!mergedComponents.responses) {
          mergedComponents.responses = {};
        }
        Object.keys(specObj.components.responses).forEach((response) => {
          mergedComponents.responses![response] =
            specObj.components!.responses![response];
        });
      }
    }

    if (specObj.tags && Array.isArray(specObj.tags)) {
      const mergedTags = merged.tags as Array<{ name: string }>;
      specObj.tags.forEach((tag: { name: string } | string) => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        mergedTags.push({ name: tagName });
      });
    }
  });

  const mergedTags = merged.tags as Array<{ name: string }>;
  const uniqueTags = Array.from(
    new Set(mergedTags.map((tag: { name: string }) => tag.name)),
  );
  merged.tags = uniqueTags.map((tag: string) => ({ name: tag }));

  return merged;
};

let cachedSpec: unknown = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export const getMergedSpec = async (
  logger: Logger,
  forceRefresh = false,
): Promise<unknown> => {
  const now = Date.now();

  if (!forceRefresh && cachedSpec && now - cacheTimestamp < CACHE_TTL) {
    logger.debug('Returning cached OpenAPI spec');
    return cachedSpec;
  }

  logger.info('Fetching and merging OpenAPI specs from all services');

  const serviceUrls = getServiceUrls();
  const fetchPromises = Object.entries(serviceUrls).map(
    ([serviceName, serviceUrl]) =>
      fetchServiceSpec(serviceName, serviceUrl, logger).then((spec) => ({
        name: serviceName,
        spec,
      })),
  );

  const specs = await Promise.all(fetchPromises);

  const merged = mergeSpecs(specs);

  cachedSpec = merged;
  cacheTimestamp = now;

  logger.info('Successfully merged OpenAPI specs');
  return merged;
};

export const invalidateCache = (logger: Logger): void => {
  cachedSpec = null;
  cacheTimestamp = 0;
  logger.info('OpenAPI spec cache invalidated');
};
