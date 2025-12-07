#!/bin/bash

# PayrollX Health Check Script
# Checks if all services are running and accessible

set -e

# Colors
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

# Function to check if a port is open
check_port() {
    local host=$1
    local port=$2
    local service_name=$3
    
    if nc -z $host $port 2>/dev/null; then
        print_success "$service_name is running on $host:$port"
        return 0
    else
        print_error "$service_name is not running on $host:$port"
        return 1
    fi
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local service_name=$2
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        print_success "$service_name is responding at $url"
        return 0
    else
        print_error "$service_name is not responding at $url"
        return 1
    fi
}

print_status "PayrollX Health Check"
echo "========================"

# Check infrastructure services
print_status "Checking Infrastructure Services..."
check_port localhost 5432 "PostgreSQL"
check_port localhost 6379 "Redis"
check_port localhost 5672 "RabbitMQ"
check_http "http://localhost:15672" "RabbitMQ Management"

echo ""

# Check blockchain services
print_status "Checking Blockchain Services..."
check_port localhost 8899 "Solana Test Validator"
check_port localhost 8080 "MPC Server"

echo ""

# Check microservices
print_status "Checking Microservices..."
check_http "http://localhost:3000/health" "API Gateway"
check_http "http://localhost:3001/health" "Auth Service"
check_http "http://localhost:3002/health" "Org Service"
check_http "http://localhost:3003/health" "Employee Service"
check_http "http://localhost:3004/health" "Wallet Service"
check_http "http://localhost:3005/health" "Payroll Service"
check_http "http://localhost:3006/health" "Transaction Service"
check_http "http://localhost:3007/health" "Notification Service"
check_http "http://localhost:3008/health" "Compliance Service"

echo ""

# Check frontend
print_status "Checking Frontend..."
check_http "http://localhost:3009" "Frontend"

echo ""
print_status "Health check complete!"
