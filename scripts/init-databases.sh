#!/bin/bash

echo "Initializing PayrollX databases..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec payrollx-postgres pg_isready -U admin -d postgres; do
  echo "PostgreSQL is not ready yet..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Create databases
echo "Creating databases..."
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_auth;" 2>/dev/null || echo "Database payrollx_auth already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_org;" 2>/dev/null || echo "Database payrollx_org already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_employee;" 2>/dev/null || echo "Database payrollx_employee already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_wallet;" 2>/dev/null || echo "Database payrollx_wallet already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_payroll;" 2>/dev/null || echo "Database payrollx_payroll already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_transaction;" 2>/dev/null || echo "Database payrollx_transaction already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_notification;" 2>/dev/null || echo "Database payrollx_notification already exists"
docker exec payrollx-postgres psql -U admin -d postgres -c "CREATE DATABASE payrollx_compliance;" 2>/dev/null || echo "Database payrollx_compliance already exists"

echo "All databases created successfully!"

# Generate Prisma clients
echo "Generating Prisma clients..."
npm run db:generate

echo "Database initialization complete!"
