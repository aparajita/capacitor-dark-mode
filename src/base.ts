/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Capacitor, WebPlugin } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import type {
  DarkModeGetter,
  DarkModeListener,
  DarkModeListenerData,
  DarkModeListenerHandle,
  DarkModeOptions,
  DarkModePlugin,
  DarkModeSetter,
  DarkModeSyncStatusBar,
  IsDarkModeResult,
  StatusBarStyleGetter,
} from './definitions'
import { DarkModeAppearance } from './definitions'
import { isDarkColor, isValidHexColor, normalizeHexColor } from './utils'

const kDefaultBackgroundVariable = '--background'

// eslint-disable-next-line import/prefer-default-export
export abstract class DarkModeBase extends WebPlugin implements DarkModePlugin {
  private appearance = DarkModeAppearance.system
  private darkModeClass = 'dark'
  protected registeredListener = false
  private readonly appearanceListeners = new Set<DarkModeListener>()
  private getter?: DarkModeGetter
  private setter?: DarkModeSetter
  private statusBarStyleGetter?: StatusBarStyleGetter
  private syncStatusBar: DarkModeSyncStatusBar = true
  private statusBarBackgroundVariable = kDefaultBackgroundVariable
  private handleTransitions = true
  private disableTransitionsStyle?: HTMLStyleElement

  protected abstract registerDarkModeListener(): Promise<void>

  // @native(callback)
  /* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/require-await */

  // noinspection JSUnusedLocalSymbols
  async setNativeDarkModeListener(
    options: Record<string, unknown>,
    callback: DarkModeListener,
  ): Promise<string> {
    throw this.unimplemented('setNativeDarkModeListener is native only')
  }

  /* eslint-enable @typescript-eslint/no-unused-vars,@typescript-eslint/require-await */

  async init({
    cssClass,
    statusBarBackgroundVariable,
    getter,
    setter,
    syncStatusBar,
    statusBarStyleGetter,
    disableTransitions,
  }: DarkModeOptions = {}): Promise<void> {
    if (cssClass) {
      // Remove the old class if it exists
      document.documentElement.classList.remove(this.darkModeClass)
      this.darkModeClass = cssClass
    }

    this.statusBarBackgroundVariable =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      statusBarBackgroundVariable || kDefaultBackgroundVariable

    if (typeof getter === 'function') {
      this.getter = getter
    }

    if (typeof setter === 'function') {
      this.setter = setter
    }

    if (typeof syncStatusBar === 'boolean' || syncStatusBar === 'textOnly') {
      this.syncStatusBar = syncStatusBar
    }

    if (typeof statusBarStyleGetter === 'function') {
      this.statusBarStyleGetter = statusBarStyleGetter
    }

    if (typeof disableTransitions === 'boolean') {
      this.handleTransitions = disableTransitions
    }

    if (!this.registeredListener) {
      await this.registerDarkModeListener()
    }

    await this.update()
  }

  async configure(options?: DarkModeOptions): Promise<void> {
    return this.init(options)
  }

  async addAppearanceListener(
    listener: DarkModeListener,
  ): Promise<DarkModeListenerHandle> {
    this.appearanceListeners.add(listener)
    return Promise.resolve({
      remove: () => this.appearanceListeners.delete(listener),
    })
  }

  // @native(promise)
  abstract isDarkMode(): Promise<IsDarkModeResult>

  private disableTransitions(): void {
    if (!this.handleTransitions) {
      return
    }

    if (!this.disableTransitionsStyle) {
      this.disableTransitionsStyle = document.createElement('style')
      this.disableTransitionsStyle.innerText = `* { transition: none !important; --transition: none !important; } ion-content::part(background) { transition: none !important; }`
    }

    document.head.appendChild(this.disableTransitionsStyle)
  }

  private enableTransitions(): void {
    if (!this.handleTransitions) {
      return
    }

    if (this.disableTransitionsStyle) {
      const style = this.disableTransitionsStyle
      window.setTimeout(() => {
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }, 100)
    }
  }

