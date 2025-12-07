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

print_status "Starting PayrollX-Solana application services..."

if ! nc -z localhost 5432 2>/dev/null; then
    print_error "PostgreSQL is not running on localhost:5432"
    print_error "Please start PostgreSQL first"
    exit 1
fi

print_status "Starting all application services..."
bun run dev
