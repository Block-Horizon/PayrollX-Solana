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

print_status "Setting up PayrollX database schemas..."

POSTGRES_USER="${POSTGRES_USER:-admin}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-adminpass}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/postgres"

if ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT" 2>/dev/null; then
    print_error "PostgreSQL is not running on $POSTGRES_HOST:$POSTGRES_PORT"
    print_error "Please start the infrastructure services first:"
    print_error "  ./scripts/setup-with-docker.sh"
    exit 1
fi

print_status "Creating databases..."

DATABASES=(
    "payrollx_auth"
    "payrollx_org"
    "payrollx_employee"
    "payrollx_wallet"
    "payrollx_payroll"
    "payrollx_transaction"
    "payrollx_notification"
    "payrollx_compliance"
)

for db in "${DATABASES[@]}"; do
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
        print_warning "Database $db already exists, skipping..."
    else
        print_status "Creating database $db..."
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $db;" >/dev/null 2>&1
        print_success "Created database $db"
    fi
done

print_status "Running Prisma migrations..."

cd packages/database

SCHEMAS=(
    "prisma/auth/schema.prisma"
    "prisma/org/schema.prisma"
    "prisma/employee/schema.prisma"
    "prisma/wallet/schema.prisma"
    "prisma/payroll/schema.prisma"
    "prisma/transaction/schema.prisma"
    "prisma/notification/schema.prisma"
    "prisma/compliance/schema.prisma"
)

for schema in "${SCHEMAS[@]}"; do
    if [ -f "$schema" ]; then
        schema_name=$(basename $(dirname "$schema"))
        print_status "Setting up $schema_name schema..."
        
        case "$schema_name" in
            "auth")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_auth"
                ;;
            "org")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_org"
                ;;
            "employee")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_employee"
                ;;
            "wallet")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_wallet"
                ;;
            "payroll")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_payroll"
                ;;
            "transaction")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_transaction"
                ;;
            "notification")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_notification"
                ;;
            "compliance")
                DB_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/payrollx_compliance"
                ;;
        esac
        
        if DATABASE_URL="$DB_URL" npx prisma db push --schema="$schema" --skip-generate >/dev/null 2>&1; then
            print_success "$schema_name schema is ready"
        else
            print_error "Failed to setup $schema_name schema"
            exit 1
        fi
    fi
done

print_status "Generating Prisma clients..."
bun run prisma:generate:all

cd ../..

print_success "Database setup complete!"
print_status "All schemas are ready and Prisma clients are generated"
