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

print_status "Setting up environment files..."

if [ ! -f ".env.example" ]; then
    print_error ".env.example file not found in root directory"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local from .env.example..."
    cp .env.example .env.local
    print_success "Created .env.local"
else
    print_warning ".env.local already exists, skipping..."
fi

SERVICES=(
    "api-gateway"
    "auth-service"
    "org-service"
    "employee-service"
    "wallet-service"
    "payroll-service"
    "transaction-service"
    "notification-service"
    "compliance-service"
)

for service in "${SERVICES[@]}"; do
    SERVICE_PATH="apps/$service"
    ENV_EXAMPLE="$SERVICE_PATH/env.example"
    ENV_FILE="$SERVICE_PATH/.env"
    
    if [ -f "$ENV_EXAMPLE" ]; then
        if [ ! -f "$ENV_FILE" ]; then
            print_status "Creating .env for $service..."
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_success "Created $ENV_FILE"
        else
            print_warning "$ENV_FILE already exists, skipping..."
        fi
    else
        print_warning "$ENV_EXAMPLE not found, skipping $service..."
    fi
done

if [ -f "apps/mpc-server/env.example" ]; then
    if [ ! -f "apps/mpc-server/.env" ]; then
        print_status "Creating .env for mpc-server..."
        cp "apps/mpc-server/env.example" "apps/mpc-server/.env"
        print_success "Created apps/mpc-server/.env"
    else
        print_warning "apps/mpc-server/.env already exists, skipping..."
    fi
fi

print_success "Environment setup complete!"
print_status "Please review and update .env.local and service .env files as needed"
