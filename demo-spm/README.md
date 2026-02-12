# demo-spm

Ionic/Vue demo app for the @aparajita/capacitor-dark-mode plugin, using Swift Package Manager.

This demo uses shared web code from `demo-shared` via symlinks and thin wrapper config files.

## Scripts

- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build web app
- `pnpm ios.dev` - Run on iOS with live reload
- `pnpm ios` - Run on iOS

## Setup

After initial setup or when dependencies change, run:

```bash
pnpm install
cd demo-spm
./node_modules/.bin/cap sync
```

This will:

1. Install all dependencies
2. Update the CapApp-SPM Package.swift with correct pnpm paths
3. Set up the iOS project with SPM dependencies
