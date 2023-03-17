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
  StatusBarStyleGetter
} from './definitions'
import { DarkModeAppearance } from './definitions'
import { isDarkColor, isValidHexColor, normalizeHexColor } from './utils'

const kDefaultBackgroundVariable = '--background'

export default abstract class DarkModeBase
  extends WebPlugin
  implements DarkModePlugin
{
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
    callback: DarkModeListener
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
    disableTransitions
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
    listener: DarkModeListener
  ): Promise<DarkModeListenerHandle> {
    this.appearanceListeners.add(listener)
    return Promise.resolve({
      remove: () => this.appearanceListeners.delete(listener)
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
    let darkMode: boolean

    if (data) {
      // If we have data, that means the system appearance changed.
      // Use it to determine the new dark mode.
      darkMode = data.dark
    }

    if (this.getter) {
      // The user changed the appearance and triggered an update,
      // so we need to get the new appearance.
      const getterResult = await this.getter()

      if (getterResult) {
        this.appearance = getterResult
      }
    }

    // If the appearance changed and is system, get the current dark mode.
    if (this.appearance === DarkModeAppearance.system) {
      darkMode = (await this.isDarkMode()).dark
    } else {
      // Otherwise, use the new appearance to determine the dark mode.
      // Note at this point, this.isDark is the previous dark mode.
      darkMode = this.appearance === DarkModeAppearance.dark
    }

    this.disableTransitions()
    document.body.classList[darkMode ? 'add' : 'remove'](this.darkModeClass)
    this.enableTransitions()

    if (Capacitor.isNativePlatform()) {
      await this.handleStatusBar(darkMode)
    }

    if (data) {
      if (this.setter) {
        await this.setter(this.appearance)
      }

      for (const listener of this.appearanceListeners) {
        listener(data)
      }
    }

    return Promise.resolve(this.appearance)
  }

  private getBackgroundColor(): string {
    // Try to retrieve the background color variable value from <ion-content>
    const content = document.querySelector('ion-content')

    if (content) {
      const color = getComputedStyle(content)
        .getPropertyValue(this.statusBarBackgroundVariable)
        .trim()

      if (isValidHexColor(color)) {
        return normalizeHexColor(color)
      } else {
        console.warn(
          `Invalid hex color '${color}' for ${this.statusBarBackgroundVariable}`
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
    let statusBarStyle = darkMode ? Style.Dark : Style.Light
    let color = ''

    if (this.syncStatusBar && Capacitor.getPlatform() === 'android') {
      setStatusBarStyle = true

      if (this.syncStatusBar !== 'textOnly') {
        color = this.getBackgroundColor()

        if (color) {
          if (this.statusBarStyleGetter) {
            const style = await this.statusBarStyleGetter(statusBarStyle, color)

            if (style) {
              statusBarStyle = style
            }
          } else {
            statusBarStyle = isDarkColor(color) ? Style.Dark : Style.Light
          }
        } else {
          // We aren't changing the status bar color, no need to set the style
          setStatusBarStyle = false
        }
      }
    }

    const actions: Array<Promise<void>> = []

    if (color) {
      actions.push(StatusBar.setBackgroundColor({ color }))
    }

    if (setStatusBarStyle) {
      actions.push(StatusBar.setStyle({ style: statusBarStyle }))
    }

    await Promise.all(actions)
  }
}
