#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_status "Setting up PayrollX-Solana with Docker infrastructure..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Starting infrastructure services (PostgreSQL, RabbitMQ, Redis)..."

if docker compose version &> /dev/null; then
    docker compose -f docker-compose.infra.yml up -d
else
    docker-compose -f docker-compose.infra.yml up -d
fi

print_status "Waiting for services to be ready..."

sleep 5

print_status "Checking PostgreSQL..."
for i in {1..30}; do
    if docker exec payrollx_postgres pg_isready -U admin -d payrollx_main &> /dev/null; then
        print_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

print_status "Checking RabbitMQ..."
for i in {1..30}; do
    if docker exec payrollx_rabbitmq rabbitmq-diagnostics ping &> /dev/null; then
        print_success "RabbitMQ is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "RabbitMQ failed to start"
        exit 1
    fi
    sleep 1
done

print_status "Checking Redis..."
for i in {1..30}; do
    if docker exec payrollx_redis redis-cli ping &> /dev/null; then
        print_success "Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Redis failed to start"
        exit 1
    fi
    sleep 1
done

print_status "Installing dependencies..."
bun install

print_status "Setting up environment files..."
./scripts/setup-env.sh

print_status "Building shared packages..."
bun run build:packages

print_status "Initializing databases..."
./scripts/setup-db.sh

print_success "Setup complete!"
print_status "Infrastructure services are running:"
print_status "  - PostgreSQL: localhost:5432"
print_status "  - RabbitMQ: localhost:5672 (Management: http://localhost:15672)"
print_status "  - Redis: localhost:6379"
print_status ""
print_status "To start the application services, run:"
print_status "  ./scripts/run-with-docker.sh"
