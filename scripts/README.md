# Scripts Directory

This directory contains utility scripts for the OSAS Staff application.

## Scripts

### `sync-versions.sh`
**Purpose**: Synchronizes version between `package.json` and `src-tauri/tauri.conf.json`

**Usage**:
```bash
# From project root
./scripts/sync-versions.sh

# Via npm script
npm run sync-versions
```

**What it does**:
- Reads version from `package.json`
- Updates `src-tauri/tauri.conf.json` with the same version
- Provides clear feedback on version changes
- Includes error handling and validation

### `setup-updater.sh`
**Purpose**: Generates signing keys for Tauri updater functionality

**Usage**:
```bash
# From project root
./scripts/setup-updater.sh
```

**What it does**:
- Generates public/private key pair for signing updates
- Provides instructions for configuration
- Shows example configurations for CI/CD
- Explains how to secure the private key

## Integration

These scripts are integrated with:

### Package.json Scripts
- `npm run sync-versions` - Manual version synchronization
- `npm run version:patch/minor/major` - Version bumping with auto-sync
- `npm run version:commit` - Commits version changes

### Git Hooks
- **Pre-commit hook**: Automatically runs version sync during commits
- **Branch-based versioning**: Different increment rules for different branches

## File Structure

```
scripts/
├── README.md           # This file
├── setup-updater.sh    # Updater key generation
└── sync-versions.sh    # Version synchronization
```

## Development Workflow

### Version Management
1. **Automatic (Recommended)**: Just commit changes - pre-commit hook handles versioning
2. **Manual**: Use `npm run version:patch/minor/major` for explicit version control
3. **Sync Only**: Use `npm run sync-versions` if versions get out of sync

### Release Process
1. Make your changes
2. Commit to development branch (auto-increments minor version)
3. Merge to `release` branch (auto-increments major version)
4. Create GitHub release with the new version tag

### Troubleshooting

**Scripts not executable?**
```bash
chmod +x scripts/*.sh
```

**Version sync fails?**
- Check that both `package.json` and `src-tauri/tauri.conf.json` exist
- Ensure valid JSON syntax in both files
- Verify Node.js is installed and accessible

**Updater setup fails?**
- Ensure Tauri CLI is installed: `npm install -g @tauri-apps/cli`
- Check that you have write permissions to `~/.tauri/` directory

## Security Notes

- **Private keys**: Never commit private signing keys to version control
- **GitHub secrets**: Store `TAURI_SIGNING_PRIVATE_KEY` in repository secrets
- **Key rotation**: Regenerate keys periodically for security

## Maintenance

These scripts should be updated when:
- Tauri CLI commands change
- File structure modifications occur
- New version management requirements arise
- Security best practices evolve