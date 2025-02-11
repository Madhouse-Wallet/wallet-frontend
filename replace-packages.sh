# Set base directories
export NODE_MODULES="/home/heramb/Documents/madhouse_wallet_frontend/wallet-frontend/node_modules"
export PACKAGES_DIR="/home/heramb/Documents/madhouse_wallet_frontend/wallet-frontend/pacakges/swapkit"

echo "Replacing @swapkit packages..."

# Replace wallet-evm-extensions
rm -rf "$NODE_MODULES/@swapkit/wallet-evm-extensions"
mkdir -p "$NODE_MODULES/@swapkit/wallet-evm-extensions"
cp -R "$PACKAGES_DIR/wallet-evm-extensions/"* "$NODE_MODULES/@swapkit/wallet-evm-extensions/"

# Replace wallets
rm -rf "$NODE_MODULES/@swapkit/wallets"
mkdir -p "$NODE_MODULES/@swapkit/wallets"
cp -R "$PACKAGES_DIR/wallets/"* "$NODE_MODULES/@swapkit/wallets/"

# Replace sdk
rm -rf "$NODE_MODULES/@swapkit/sdk"
mkdir -p "$NODE_MODULES/@swapkit/sdk"
cp -R "$PACKAGES_DIR/sdk/"* "$NODE_MODULES/@swapkit/sdk/"

echo "Package replacement completed!"