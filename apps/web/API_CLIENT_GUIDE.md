# API Client Generation Guide

## Overview

This project implements a fully automated TypeScript API client generation system that creates a single `api.ts` file with all types, interfaces, and Axios-based API methods from OpenAPI specifications.

## Architecture

### Backend (NestJS Microservices)

Each microservice exposes OpenAPI 3.0 specification at:
- Swagger UI: `http://localhost:{PORT}/api/docs`
- OpenAPI JSON: `http://localhost:{PORT}/api/docs-json`

**Service Ports:**
- API Gateway: 3000
- Auth Service: 3001
- Org Service: 3002
- Employee Service: 3003
- Wallet Service: 3004
- Payroll Service: 3005
- Transaction Service: 3006
- Notification Service: 3007
- Compliance Service: 3008

### API Gateway Aggregation

The API Gateway aggregates all microservice specifications and serves them at:
- Unified OpenAPI JSON: `http://localhost:3000/api/docs/unified`

This is the single source of truth for the frontend.

### Frontend Generation

**Generator:** `swagger-typescript-api` v13.1.15

**Features:**
- ✅ Single file output (`api.ts`)
- ✅ Full TypeScript type safety
- ✅ Axios-based HTTP client
- ✅ Service-organized API methods
- ✅ Extracted request/response types
- ✅ Unwrapped response data
- ✅ JSDoc documentation

## Usage

### Basic Example

```typescript
import { Api } from '@/lib/generated/api';

// Initialize API client
const api = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Call API (response is unwrapped)
const response = await api.auth.authControllerLogin({
  email: 'user@example.com',
  password: 'password123',
});

console.log(response.accessToken); // Direct access
console.log(response.user);
```

### With Authentication

```typescript
const api = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// All requests now include the Bearer token
const orgs = await api.organizations.organizationControllerFindAll();
```

### Service Organization

API methods are organized by service:

- `api.health.*` - Health checks
- `api.auth.*` - Authentication (login, register, refresh, logout)
- `api.organizations.*` - Organization management
- `api.employees.*` - Employee management
- `api.wallets.*` - Wallet operations
- `api.payroll.*` - Payroll operations
- `api.transactions.*` - Transaction management
- `api.notifications.*` - Notification handling
- `api.compliance.*` - Compliance & audit logs

### Error Handling

```typescript
try {
  const response = await api.auth.authControllerLogin({
    email: 'user@example.com',
    password: 'password123',
  });
} catch (error: any) {
  if (error.response) {
    // Axios error response
    console.error('Status:', error.response.status);
    console.error('Message:', error.response.data.message);
  } else {
    // Network or other error
    console.error('Error:', error.message);
  }
}
```

## Generated Output Structure

```
lib/generated/
├── api.ts           # Main API client (1,554 lines)
│   ├── Types & Interfaces
│   ├── HttpClient class
│   └── Api class with service methods
└── index.ts         # Re-exports from api.ts
```

**Key Features:**
1. **Unwrapped Responses**: `.then((response) => response.data)` returns data directly
2. **Type Safety**: Full TypeScript types for all requests/responses
3. **Service Organization**: Methods grouped by microservice
4. **JSDoc**: Full documentation from OpenAPI spec

## Generation Process

### Automatic Generation

Runs automatically before `dev` and `build`:

```bash
npm run dev    # Generates API client first
npm run build  # Generates API client first
```

### Manual Generation

```bash
npm run generate:api
```

### Fallback Behavior

If API Gateway is unavailable:
1. Attempts to fetch from gateway
2. If empty, falls back to static spec
3. Generates API client from whatever is available

This ensures development can continue even if backend services aren't running.

## Configuration

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000

# API Gateway can use custom service URLs
AUTH_SERVICE_URL=http://localhost:3001
ORG_SERVICE_URL=http://localhost:3002
# ... etc
```

### Generator Options

Currently configured with:
- `--axios` - Use Axios HTTP client
- `--extract-request-params` - Extract query/path params
- `--extract-request-body` - Extract request body types
- `--extract-response-body` - Extract response types
- `--responses` - Include error response types
- `--clean-output` - Clean generated directory
- `--sort-routes` - Sort routes alphabetically
- `--sort-types` - Sort types alphabetically
- `--unwrap-response-data` - Return data instead of axios response

## Advanced Usage

### Dynamic Token Management

```typescript
class ApiClient {
  private api: Api;
  
  constructor(baseURL: string) {
    this.api = new Api({ baseURL });
  }
  
  setAuthToken(token: string) {
    this.api = new Api({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  
  async login(email: string, password: string) {
    const response = await this.api.auth.authControllerLogin({ email, password });
    this.setAuthToken(response.accessToken);
    return response;
  }
}
```

### React Component Example

```typescript
'use client';

import { Api } from '@/lib/generated/api';
import { useState } from 'react';

export function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    const api = new Api({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    });
    
    try {
      const response = await api.auth.authControllerLogin({ email, password });
      localStorage.setItem('token', response.accessToken);
      // Navigate to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

## NestJS Backend Configuration

### Example DTO with OpenAPI Decorators

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  password: string;

  @ApiProperty({
    description: 'Organization ID for multi-tenant authentication',
    required: false,
  })
  organizationId?: string;
}
```

### Controller with OpenAPI Tags

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    // Implementation
  }
}
```

## File Organization

- `scripts/generate-api.ts` - Main generation script
- `scripts/generate-api-fallback.ts` - Fallback generation with static spec
- `scripts/tsconfig.json` - TypeScript config for scripts
- `lib/generated/api.ts` - Generated API client (auto-generated)
- `lib/generated/index.ts` - Re-exports
- `lib/api-client.example.ts` - Usage examples

## Troubleshooting

### Generation Fails

1. Check API Gateway is running on port 3000
2. Verify all microservices are running
3. Check logs for connectivity issues
4. Fallback to static spec if needed

### Types Missing

1. Verify OpenAPI spec is properly exposed
2. Check DTOs have `@ApiProperty` decorators
3. Ensure controllers have proper OpenAPI tags

### Import Errors

```typescript
// ✅ Correct
import { Api } from '@/lib/generated/api';

// ❌ Wrong
import { Api } from '@/lib/generated'; // Index.ts re-exports work too, but api.ts is clearer
```

## Best Practices

1. **Never commit generated files** - They're gitignored
2. **Always generate before deployment** - Use CI/CD hooks
3. **Use environment variables** - Don't hardcode URLs
4. **Handle errors gracefully** - Check error.response for HTTP errors
5. **Store tokens securely** - Use secure cookies or encrypted storage

## Future Enhancements

Potential improvements:
- Add request/response interceptors
- Implement automatic token refresh
- Add request retry logic
- Support for file uploads
- Add request caching
- Create React hooks wrapper (optional)

## Additional Resources

- [swagger-typescript-api Documentation](https://github.com/acacode/swagger-typescript-api)
- [NestJS OpenAPI Guide](https://docs.nestjs.com/openapi/introduction)
- [Axios Documentation](https://axios-http.com/docs/intro)

