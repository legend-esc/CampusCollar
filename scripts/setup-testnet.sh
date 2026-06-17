#!/usr/bin/env bash
set -euo pipefail

# Funds testnet accounts and deploys contracts to Stellar testnet
# Usage: ./scripts/setup-testnet.sh

NETWORK="testnet"
FRIENDBOT="https://friendbot.stellar.org"

echo "Generating admin keypair..."
ADMIN_KEYPAIR=$(stellar keys generate admin --network "$NETWORK" 2>&1)
ADMIN_SECRET=$(stellar keys show admin --network "$NETWORK" 2>/dev/null)
ADMIN_PUBLIC=$(stellar keys address admin --network "$NETWORK" 2>/dev/null)

echo "Admin public key: $ADMIN_PUBLIC"
echo "Funding via Friendbot..."
curl -sf "$FRIENDBOT?addr=$ADMIN_PUBLIC" > /dev/null
echo "Funded."

echo ""
echo "Deploying contracts to testnet..."
./scripts/deploy.sh "$NETWORK" "$ADMIN_SECRET"

echo ""
echo "Add to your .env:"
echo "  STELLAR_ADMIN_SECRET=$ADMIN_SECRET"
echo "  STELLAR_ADMIN_PUBLIC=$ADMIN_PUBLIC"
