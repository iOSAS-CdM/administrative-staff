#!/bin/bash

# Tauri Updater Signature Fix Verification Script
# This script helps verify and troubleshoot the updater signature configuration

echo "🔍 Tauri Updater Signature Verification"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Tauri CLI
echo "📋 Checking Tauri CLI..."
if command_exists tauri; then
    echo -e "${GREEN}✅ Tauri CLI is installed${NC}"
    tauri --version
else
    echo -e "${RED}❌ Tauri CLI not found${NC}"
    echo "Install with: npm install -g @tauri-apps/cli"
    exit 1
fi

echo ""

# Check public key in tauri.conf.json
echo "🔑 Checking public key configuration..."
if [ -f "src-tauri/tauri.conf.json" ]; then
    PUBKEY=$(node -e "
        try {
            const config = require('./src-tauri/tauri.conf.json');
            const pubkey = config.plugins?.updater?.pubkey;
            if (pubkey && pubkey.length > 50) {
                console.log('CONFIGURED');
            } else {
                console.log('MISSING');
            }
        } catch (e) {
            console.log('ERROR');
        }
    ")
    
    if [ "$PUBKEY" = "CONFIGURED" ]; then
        echo -e "${GREEN}✅ Public key is configured in tauri.conf.json${NC}"
    elif [ "$PUBKEY" = "MISSING" ]; then
        echo -e "${RED}❌ Public key is missing or invalid in tauri.conf.json${NC}"
        echo "Run the signing setup script: ./scripts/setup-updater.sh"
        exit 1
    else
        echo -e "${RED}❌ Error reading tauri.conf.json${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ tauri.conf.json not found${NC}"
    exit 1
fi

echo ""

# Check private key file
echo "🔐 Checking private key..."
if [ -f "$HOME/.tauri/iosas.key" ]; then
    echo -e "${GREEN}✅ Private key file exists: ~/.tauri/iosas.key${NC}"
    
    # Check if key file is not empty
    if [ -s "$HOME/.tauri/iosas.key" ]; then
        echo -e "${GREEN}✅ Private key file is not empty${NC}"
    else
        echo -e "${RED}❌ Private key file is empty${NC}"
        echo "Run: ./scripts/setup-updater.sh"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Private key file not found: ~/.tauri/iosas.key${NC}"
    echo "This is normal if the key was generated on a different machine."
    echo "Ensure the key is properly set in GitHub repository secrets."
fi

echo ""

# Check updater endpoints
echo "🌐 Checking updater endpoints..."
ENDPOINT=$(node -e "
    try {
        const config = require('./src-tauri/tauri.conf.json');
        const endpoints = config.plugins?.updater?.endpoints;
        if (endpoints && endpoints.length > 0) {
            console.log(endpoints[0]);
        } else {
            console.log('MISSING');
        }
    } catch (e) {
        console.log('ERROR');
    }
")

if [ "$ENDPOINT" != "MISSING" ] && [ "$ENDPOINT" != "ERROR" ]; then
    echo -e "${GREEN}✅ Updater endpoint configured: ${ENDPOINT}${NC}"
    
    # Test endpoint connectivity
    echo "🔗 Testing endpoint connectivity..."
    if command_exists curl; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT")
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Endpoint is accessible (HTTP $HTTP_STATUS)${NC}"
        else
            echo -e "${YELLOW}⚠️  Endpoint returned HTTP $HTTP_STATUS${NC}"
            echo "This might be normal if no releases exist yet."
        fi
    else
        echo -e "${YELLOW}⚠️  curl not available to test endpoint${NC}"
    fi
else
    echo -e "${RED}❌ Updater endpoint not configured${NC}"
    exit 1
fi

echo ""

# Check GitHub Actions workflow
echo "🔧 Checking GitHub Actions workflow..."
if [ -f ".github/workflows/production-release.yaml" ]; then
    echo -e "${GREEN}✅ GitHub Actions workflow found${NC}"
    
    # Check if TAURI_SIGNING_PRIVATE_KEY is referenced
    if grep -q "TAURI_SIGNING_PRIVATE_KEY" ".github/workflows/production-release.yaml"; then
        echo -e "${GREEN}✅ Workflow references TAURI_SIGNING_PRIVATE_KEY${NC}"
    else
        echo -e "${RED}❌ Workflow does not reference TAURI_SIGNING_PRIVATE_KEY${NC}"
        echo "Update your workflow to include the signing key."
        exit 1
    fi
    
    # Check if includeUpdaterJson is set
    if grep -q "includeUpdaterJson: true" ".github/workflows/production-release.yaml"; then
        echo -e "${GREEN}✅ Workflow includes updater JSON generation${NC}"
    else
        echo -e "${YELLOW}⚠️  Workflow might not generate updater JSON${NC}"
        echo "Ensure 'includeUpdaterJson: true' is set in tauri-action."
    fi
else
    echo -e "${YELLOW}⚠️  GitHub Actions workflow not found${NC}"
    echo "Releases may need to be created manually."
fi

echo ""

# Check project version
echo "📦 Checking project version..."
if [ -f "package.json" ]; then
    PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
    echo -e "${GREEN}✅ Package version: $PACKAGE_VERSION${NC}"
    
    # Check if tauri.conf.json version matches
    TAURI_VERSION=$(node -e "
        try {
            const config = require('./src-tauri/tauri.conf.json');
            console.log(config.version);
        } catch (e) {
            console.log('ERROR');
        }
    ")
    
    if [ "$TAURI_VERSION" = "../package.json" ]; then
        echo -e "${GREEN}✅ Tauri config uses package.json version${NC}"
    elif [ "$TAURI_VERSION" = "$PACKAGE_VERSION" ]; then
        echo -e "${GREEN}✅ Tauri config version matches package.json${NC}"
    else
        echo -e "${YELLOW}⚠️  Version mismatch between package.json and tauri.conf.json${NC}"
        echo "Run: ./scripts/sync-versions.sh"
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "============="

echo "1. ${BLUE}Verify GitHub Repository Secret:${NC}"
echo "   - Go to https://github.com/iOSAS-CdM/administrative-staff/settings/secrets/actions"
echo "   - Ensure 'TAURI_SIGNING_PRIVATE_KEY' secret exists"
echo "   - The secret should contain the content of ~/.tauri/iosas.key"

echo ""
echo "2. ${BLUE}Test Release Process:${NC}"
echo "   - Create a test release: git tag v0.0.1-test && git push origin v0.0.1-test"
echo "   - Check if the release includes .sig files"
echo "   - Verify the updater JSON is generated"

echo ""
echo "3. ${BLUE}Manual Test:${NC}"
echo "   - Build the app with current version"
echo "   - Create a release with higher version"
echo "   - Test the updater functionality"

echo ""
echo "4. ${BLUE}If signature errors persist:${NC}"
echo "   - Regenerate keys: ./scripts/setup-updater.sh"
echo "   - Update GitHub secret with new private key"
echo "   - Create a new signed release"

echo ""
echo -e "${GREEN}✅ Verification complete!${NC}"
echo ""
echo "For more help, see:"
echo "- UPDATER_README.md"
echo "- SIGNING_SETUP_COMPLETE.md"