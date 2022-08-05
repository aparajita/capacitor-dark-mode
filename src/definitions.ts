import type { DecoratedNativePlugin } from '@aparajita/capacitor-native-decorator'

// The registered name of the plugin.
export const kPluginName = 'DarkMode'

/**
 * The possible appearances an app can have.
 * `dark` and `light` are set by the user,
 * `system` follows the system's dark mode.
 */
export enum DarkModeAppearance {
  dark = 'dark',
  light = 'light',
  system = 'system'
}

/**
 * Your getter function should return (directly or as a Promise) either:
 *
 * - A DarkModeAppearance to signify that is the appearance you want
 *
 * - null or undefined to signify the system appearance should be used
 */
export type DarkModeGetterResult = DarkModeAppearance | null | undefined

/**
 * The type of your getter function.
 */
export type DarkModeGetter = () =>
  | DarkModeGetterResult
  | Promise<DarkModeGetterResult>

/**
 * When you call `addAppearanceListener`, you get back a handle
 * that you can use to remove the listener. See [addAppearanceListener](#addappearancelistener)
 * for more details.
 */
export interface DarkModeListenerHandle {
  remove: () => void
}

/**
 * Your appearance listener callback will receive this data,
 * indicating whether the system is in dark mode or not.
 */
export interface DarkModeListenerData {
  dark: boolean
}

/**
 * The type of your appearance listener callback.
 */
export type DarkModeListener = (data: DarkModeListenerData) => void

/**
 * The options passed to `configure`.
 */
export interface DarkModeOptions {
  /**
   * The CSS class name to use to toggle dark mode.
   */
  cssClass?: string

  /**
   * If set, this function will be called to retrieve the current
   * dark mode state instead of `isDarkMode`. For example, you
   * might want to let the user set dark/light mode manually and
   * store that preference somewhere. If the function wants to
   * signal that no value can be retrieved, it should return null
   * or undefined, in which case `isDarkMode` will be used.
   *
   * If you are not providing any storage of the dark mode state,
   * don't pass this in the options.
   */
  getter?: DarkModeGetter

  /**
   * If true, on Android the status bar background and content
   * will be synced with the current `DarkModeAppearance`.
   *
   * On iOS the status bar background is synced with dark mode by the system.
   */
  syncStatusBar?: boolean
}

export interface DarkModePlugin extends DecoratedNativePlugin {
  /**
   * Initializes the plugin and optionally configures the dark mode
   * class and getter used to retrieve the current dark mode state.
   * This should be done BEFORE the app is mounted to avoid a flash
   * of the wrong mode.
   */
  init: (options?: DarkModeOptions) => Promise<void>

  /**
   * DEPRECATED: Use `init` instead.
   */
  configure: (options?: DarkModeOptions) => Promise<void>

  /**
   * web: Returns the result of the 'prefers-color-scheme: dark' media query.
   * native: Returns whether the system is currently in dark mode.
   */
  isDarkMode: () => Promise<boolean>

  /**
   * Adds a listener that will be called whenever the system appearance changes,
   * whether or not the system appearance matches your current appearance.
   * The listener is called AFTER the dark mode class and status bar
   * are updated by the plugin. The listener will be called
   * with `DarkModeListenerData` indicating if the current system appearance is dark.
   *
   * The returned handle contains a `remove` function which you should be sure
   * to call when the listener is no longer needed, for example when a component
   * is unmounted (which happens a lot with HMR). Otherwise there will be a memory leak
   * and multiple listeners executing the same function.
   */
  addAppearanceListener: (
    listener: DarkModeListener
  ) => Promise<DarkModeListenerHandle>

  /**
   * Adds or removes the dark mode class on the html element
   * depending on the dark mode state. You do NOT need to call
   * this when the system appearance changes.
   *
   * If you are manually setting the appearance, you should
   * call this method after the value returned by
   * the configured getter would change.
   *
   * Returns the current dark mode state.
   */
  update: (data?: DarkModeListenerData) => Promise<DarkModeAppearance>
}
