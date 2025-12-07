#!/usr/bin/env ts-node

/**
 * Fallback API Generation Script
 * 
 * Uses static OpenAPI specs when services are not running
 * This is useful for building without starting all services
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'generated');
const STATIC_SPEC_PATH = path.join(__dirname, '..', 'scripts', 'openapi-static.json');

// Create a minimal OpenAPI spec based on contracts
const staticSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PayrollX Unified API',
    version: '1.0',
    description: 'Combined API for all PayrollX microservices (Static)'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'API Gateway'
    }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'User registration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registration successful'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string' }
        }
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' }
        },
        required: ['email', 'password', 'firstName', 'lastName']
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Organizations', description: 'Organization endpoints' },
    { name: 'Employees', description: 'Employee endpoints' },
    { name: 'Payroll', description: 'Payroll endpoints' },
    { name: 'Transactions', description: 'Transaction endpoints' },
    { name: 'Notifications', description: 'Notification endpoints' },
    { name: 'Compliance', description: 'Compliance endpoints' }
  ]
};

async function main(): Promise<void> {
  console.log('🚀 Starting fallback API code generation...\n');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Save static spec
  fs.writeFileSync(STATIC_SPEC_PATH, JSON.stringify(staticSpec, null, 2));
  console.log(`✅ Static spec saved to ${STATIC_SPEC_PATH}`);

  // Copy to merged location
  const MERGED_SPEC_PATH = path.join(OUTPUT_DIR, 'openapi-merged.json');
  fs.copyFileSync(STATIC_SPEC_PATH, MERGED_SPEC_PATH);

  // Generate TypeScript client
  console.log('\n🔨 Generating TypeScript client from static spec using swagger-typescript-api...');
  
  try {
    execSync(
      `npx swagger-typescript-api generate -p "${MERGED_SPEC_PATH}" -o "${OUTPUT_DIR}" -n api.ts --axios --extract-request-params --extract-request-body --extract-response-body --responses --clean-output --sort-routes --sort-types --unwrap-response-data`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );
    console.log('✅ TypeScript client generated successfully!');
  } catch (error) {
    console.warn('⚠️  Code generation failed, but continuing...', (error as Error).message);
  }

  // Create index.ts to re-export from api.ts
  try {
    const indexPath = path.join(OUTPUT_DIR, 'index.ts');
    fs.writeFileSync(indexPath, "// Re-export everything from the generated api.ts\nexport * from './api';\n");
    console.log('✅ Created index.ts for easier imports');
  } catch (error) {
    // Ignore errors here as it's not critical
  }

  console.log('\n✨ Fallback API code generation completed!');
  console.log('💡 For full API generation, start all services and run: npm run generate:api');
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

