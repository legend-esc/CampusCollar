#!/usr/bin/env bash
set -euo pipefail

# Deploys Soroban contracts to Stellar mainnet
# Usage: ./scripts/deploy.sh <network> <admin_secret>
# Example: ./scripts/deploy.sh mainnet SADMIN...

NETWORK=${1:-testnet}
ADMIN_SECRET=${2:-}

if [[ -z "$ADMIN_SECRET" ]]; then
  echo "Error: admin secret key required as second argument"
  exit 1
fi

echo "Deploying to $NETWORK..."

cd contracts/escrow
cargo build --target wasm32-unknown-unknown --release
ESCROW_WASM="target/wasm32-unknown-unknown/release/escrow.wasm"
stellar contract deploy \
  --wasm "$ESCROW_WASM" \
  --source "$ADMIN_SECRET" \
  --network "$NETWORK" \
  | tee /tmp/escrow_address.txt

cd ../badge-registry
cargo build --target wasm32-unknown-unknown --release
BADGE_WASM="target/wasm32-unknown-unknown/release/badge_registry.wasm"
stellar contract deploy \
  --wasm "$BADGE_WASM" \
  --source "$ADMIN_SECRET" \
  --network "$NETWORK" \
  | tee /tmp/badge_registry_address.txt

cd ../job-cap
cargo build --target wasm32-unknown-unknown --release
JOBCAP_WASM="target/wasm32-unknown-unknown/release/job_cap.wasm"
stellar contract deploy \
  --wasm "$JOBCAP_WASM" \
  --source "$ADMIN_SECRET" \
  --network "$NETWORK" \
  | tee /tmp/job_cap_address.txt

echo ""
echo "Deployment complete:"
echo "  Escrow:        $(cat /tmp/escrow_address.txt)"
echo "  BadgeRegistry: $(cat /tmp/badge_registry_address.txt)"
echo "  JobCap:        $(cat /tmp/job_cap_address.txt)"
echo ""
echo "Update your .env with these contract addresses."
