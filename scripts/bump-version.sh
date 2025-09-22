#!/bin/bash

# Script to bump version in package.json only
# Usage: ./bump-version.sh [patch|minor|major]
# Default: patch

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine bump type (default to patch)
BUMP_TYPE=${1:-patch}

echo -e "${BLUE}🔢 Bumping $BUMP_TYPE version...${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: $CURRENT_VERSION${NC}"

# Parse version components
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Bump version based on type
case $BUMP_TYPE in
    "major")
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    "minor")
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    "patch"|*)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo -e "${GREEN}🚀 New version: $NEW_VERSION${NC}"

# Update package.json
echo -e "${YELLOW}📝 Updating package.json...${NC}"
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$NEW_VERSION';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('✅ package.json updated');
"

echo -e "${GREEN}✅ Version bumped successfully from $CURRENT_VERSION to $NEW_VERSION${NC}"