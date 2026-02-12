# Plan: Add demo-spm and demo-shared directories

## Status Dashboard

| Step | Description                                                                            | Status      | Sub-plan |
| ---- | -------------------------------------------------------------------------------------- | ----------- | -------- |
| 1    | [Create demo-shared](#step-1-create-demo-shared)                                       | ✅ Complete | —        |
| 2    | [Refactor demo-pods to use demo-shared](#step-2-refactor-demo-pods-to-use-demo-shared) | ✅ Complete | —        |
| 3    | [Create demo-spm](#step-3-create-demo-spm)                                             | ✅ Complete | —        |
| 4    | [Update workspace and verify scripts](#step-4-update-workspace-and-verify-scripts)     | ✅ Complete | —        |
| 5    | [Verification](#step-5-verification)                                                   | ⏳ Pending  | —        |

## Context

The project currently has only `demo-pods` (a CocoaPods-based demo app). The goal is to:

1. Extract shared web code into a `demo-shared` package
2. Refactor `demo-pods` to reference `demo-shared` via symlinks (like biometric-auth does)
3. Create a new `demo-spm` demo that uses Swift Package Manager instead of CocoaPods
4. Update workspace configuration

Template: `@aparajita/capacitor-biometric-auth` which has this exact pattern working.

## ✅ Step 1: Create `demo-shared/`

Move shared web code from `demo-pods/` into `demo-shared/`. Files to create:

**Config files (adapted from demo-pods originals):**

- `demo-shared/package.json` — shared deps (no @capacitor/ios, @capacitor/android, no @ionic/cli)
- `demo-shared/capacitor.config.ts` — base config with empty appId/appName (like biometric-auth)
- `demo-shared/vite.config.mjs` — base vite config (adds `outDir` pointing to own dist)
- `demo-shared/tsconfig.json` — from demo-pods (remove baseUrl/paths, they go in each demo)
- `demo-shared/tsconfig.config.json` — from demo-pods as-is
- `demo-shared/tailwind.config.mjs` — from demo-pods as-is
- `demo-shared/postcss.config.mjs` — from demo-pods as-is
- `demo-shared/ionic.config.json` — from demo-pods as-is
- `demo-shared/prettier.config.js` — from demo-pods as-is
- `demo-shared/.browserslistrc` — from demo-pods as-is
- `demo-shared/.npmrc` — from demo-pods as-is
- `demo-shared/.prettierignore` — from demo-pods as-is
- `demo-shared/.versionrc.js` — from demo-pods as-is
- `demo-shared/index.html` — from demo-pods as-is

**Source files (move from demo-pods):**

- `demo-shared/src/` — all files from demo-pods/src/ (main.ts, app.vue, prefs.ts, env.d.ts, shims-vue.d.ts, router/, components/, views/, theme/)
- `demo-shared/public/` — all files from demo-pods/public/ (manifest.json, assets/icon/)

## ✅ Step 2: Refactor `demo-pods/` to use `demo-shared`

Replace files with symlinks and thin wrappers:

**Create symlinks:**

- `src -> ../demo-shared/src`
- `public -> ../demo-shared/public`
- `index.html -> ../demo-shared/index.html`
- `.browserslistrc -> ../demo-shared/.browserslistrc`
- `.npmrc -> ../demo-shared/.npmrc`
- `.prettierignore -> ../demo-shared/.prettierignore`
- `ionic.config.json -> ../demo-shared/ionic.config.json`

**Replace config files with thin wrappers:**

- `package.json` — slim: keep @capacitor/android, @capacitor/ios, add `"demo-shared": "workspace:*"`, move shared deps to demo-shared, keep @ionic/cli and @capacitor/cli as devDeps
- `capacitor.config.ts` — `import baseConfig from 'demo-shared/capacitor.config'`, spread + override appId, appName, webDir: `'../demo-shared/dist'`
- `vite.config.mjs` — `import sharedConfig from 'demo-shared/vite.config.mjs'`, mergeConfig with BUILD_VARIANT: 'CocoaPods' and root set to demo-shared dir
- `tsconfig.json` — extends `../demo-shared/tsconfig.json`, adds baseUrl/paths
- `tsconfig.config.json` — extends `../demo-shared/tsconfig.config.json`
- `tailwind.config.mjs` — `export { default } from 'demo-shared/tailwind.config.mjs'`
- `postcss.config.mjs` — `export { default } from 'demo-shared/postcss.config.mjs'`
- `prettier.config.js` — `module.exports = require('../demo-shared/prettier.config.js')`
- `.versionrc.js` — `module.exports = require('../demo-shared/.versionrc.js')`

**Keep unchanged:** `ios/`, `android/`, `simple-git-hooks.js`, `README.md`

**Delete after creating symlinks:** original `src/`, `public/`, `index.html`, `.browserslistrc`, `.npmrc`, `.prettierignore`, `ionic.config.json` files

## ✅ Step 3: Create `demo-spm/`

Same symlink + thin wrapper pattern as refactored demo-pods, but:

- **No** `@capacitor/android` dependency (android stays in demo-pods only)
- `vite.config.mjs` defines `BUILD_VARIANT: 'SPM'`
- `capacitor.config.ts` — same pattern, webDir: `'../demo-shared/dist'`

**Create symlinks:** same as demo-pods (src, public, index.html, .browserslistrc, .npmrc, .prettierignore, ionic.config.json)

**Config files:** same thin wrapper pattern as demo-pods

**iOS directory structure** (modeled after biometric-auth/demo-spm/ios):

- `ios/.gitignore`
- `ios/debug.xcconfig` — `CAPACITOR_DEBUG = true`
- `ios/capacitor-cordova-ios-plugins/` — with CordovaPluginsResources.podspec, resources/.gitkeep, sources/.gitkeep
- `ios/App/App/` — copy from demo-pods: AppDelegate.swift, Info.plist (adjusted display name), Assets.xcassets (copy binary files), Base.lproj/ (Main.storyboard, LaunchScreen.storyboard), capacitor.config.json (adapted for SPM + webDir), config.xml
- `ios/App/App.xcodeproj/project.pbxproj` — SPM variant (based on biometric-auth template, adapted for dark-mode: DEVELOPMENT_TEAM=4T36YYHY4V, PRODUCT_BUNDLE_IDENTIFIER=com.aparajita.capacitor.darkmodedemo, display name Dark Mode-SPM)
- `ios/App/App.xcodeproj/project.xcworkspace/` — with swiftpm/configuration and IDEWorkspaceChecks.plist
- `ios/App/CapApp-SPM/` — Package.swift (dependencies for dark-mode plugins including StatusBar), Sources/CapApp-SPM/CapApp-SPM.swift, README.md, .gitignore

**CapApp-SPM Package.swift dependencies:**

- capacitor-swift-pm (exact version matching @capacitor/ios)
- AparajitaCapacitorDarkMode (path: `../../../..`)
- CapacitorApp, CapacitorHaptics, CapacitorKeyboard, CapacitorSplashScreen, CapacitorStatusBar (pnpm paths — these will need `./node_modules/.bin/cap sync` to get exact paths)

## ✅ Step 4: Update workspace and verify scripts

- `pnpm-workspace.yaml` — add `demo-shared` and `demo-spm`
- Root `package.json` — already has demo-spm scripts, no changes needed
- Run `pnpm install` after all changes

## Step 5: Verification

1. `pnpm install` succeeds
2. `pnpm --filter demo-pods build` succeeds (web build via shared config)
3. `pnpm --filter demo-spm build` succeeds
4. iOS structure is correct for `pnpm verify.spm.ios` (may need `./node_modules/.bin/cap sync` in demo-spm first)

## Key files to modify

- `pnpm-workspace.yaml`
- `demo-pods/package.json`, `capacitor.config.ts`, `vite.config.mjs`, `tsconfig.json`, `tsconfig.config.json`, `tailwind.config.mjs`, `postcss.config.mjs`, `prettier.config.js`, `.versionrc.js`

## Key files to create

- All of `demo-shared/`
- All of `demo-spm/` (config files + iOS project structure)

## Notes

- Binary files (PNG images in Assets.xcassets) will be copied from demo-pods
- The CapApp-SPM Package.swift pnpm paths depend on exact resolved versions; `./node_modules/.bin/cap sync` should be run after initial setup to correct them
- The pbxproj for demo-spm is based on the biometric-auth template, adapted for dark-mode specifics
