# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Capacitor 6 plugin that provides universal dark mode support for Ionic web, iOS, and Android applications. The plugin manages dark mode detection, user preferences, CSS class toggling, and status bar synchronization across all platforms.

## Build & Development Commands

Essential commands for development:

- `pnpm build` - Full build process (lint + compile + bundle)
- `pnpm build.dev` - Development build with source maps
- `pnpm watch` - Watch mode for development
- `pnpm lint` - Run all linting (ESLint, Prettier, TypeScript, Swift)
  - `pnpm lint.eslint .` - ESLint only
  - `pnpm lint.prettier '**/*.{js,mjs,ts,json,md,java}'` - Prettier only  
  - `pnpm lint.tsc` - TypeScript check only
- `pnpm verify.ios` - Build and test iOS native code
- `pnpm verify.android` - Build and test Android native code
- `pnpm verify` - Verify both iOS and Android
- `pnpm docgen` - Generate API documentation in README.md
- `pnpm release` - Full release process (clean, build, docs, version, publish)

## Architecture

### Core Structure

- **Plugin Registration**: Uses Capacitor's `registerPlugin` with platform-specific implementations
- **Base Class**: `DarkModeBase` contains shared logic for all platforms
- **Platform Implementations**: 
  - `DarkModeWeb` for web platforms
  - `DarkModeNative` for iOS/Android native functionality
- **Type Definitions**: Comprehensive TypeScript interfaces in `definitions.ts`

### Key Components

1. **Plugin Interface** (`DarkModePlugin`): Defines the public API with methods like `init()`, `isDarkMode()`, `addAppearanceListener()`, `update()`

2. **Appearance Management**: 
   - Handles three modes: `dark`, `light`, `system`
   - Supports custom CSS classes (defaults: `.dark` for Ionic <8, `.ion-palette-dark` for Ionic 8+)
   - Manages user preference storage via getter/setter functions

3. **Status Bar Integration**: 
   - Automatic status bar synchronization on Android
   - Custom background color and style management
   - Platform-specific handling (iOS vs Android)

4. **Transition Control**: Temporarily disables CSS transitions during mode switches to prevent visual glitches

### File Structure

- `src/index.ts` - Plugin registration and exports
- `src/definitions.ts` - TypeScript interfaces and types
- `src/base.ts` - Shared base class implementation
- `src/web.ts` - Web-specific implementation
- `src/native.ts` - Native platform implementation
- `src/utils.ts` - Color utility functions
- Platform-specific native code in `ios/` and `android/` directories

### Build System

- TypeScript compilation to `dist/esm/`
- Rollup bundling for distribution formats (IIFE, CJS)
- Source map support in development mode
- Native platform verification through Xcode and Gradle builds

## Key Implementation Details

- Ionic 8+ compatibility: Auto-detects Ionic version via `--ion-dynamic-font` CSS variable
- CSS class applied to `html` element (not `body`) for Ionic 8+ compatibility
- Listeners properly managed to prevent memory leaks
- Asynchronous getter/setter support for custom preference storage
- Comprehensive status bar style calculation based on background color luminance