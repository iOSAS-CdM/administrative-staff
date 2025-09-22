# Tauri Updater Implementation

This application now includes automatic update functionality using Tauri's built-in updater. The updater checks for new releases on GitHub and allows users to download and install updates seamlessly.

## Features

- 🔄 **Automatic Update Checks**: Checks for updates when the app starts
- 🎯 **Manual Update Checks**: Users can manually check for updates via the "Check for Updates" button
- 📊 **Progress Tracking**: Shows download progress during updates
- 🔔 **User-Friendly Notifications**: Clear dialogs and notifications guide users through the update process
- 🔒 **Secure Updates**: Uses cryptographic signatures to verify update authenticity

## Setup Instructions

### 1. Generate Signing Keys

Run the setup script to generate the required signing keys:

```bash
./scripts/setup-updater.sh
```

This will:
- Generate a public/private key pair
- Show you the public key to add to your configuration
- Save the private key securely

### 2. Configure the Public Key

After running the setup script, copy the public key and update your `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "endpoints": [
        "https://api.github.com/repos/iOSAS-CdM/administrative-staff/releases/latest"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

### 3. Configure CI/CD for Signed Releases

Add your private key as a secret in your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add a new secret named `TAURI_SIGNING_PRIVATE_KEY`
4. Paste the private key content (from `~/.tauri/myapp.key`)

### 4. Update Your GitHub Actions Workflow

Add the signing key environment variable to your build workflow:

```yaml
- name: Build Tauri App
  env:
    TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
  run: |
    npm run tauri build
```

## How It Works

### Frontend (React)

- **UpdateNotification Component**: Provides a UI for checking and installing updates
- **Automatic Checks**: Checks for updates when the component mounts
- **Progress Tracking**: Shows download progress and status messages
- **User Control**: Users can choose to install now or later

### Backend (Rust)

- **Update Commands**: Provides `check_for_update` and `install_update` commands
- **Tauri Integration**: Uses the official `tauri-plugin-updater` for secure updates
- **Error Handling**: Graceful error handling and user feedback

### Update Process

1. **Check for Updates**: Queries the GitHub API for the latest release
2. **Version Comparison**: Compares the current version with the latest available
3. **User Notification**: Shows an update dialog if a new version is available
4. **Download & Install**: Downloads the update file and verifies its signature
5. **Restart**: Automatically restarts the application after installation

## Configuration Details

### Tauri Configuration

The updater is configured in `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "endpoints": ["https://api.github.com/repos/iOSAS-CdM/administrative-staff/releases/latest"],
      "dialog": true,
      "pubkey": "your-public-key"
    }
  }
}
```

### Dependencies

**Rust Dependencies** (`src-tauri/Cargo.toml`):
```toml
tauri-plugin-updater = "2.0.0"
```

**Frontend Dependencies** (`package.json`):
```json
"@tauri-apps/plugin-updater": "^2"
```

## Usage

### For Users

1. **Automatic Checks**: The app automatically checks for updates on startup
2. **Manual Checks**: Click the "Check for Updates" button in the top-right corner
3. **Install Updates**: When prompted, click "Update Now" to download and install
4. **Restart**: The app will restart automatically after the update

### For Developers

1. **Version Bumping**: Use the npm scripts to bump versions:
   ```bash
   npm run release:patch  # For bug fixes
   npm run release:minor  # For new features
   npm run release:major  # For breaking changes
   ```

2. **Creating Releases**: Push tags to trigger GitHub releases:
   ```bash
   git push origin v1.0.0
   ```

3. **Testing Updates**: Test the update mechanism in development by:
   - Building the app with a lower version number
   - Creating a test release with a higher version
   - Testing the update flow

## Troubleshooting

### Common Issues

1. **"No updater available"**: Ensure the updater plugin is properly configured
2. **"Invalid signature"**: Check that the public key in config matches the signing key
3. **"Network error"**: Verify the GitHub API endpoint is accessible
4. **"Permission denied"**: Ensure the app has permission to download and install files

### Debug Mode

Enable debug logging in development:

```rust
// In lib.rs
env_logger::init();
```

## Security Considerations

- 🔒 **Cryptographic Signatures**: All updates are signed and verified
- 🌐 **HTTPS Only**: Updates are downloaded over secure connections
- 🔑 **Key Management**: Keep private keys secure and never commit them to version control
- 📋 **Version Verification**: The updater checks version numbers to prevent downgrades

## Future Enhancements

- [ ] Delta updates for smaller download sizes
- [ ] Rollback functionality
- [ ] Custom update channels (stable, beta, alpha)
- [ ] Automatic update scheduling
- [ ] Update size estimation
- [ ] Bandwidth-aware downloads

---

For more information about Tauri's updater, visit: https://v2.tauri.app/plugin/updater/