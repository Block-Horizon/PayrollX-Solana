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

print_status "Setting up PayrollX-Solana without Docker..."

print_status "Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install Bun 1.22.0 or higher."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL client (psql) is not installed. Please install PostgreSQL."
    exit 1
fi

if ! command -v redis-cli &> /dev/null; then
    print_warning "Redis client not found. Make sure Redis is running."
fi

if ! command -v rabbitmqctl &> /dev/null; then
    print_warning "RabbitMQ client not found. Make sure RabbitMQ is running."
fi

print_status "Checking infrastructure services..."

if ! nc -z localhost 5432 2>/dev/null; then
    print_error "PostgreSQL is not running on localhost:5432"
    print_error "Please start PostgreSQL first"
    exit 1
fi

if ! nc -z localhost 6379 2>/dev/null; then
    print_warning "Redis is not running on localhost:6379"
    print_warning "Please start Redis if you need caching/session management"
fi

if ! nc -z localhost 5672 2>/dev/null; then
    print_warning "RabbitMQ is not running on localhost:5672"
    print_warning "Please start RabbitMQ if you need message queuing"
fi

print_status "Installing dependencies..."
bun install

print_status "Setting up environment files..."
./scripts/setup-env.sh

print_status "Building shared packages..."
bun run build:packages

print_status "Initializing databases..."
./scripts/setup-db.sh

print_success "Setup complete!"
print_status "Make sure the following services are running:"
print_status "  - PostgreSQL: localhost:5432"
print_status "  - RabbitMQ: localhost:5672 (optional)"
print_status "  - Redis: localhost:6379 (optional)"
print_status ""
print_status "To start the application services, run:"
print_status "  ./scripts/run-without-docker.sh"