  async update(data?: DarkModeListenerData): Promise<DarkModeAppearance> {
    // Assume the appearance and dark mode did not change
    const oldDarkMode = document.body.classList.contains(this.darkModeClass)
    let darkMode: boolean
    let appearance = this.appearance

    // The appearance changed, either by the system or by the user.
    // See if there is a stored appearance.
    if (this.getter) {
      const getterResult = await this.getter()

      if (getterResult) {
        appearance = getterResult
      }
    }

    // If the appearance is system, use the current dark mode.
    if (appearance === DarkModeAppearance.system) {
      darkMode = data ? data.dark : (await this.isDarkMode()).dark
    } else {
      // Otherwise, use the appearance to determine the dark mode.
      darkMode = appearance === DarkModeAppearance.dark
    }

    // If the dark mode changed, update the body class and status bar.
    if (darkMode !== oldDarkMode) {
      this.disableTransitions()
      document.body.classList[darkMode ? 'add' : 'remove'](this.darkModeClass)
      this.enableTransitions()
    }

    // Always update the status bar to match the dark mode. This ensures
    // the status bar stays in sync when init() is called.
    if (Capacitor.isNativePlatform()) {
      await this.handleStatusBar(darkMode)
    }

    // If the appearance changed, update the stored appearance.
    if (this.setter && this.appearance !== appearance) {
      await this.setter(appearance)
    }

    // Notify listeners of the changes by the system.
    if (data) {
      for (const listener of this.appearanceListeners) {
        listener(data)
      }
    }

    this.appearance = appearance
    return Promise.resolve(this.appearance)
  }

  private getBackgroundColor(): string {
    // Try to retrieve the background color variable value from <ion-content>.
    const content = document.querySelector('ion-content')

    if (content) {
      const color = getComputedStyle(content)
        .getPropertyValue(this.statusBarBackgroundVariable)
        .trim()

      if (isValidHexColor(color)) {
        return normalizeHexColor(color)
      } else {
        console.warn(
          `Invalid hex color '${color}' for ${this.statusBarBackgroundVariable}`,
        )
      }
    }

    return ''
  }

  private async handleStatusBar(darkMode: boolean): Promise<void> {
    // On iOS we always need to update the status bar appearance
    // to match light/dark mode. On Android we only do so if the user
    // has explicitly requested it.
    let setStatusBarStyle = Capacitor.getPlatform() === 'ios'

    // By default the status bar style is the same as the appearance.
    let statusBarStyle = darkMode ? Style.Dark : Style.Light

    // By default we will not change the background color of the status bar.
    let color = ''

    if (this.syncStatusBar && Capacitor.getPlatform() === 'android') {
      // Assume the style will change when the appearance changes.
      setStatusBarStyle = true

      // If the sync mode is not 'textOnly', try to get the background color from <ion-content>.
      if (this.syncStatusBar !== 'textOnly') {
        color = this.getBackgroundColor()
      }

      if (this.statusBarStyleGetter) {
        // If there is a style getter, use it to determine the status bar style.
        const style = await this.statusBarStyleGetter(statusBarStyle, color)

        if (style) {
          statusBarStyle = style
        }
      } else if (color) {
        // If there is no getter and we were able to get the <ion-content> color,
        // set the status bar style based on the color.
        statusBarStyle = isDarkColor(color) ? Style.Dark : Style.Light
      } else {
        // If the background color did not change, no need to update the status bar.
        setStatusBarStyle = false
      }
    }

    const actions: Array<Promise<void>> = []

    if (color) {
      actions.push(StatusBar.setBackgroundColor({ color }))
    }

    if (setStatusBarStyle) {
      actions.push(StatusBar.setStyle({ style: statusBarStyle }))
    }

    if (actions.length) {
      await Promise.all(actions)
    }
  }
}
