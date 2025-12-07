# PayrollX-Solana

Enterprise blockchain-based payroll disbursement platform built on Solana with Multi-Party Computation (MPC) threshold signatures for secure wallet management.

## Overview

PayrollX-Solana is a microservices-based payroll system that enables organizations to manage employee payroll disbursements on the Solana blockchain. The system uses MPC threshold signatures to securely manage wallet operations without exposing private keys, ensuring enterprise-grade security for blockchain transactions.

### Key Features

- Multi-Party Computation (MPC) threshold signatures for secure wallet operations
- Microservices architecture with API gateway for request routing
- Role-based access control (RBAC) for different user types
- Employee portal for viewing payroll information
- Organization management with KYC support
- Payroll processing and scheduling
- Transaction management on Solana blockchain
- Compliance and audit logging
- Real-time notifications

## Architecture

The system consists of:

- **Frontend**: Next.js web application
- **API Gateway**: Express.js service for routing and authentication
- **Microservices**: Express.js services for auth, organizations, employees, wallets, payroll, transactions, notifications, and compliance
- **MPC Server**: Rust service for threshold signature operations
- **Infrastructure**: PostgreSQL databases, RabbitMQ message queue, Redis cache
- **Blockchain**: Solana programs for on-chain payroll operations

## Prerequisites

- Bun 1.22.0 or higher
- Node.js 22 or higher
- PostgreSQL 16
- RabbitMQ 3
- Redis 7
- Rust (for MPC server development)
- Docker and Docker Compose (optional, for containerized setup)

## Quick Start

### Setup with Docker (Recommended)

This script sets up infrastructure services (PostgreSQL, RabbitMQ, Redis) using Docker and prepares the project:

```bash
./scripts/setup-with-docker.sh
```

Then start the application services:

```bash
./scripts/run-with-docker.sh
```

### Setup without Docker

This script sets up the project assuming you have PostgreSQL, RabbitMQ, and Redis running locally:

```bash
./scripts/setup-without-docker.sh
```

Then start the application services:

```bash
./scripts/run-without-docker.sh
```

## Setup Scripts

### Environment Setup

Sets up all environment files from examples:

```bash
./scripts/setup-env.sh
```

This script:
- Creates `.env.local` from `.env.example` if it doesn't exist
- Creates `.env` files for all services from their `env.example` files

### Database Setup

Initializes all databases and runs migrations:

```bash
./scripts/setup-db.sh
```

This script:
- Creates all required databases (payrollx_auth, payrollx_org, etc.)
- Runs Prisma migrations for all services
- Generates Prisma clients

### Full Setup with Docker

Complete setup including infrastructure services via Docker:

```bash
./scripts/setup-with-docker.sh
```

This script:
- Starts PostgreSQL, RabbitMQ, and Redis using Docker Compose
- Installs dependencies
- Sets up environment files
- Builds shared packages
- Initializes databases

### Run with Docker Infrastructure

Starts all application services (infrastructure must be running via Docker):

```bash
./scripts/run-with-docker.sh
```

### Full Setup without Docker

Complete setup assuming local infrastructure services:

```bash
./scripts/setup-without-docker.sh
```

This script:
- Checks for required services (PostgreSQL, RabbitMQ, Redis)
- Installs dependencies
- Sets up environment files
- Builds shared packages
- Initializes databases

### Run without Docker

Starts all application services (infrastructure must be running locally):

```bash
./scripts/run-without-docker.sh
```

## Manual Setup

If you prefer to set up manually:

### 1. Set Up Environment

```bash
./scripts/setup-env.sh
```

Or manually copy `.env.example` to `.env.local` and configure service `.env` files.

### 2. Install Dependencies

```bash
bun install
```

### 3. Build Shared Packages

```bash
bun run build:packages
```

### 4. Set Up Databases

```bash
./scripts/setup-db.sh
```

### 5. Start Infrastructure (if not using Docker)

**PostgreSQL:**
```bash
# Create databases
createdb payrollx_auth
createdb payrollx_org
createdb payrollx_employee
createdb payrollx_wallet
createdb payrollx_payroll
createdb payrollx_transaction
createdb payrollx_notification
createdb payrollx_compliance
```

**RabbitMQ:**
```bash
# macOS: brew install rabbitmq && rabbitmq-server
# Linux: sudo apt-get install rabbitmq-server && rabbitmq-server
```

**Redis:**
```bash
# macOS: brew install redis && redis-server
# Linux: sudo apt-get install redis-server && redis-server
```

### 6. Start Services

```bash
bun run dev
```

This will start:
- Frontend on http://localhost:3100
- API Gateway on http://localhost:3000
- All microservices on their respective ports
- MPC server on http://localhost:8080

## Project Structure

```
payrollx-solana/
├── apps/
│   ├── web/                    # Next.js frontend
│   ├── api-gateway/            # Express.js API gateway
│   ├── auth-service/           # Authentication service
│   ├── org-service/            # Organization management
│   ├── employee-service/       # Employee management
│   ├── wallet-service/         # Wallet management
│   ├── payroll-service/        # Payroll processing
│   ├── transaction-service/    # Transaction management
│   ├── notification-service/   # Notifications
│   ├── compliance-service/    # Compliance and audit
│   └── mpc-server/             # Rust MPC server
├── packages/
│   ├── common/                 # Shared utilities
│   ├── contracts/              # API contracts
│   ├── database/               # Prisma schemas
│   └── ui/                     # UI components
├── programs/
│   └── payroll-solana/         # Solana Anchor program
└── scripts/                    # Utility scripts
```

## Services

- **Frontend**: http://localhost:3100
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Org Service**: http://localhost:3002
- **Employee Service**: http://localhost:3003
- **Wallet Service**: http://localhost:3005
- **Payroll Service**: http://localhost:3006
- **Transaction Service**: http://localhost:3007
- **Notification Service**: http://localhost:3008
- **Compliance Service**: http://localhost:3009
- **MPC Server**: http://localhost:8080

## Development

### Running Tests

```bash
bun run test
```

### Linting

```bash
bun run lint
```

### Type Checking

```bash
bun run check-types
```

### Database Operations

```bash
# Generate Prisma clients
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema changes
bun run db:push
```

## Environment Configuration

The root `.env.example` file contains all environment variables needed for local development with Docker. Copy it to `.env.local`:

```bash
cp .env.example .env.local
```

Each service also has its own `env.example` file in `apps/[service-name]/env.example`. The `setup-env.sh` script automatically creates `.env` files for all services from these examples.

Key environment variables:
- Database connection strings (PostgreSQL)
- JWT secrets for authentication
- Service URLs and ports
- RabbitMQ connection settings
- Redis connection settings
- Solana RPC endpoints
- MPC server configuration
