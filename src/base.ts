import { Capacitor, WebPlugin } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import type {
  DarkModeGetter,
  DarkModeListener,
  DarkModeListenerData,
  DarkModeListenerHandle,
  DarkModeOptions,
  DarkModePlugin,
  DarkModeSyncStatusBar,
  IsDarkModeResult
} from './definitions'
import { DarkModeAppearance } from './definitions'

const kAppearanceToStyleMap = {
  [DarkModeAppearance.dark]: Style.Dark,
  [DarkModeAppearance.light]: Style.Light,
  [DarkModeAppearance.system]: Style.Default
} as const

// Normalize a hex color to #RRGGBB format.
function normalizeHexColor(hex: string): string {
  /* eslint-disable @typescript-eslint/no-magic-numbers */
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  /* eslint-enable */

  return hex
}

export default abstract class DarkModeBase
  extends WebPlugin
  implements DarkModePlugin
{
  private appearance?: DarkModeAppearance
  private darkModeClass = 'dark'
  private statusBarHexColorCssVariable = ''
  protected registeredListener = false
  private readonly appearanceListeners = new Set<DarkModeListener>()
  private getter?: DarkModeGetter
  private syncStatusBar: DarkModeSyncStatusBar = true

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bindToProxy(proxy: DarkModePlugin): void {
    // no-op except in native
  }

  protected abstract registerDarkModeListener(): Promise<void>

  // @native(callback)
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // eslint-disable-next-line @typescript-eslint/require-await
  async setNativeDarkModeListener(
    options: Record<string, unknown>,
    callback: DarkModeListener
  ): Promise<string> {
    throw this.unimplemented('setNativeDarkModeListener is native only')
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  async init({
    cssClass,
    getter,
    syncStatusBar,
    statusBarHexColorCssVariable
  }: DarkModeOptions = {}): Promise<void> {
    if (cssClass) {
      // Remove the old class if it exists
      document.documentElement.classList.remove(this.darkModeClass)
      this.darkModeClass = cssClass
    }

    if (statusBarHexColorCssVariable) {
      this.statusBarHexColorCssVariable = statusBarHexColorCssVariable
    }

    if (typeof getter !== 'undefined') {
      this.getter = getter
    }

    if (typeof syncStatusBar === 'boolean' || syncStatusBar === 'textOnly') {
      this.syncStatusBar = syncStatusBar
    }

    if (!this.registeredListener) {
      await this.registerDarkModeListener()
    }

    await this.update()
  }

  async configure(options?: DarkModeOptions): Promise<void> {
    console.warn(
      'DarkMode.configure is deprecated. Please use DarkMode.init instead.'
    )
    await this.init(options)
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

  /**
   * Get the stored appearance. If there is no stored appearance or the appearance
   * is DarkModeAppearance.system, then we need to check the system appearance.
   * Once we determine the appearance, set the dark mode class accordingly.
   */
  async update(data?: DarkModeListenerData): Promise<DarkModeAppearance> {
    let storedAppearance = DarkModeAppearance.system

    if (this.getter) {
      storedAppearance = (await this.getter()) ?? DarkModeAppearance.system
    }

    let appearance = storedAppearance

    if (storedAppearance === DarkModeAppearance.system) {
      let systemIsDark: boolean

      if (data) {
        systemIsDark = data.dark
      } else {
        const { dark } = await this.isDarkMode()
        systemIsDark = dark
      }

      appearance = systemIsDark
        ? DarkModeAppearance.dark
        : DarkModeAppearance.light
    }

    if (appearance !== this.appearance) {
      this.appearance = appearance
      document.body.classList[
        appearance === DarkModeAppearance.dark ? 'add' : 'remove'
      ](this.darkModeClass)
    }

    if (Capacitor.isNativePlatform()) {
      await this.handleStatusBar(appearance)
    }

    if (data) {
      this.appearanceListeners.forEach((listener) => {
        listener(data)
      })
    }

    return Promise.resolve(appearance)
  }

  private async handleStatusBar(appearance: DarkModeAppearance): Promise<void> {
    // On iOS we always need to update the status bar appearance to match light/dark mode.
    // On Android we only do so if the user has explicitly requested it.
    let setStatusBarStyle = Capacitor.getPlatform() === 'ios'

    if (this.syncStatusBar && Capacitor.getPlatform() === 'android') {
      const content = document.querySelector('ion-content')

      if (content) {
        const statusBarBackground = getComputedStyle(content)
          .getPropertyValue(this.statusBarHexColorCssVariable)
          .trim()

        const contentBackground = getComputedStyle(content)
          .getPropertyValue('--background')
          .trim()

        const bodyBackgroundColor = statusBarBackground || contentBackground

        if (bodyBackgroundColor) {
          if (this.syncStatusBar !== 'textOnly') {
            await StatusBar.setBackgroundColor({
              color: normalizeHexColor(bodyBackgroundColor)
            })
          }

          setStatusBarStyle = true
        }
      }
    }

    if (setStatusBarStyle) {
      await StatusBar.setStyle({ style: kAppearanceToStyleMap[appearance] })
    }
  }
}
