#!/bin/bash

# Sync version from package.json to tauri.conf.json
# This script ensures both files have the same version

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Syncing version from package.json to tauri.conf.json...${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    exit 1
fi

# Check if tauri.conf.json exists
if [ ! -f "src-tauri/tauri.conf.json" ]; then
    echo -e "${RED}❌ Error: src-tauri/tauri.conf.json not found${NC}"
    exit 1
fi

# Get version from package.json
PACKAGE_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}📦 Package.json version: $PACKAGE_VERSION${NC}"

# Update tauri.conf.json
node -e "
    const fs = require('fs');
    const pkg = require('./package.json');
    const tauriConfigPath = './src-tauri/tauri.conf.json';
    
    try {
        const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));
        const oldVersion = tauriConfig.version;
        tauriConfig.version = pkg.version;
        fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, '\t'));
        console.log('📝 Updated tauri.conf.json: ' + oldVersion + ' → ' + pkg.version);
    } catch (error) {
        console.error('❌ Error updating tauri.conf.json:', error.message);
        process.exit(1);
    }
"

echo -e "${GREEN}✅ Version sync completed successfully${NC}"