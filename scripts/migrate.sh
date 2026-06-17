#!/usr/bin/env bash
set -euo pipefail

# Runs Prisma migrations against the target database
# Usage: ./scripts/migrate.sh [deploy|dev|reset]

COMMAND=${1:-dev}

cd server

case "$COMMAND" in
  deploy)
    echo "Running production migrations..."
    npx prisma migrate deploy
    ;;
  dev)
    echo "Running dev migrations (creates migration files)..."
    npx prisma migrate dev
    ;;
  reset)
    echo "Resetting database (DESTRUCTIVE)..."
    read -p "Are you sure? This will drop all data. [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
    npx prisma migrate reset --force
    ;;
  *)
    echo "Unknown command: $COMMAND. Use deploy, dev, or reset."
    exit 1
    ;;
esac

echo "Migration complete."
