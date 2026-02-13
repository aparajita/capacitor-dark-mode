# Edge-to-Edge Demo Tab Plan

## Context

On Android 15+, edge-to-edge is enforced by the OS — system bars are transparent overlays and content extends behind them. The plugin already supports this via the `textOnly` sync option (only sets status bar text/icon style, skips setting native background color which is invisible when the WebView covers the full screen). The demo needs a way to visualize and test this behavior.

## Status Dashboard

| Phase | Description                                                                    | Status     | Sub-plan |
| ----- | ------------------------------------------------------------------------------ | ---------- | -------- |
| 1     | [Remove native Java padding](#phase-1--remove-native-java-padding)             | ⏳ Pending | —        |
| 2     | [Convert demo to tab-based layout](#phase-2--convert-demo-to-tab-based-layout) | ⏳ Pending | —        |
| 3     | [Edge-to-edge demo page](#phase-3--edge-to-edge-demo-page)                     | ⏳ Pending | —        |
| 4     | [Verification](#phase-4--verification)                                         | ⏳ Pending | —        |

## Plugin Changes

None. The `textOnly` option in `syncStatusBar` already correctly handles edge-to-edge mode.

## Phase 1 — Remove native Java padding

**Files:**

- `demo-pods/android/app/src/main/java/com/aparajita/capacitor/darkmodedemo/MainActivity.java`
- `demo-spm/android/app/src/main/java/com/aparajita/capacitor/darkmodedemo/MainActivity.java`

Remove the `ViewCompat.setOnApplyWindowInsetsListener` code that applies system bar insets as padding. With this removed, the WebView goes edge-to-edge, and Ionic's CSS safe area handling takes over (it already respects `viewport-fit=cover` from the viewport meta tag).

The `MainActivity` can revert to a plain `BridgeActivity` with no overrides.

## Phase 2 — Convert demo to tab-based layout

**Files to modify:**

- `demo-shared/src/app.vue` — Add `<ion-tabs>` with two tab buttons
- `demo-shared/src/router/index.ts` — Add tab routes

**New files:**

- `demo-shared/src/pages/tabs-layout.vue` — Tab layout wrapper with `<ion-tabs>` and `<ion-tab-bar>`
- `demo-shared/src/pages/edge-to-edge.vue` — Edge-to-edge demo page

**Rename:**

- `demo-shared/src/components/dark-mode-demo.vue` → `demo-shared/src/pages/controls.vue` (or keep and reference from a page)

**Tab structure:**

- **Tab 1 ("Controls")**: The existing dark mode controls (appearance selection, status bar sync options)
- **Tab 2 ("Edge to Edge")**: A page with no `<ion-header>` (or a transparent one), showing colored content that visibly extends behind the status bar. When this tab is active, status bar sync is forced to `textOnly`.

**Router changes:**

```
/tabs/controls    → Controls page (current UI)
/tabs/edge        → Edge-to-edge demo page
/                 → Redirect to /tabs/controls
```

## Phase 3 — Edge-to-edge demo page

The edge-to-edge page should:

- Have content that extends behind the status bar (no standard `<ion-header>`)
- Use a colored background area at the top that is visible through the transparent status bar
- Include the appearance radio buttons (system/light/dark) so the user can toggle dark mode and see the status bar text color adapt
- On entering the tab: save the current `syncStatusBar` pref and force `textOnly`
- On leaving the tab: restore the previous `syncStatusBar` pref

## Phase 4 — Verification

1. Build the demo: `pnpm build` in the demo directory
2. Run on Android — verify:
   - Controls tab looks normal with Ionic's built-in safe area handling
   - Edge-to-edge tab shows content behind the status bar
   - Status bar text/icon color changes correctly when toggling dark mode on the edge-to-edge tab
   - Switching back to Controls tab restores the previous syncStatusBar setting
3. Run on iOS — verify:
   - Both tabs render correctly
   - Status bar text style adapts to dark/light mode on both tabs
