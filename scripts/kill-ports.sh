#!/bin/bash

# Kill processes on PayrollX-Solana ports

echo "🔧 Killing processes on application ports..."

# Define ports used by the application
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3100 8080 8899)

for port in "${PORTS[@]}"; do
    pid=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "  Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        sleep 0.5
    fi
done

# Kill Solana and MPC server specifically
if [ -f "$(pwd)/solana-validator.pid" ]; then
    kill $(cat "$(pwd)/solana-validator.pid") 2>/dev/null || true
    rm -f "$(pwd)/solana-validator.pid"
    echo "  Killed Solana validator"
fi

if [ -f "$(pwd)/mpc-server.pid" ]; then
    kill $(cat "$(pwd)/mpc-server.pid") 2>/dev/null || true
    rm -f "$(pwd)/mpc-server.pid"
    echo "  Killed MPC server"
fi

# Kill any npm/turbo/node processes related to the project
pkill -f "turbo run dev" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "✅ All ports cleared!"

