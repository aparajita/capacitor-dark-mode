# CLAUDE.md

Capacitor 8 plugin for universal dark mode support (Ionic web, iOS, Android). Manages dark mode detection, user preferences, CSS class toggling, and status bar sync.

## Commands

- `pnpm build` - Lint + compile + bundle
- `pnpm build.dev` - Build with source maps
- `pnpm lint` - All linting (ESLint, Prettier, TypeScript, Swift)
- `pnpm verify` - Build-test both iOS and Android native code
- `pnpm verify.ios` / `pnpm verify.android` - Platform-specific verify
- `pnpm docgen` - Regenerate API docs in README.md
- `pnpm release` - Full release (clean, build, docs, version, publish)

## Architecture

- `src/base.ts` - `DarkModeBase`: shared logic for all platforms
- `src/web.ts` - `DarkModeWeb`: web implementation
- `src/native.ts` - `DarkModeNative`: iOS/Android native bridge
- `src/definitions.ts` - Public API types (`DarkModePlugin`)
- `src/utils.ts` - Color utilities (luminance-based status bar style)
- `src/index.ts` - `registerPlugin` with platform routing

## Tooling Preferences

- Use Serena's semantic tools for code exploration and symbol lookups of Typescript and Vue code:
  - `jet_brains_find_symbol` - Find symbol definitions
  - `jet_brains_find_referencing_symbols` - Find references
  - `jet_brains_get_symbols_overview` - Get symbol overviews
- Do not use TypeScript LSP for symbol lookups

## Non-obvious Details

- Ionic 8+ auto-detected via `--ion-dynamic-font` CSS variable; uses `.ion-palette-dark` class (vs `.dark` for older Ionic)
- CSS dark class applied to `<html>`, not `<body>`, for Ionic 8+ compatibility
- CSS transitions temporarily disabled during mode switches to prevent flicker
- Preference storage uses async getter/setter functions (user-configurable)
- Three modes: `dark`, `light`, `system`
- Demo apps: `demo-pods` (CocoaPods) and `demo-spm` (Swift Package Manager)
