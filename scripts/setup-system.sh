#!/bin/bash

# PayrollX System Integration Script
# This script sets up the entire PayrollX system with all services

set -e

echo "🚀 Starting PayrollX System Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install Bun first."
    exit 1
fi

print_status "All prerequisites are installed ✅"

# Create environment files if they don't exist
print_status "Setting up environment files..."

# Create .env files for each service
services=("auth-service" "org-service" "employee-service" "wallet-service" "payroll-service" "transaction-service" "notification-service" "compliance-service" "api-gateway")

for service in "${services[@]}"; do
    if [ ! -f "apps/$service/.env" ]; then
        if [ -f "apps/$service/env.example" ]; then
            cp "apps/$service/env.example" "apps/$service/.env"
            print_success "Created .env for $service"
        else
            print_warning "No env.example found for $service"
        fi
    else
        print_status ".env already exists for $service"
    fi
done

# Create .env for MPC server
if [ ! -f "apps/mpc-server/.env" ]; then
    if [ -f "apps/mpc-server/env.example" ]; then
        cp "apps/mpc-server/env.example" "apps/mpc-server/.env"
        print_success "Created .env for mpc-server"
    else
        print_warning "No env.example found for mpc-server"
    fi
else
    print_status ".env already exists for mpc-server"
fi

# Install dependencies
print_status "Installing dependencies..."
bun install

print_success "Dependencies installed ✅"

# Build all services
print_status "Building all services..."
bun build

print_success "All services built ✅"

# Start infrastructure services first
print_status "Starting infrastructure services (PostgreSQL, RabbitMQ, Redis, Solana)..."
docker-compose up -d postgres rabbitmq redis solana

# Wait for infrastructure to be ready
print_status "Waiting for infrastructure services to be ready..."
sleep 30

# Check if PostgreSQL is ready
print_status "Checking PostgreSQL connection..."
until docker-compose exec postgres pg_isready -U admin; do
    print_status "Waiting for PostgreSQL..."
    sleep 2
done
print_success "PostgreSQL is ready ✅"

# Check if RabbitMQ is ready
print_status "Checking RabbitMQ connection..."
until docker-compose exec rabbitmq rabbitmq-diagnostics -q ping; do
    print_status "Waiting for RabbitMQ..."
    sleep 2
done
print_success "RabbitMQ is ready ✅"

# Run database migrations
print_status "Running database migrations..."
bun db:migrate

print_success "Database migrations completed ✅"

# Start MPC server
print_status "Starting MPC server..."
docker-compose up -d mpc-server

# Wait for MPC server to be ready
print_status "Waiting for MPC server to be ready..."
until curl -f http://localhost:8080/health > /dev/null 2>&1; do
    print_status "Waiting for MPC server..."
    sleep 2
done
print_success "MPC server is ready ✅"

# Start all microservices
print_status "Starting all microservices..."
docker-compose up -d auth-service org-service employee-service wallet-service payroll-service transaction-service notification-service compliance-service

# Wait for services to be ready
print_status "Waiting for microservices to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

services=("auth-service:3001" "org-service:3002" "employee-service:3003" "wallet-service:3005" "payroll-service:3006" "transaction-service:3007" "notification-service:3008" "compliance-service:3009")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        print_success "$name is healthy ✅"
    else
        print_warning "$name health check failed ⚠️"
    fi
done

# Start API Gateway
print_status "Starting API Gateway..."
docker-compose up -d api-gateway

# Wait for API Gateway to be ready
print_status "Waiting for API Gateway to be ready..."
sleep 10

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "API Gateway is healthy ✅"
else
    print_warning "API Gateway health check failed ⚠️"
fi

# Start monitoring services
print_status "Starting monitoring services..."
docker-compose up -d prometheus grafana

# Wait for monitoring services to be ready
print_status "Waiting for monitoring services to be ready..."
sleep 10

if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
    print_success "Prometheus is ready ✅"
else
    print_warning "Prometheus health check failed ⚠️"
fi

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Grafana is ready ✅"
else
    print_warning "Grafana health check failed ⚠️"
fi

# Start frontend
print_status "Starting frontend..."
docker-compose up -d web

# Wait for frontend to be ready
print_status "Waiting for frontend to be ready..."
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is ready ✅"
else
    print_warning "Frontend health check failed ⚠️"
fi

# Print service URLs
echo ""
echo "🎉 PayrollX System is now running!"
echo ""
echo "📊 Service URLs:"
echo "  Frontend:           http://localhost:3000"
echo "  API Gateway:        http://localhost:3000/api"
echo "  Auth Service:       http://localhost:3001"
echo "  Org Service:        http://localhost:3002"
echo "  Employee Service:   http://localhost:3003"
echo "  Wallet Service:     http://localhost:3005"
echo "  Payroll Service:    http://localhost:3006"
echo "  Transaction Service: http://localhost:3007"
echo "  Notification Service: http://localhost:3008"
echo "  Compliance Service: http://localhost:3009"
echo "  MPC Server:         http://localhost:8080"
echo ""
echo "🔧 Infrastructure:"
echo "  PostgreSQL:         localhost:5432"
echo "  RabbitMQ:           localhost:5672 (Management: http://localhost:15672)"
echo "  Redis:              localhost:6379"
echo "  Solana Validator:   localhost:8899"
echo ""
echo "📈 Monitoring:"
echo "  Prometheus:         http://localhost:9090"
echo "  Grafana:            http://localhost:3001 (admin/admin)"
echo ""
echo "🔑 Default Credentials:"
echo "  PostgreSQL:         admin/password"
echo "  RabbitMQ:           admin/password"
echo "  Grafana:            admin/admin"
echo ""

# Run system tests
print_status "Running system integration tests..."
bun test:integration

print_success "System integration tests completed ✅"

echo ""
print_success "🎉 PayrollX System is fully operational!"
echo ""
print_status "To stop the system, run: docker compose down"
print_status "To view logs, run: docker compose logs -f [service-name]"
print_status "To restart a service, run: docker compose restart [service-name]"
echo ""
