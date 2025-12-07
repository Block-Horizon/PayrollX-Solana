# PayrollX-Solana Web Application

Enterprise blockchain-based payroll management frontend built with Next.js 15, React 19, and Solana.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn UI
- **Blockchain**: Solana Web3.js + Wallet Adapter
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **TypeScript**: Strict mode enabled

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm/yarn/pnpm/bun

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm run start
```

### Scripts

- `npm run dev` - Start development server with Turbopack (auto-generates API client)
- `npm run build` - Build for production (auto-generates API client)
- `npm run start` - Start production server
- `npm run generate:api` - Manually generate TypeScript API client from OpenAPI specs
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## Project Structure

```
apps/web-2/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── employee-portal/   # Employee portal
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # Shadcn UI components
│   └── wallet/           # Wallet components
├── lib/                  # Utilities and helpers
│   ├── generated/        # Auto-generated API client (gitignored)
│   ├── hooks/           # Custom React hooks
│   └── stores/          # Zustand stores
├── scripts/              # Build scripts
│   ├── generate-api.ts  # API client generation script
│   └── tsconfig.json    # Script TypeScript config
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## Features

- ✅ Solana wallet integration (Phantom, Solflare)
- ✅ MPC wallet management
- ✅ Employee management
- ✅ Payroll execution and monitoring
- ✅ Compliance and audit logging
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Protected routes with authentication

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## API Client Generation

The application automatically generates a TypeScript API client from OpenAPI specs:

1. **Automatic Generation**: Runs on `dev` and `build` via `predev` and `prebuild` hooks
2. **Single Endpoint**: Fetches merged OpenAPI spec from API Gateway at `/api/docs/unified`
3. **Type-Safe**: Full TypeScript types for all API requests/responses
4. **Axios Client**: Uses `swagger-typescript-api` for code generation
5. **Single File**: All types, interfaces, and API handlers in one `api.ts` file

**Usage in Code:**

```typescript
import { Api } from '@/lib/generated/api';

// Initialize API client
const api = new Api({
  baseURL: 'http://localhost:3000',
  headers: {
    Authorization: 'Bearer YOUR_TOKEN_HERE'
  }
});

// Call API with full type safety (organized by service)
const response = await api.auth.authControllerLogin({
  email: 'user@example.com',
  password: 'password123'
});

// Response is unwrapped, directly accessible (AuthResponseDto type)
console.log(response.accessToken);
console.log(response.user);

// Other services available:
// api.health.* - Health checks
// api.organizations.* - Organization management
// api.employees.* - Employee management  
// api.wallets.* - Wallet operations
// api.payroll.* - Payroll operations
// api.transactions.* - Transaction management
// api.notifications.* - Notification handling
// api.compliance.* - Compliance & audit logs
```

**Manual Generation:**

```bash
npm run generate:api
```

## Production Deployment

This app is production-ready with:

- Security headers configured
- Console logs removed in production
- Image optimization
- Code splitting
- React strict mode
- SWC minification
