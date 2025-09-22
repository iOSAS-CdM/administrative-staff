#!/bin/bash

# Tauri Updater Setup Script
# This script helps generate the signing keys needed for the Tauri updater

echo "🔐 Tauri Updater Setup"
echo "======================"
echo ""

# Check if Tauri CLI is installed
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI not found. Installing..."
    npm install -g @tauri-apps/cli
fi

echo "📋 Generating signing keys for updater..."
echo ""

# Generate the signing keys
tauri signer generate -w ~/.tauri/iosas.key

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Signing keys generated successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the public key from the output above"
    echo "2. Add it to your tauri.conf.json under plugins.updater.pubkey"
    echo "3. Keep the private key secure (it's saved in ~/.tauri/iosas.key)"
    echo "4. Add the private key to your CI/CD environment variables"
    echo ""
    echo "💡 Example tauri.conf.json configuration:"
    echo '{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://api.github.com/repos/iOSAS-CdM/administrative-staff/releases/latest"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}'
    echo ""
    echo "🚀 For GitHub Actions, add this to your workflow:"
    echo "- name: Build and sign app"
    echo "  env:"
    echo "    TAURI_SIGNING_PRIVATE_KEY: \${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}"
    echo "  run: tauri build"
    echo ""
else
    echo "❌ Failed to generate signing keys"
    exit 1
fi