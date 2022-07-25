import { native, PluginReturnType } from '@aparajita/capacitor-native-decorator'
import { Capacitor, WebPlugin } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import type {
  DarkModeGetter,
  DarkModeListener,
  DarkModeListenerData,
  DarkModeListenerHandle,
  DarkModeOptions,
  DarkModePlugin
} from './definitions'
import { DarkModeAppearance, kPluginName } from './definitions'

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

/**
 * This class is the actual native plugin that acts as a bridge
 * between the native and web implementations.
 */
export default class DarkMode extends WebPlugin implements DarkModePlugin {
  private appearance?: DarkModeAppearance
  private darkModeClass = 'dark'
  private registeredListener = false
  private mediaQuery?: MediaQueryList
  private readonly appearanceListeners = new Set<DarkModeListener>()
  private getter?: DarkModeGetter
  private syncStatusBar = true

  // Required by @native decorator
  getRegisteredPluginName(): string {
    return kPluginName
  }

  private async registerDarkModeListener(): Promise<void> {
    /*
      On the web, we can use a MediaQueryList listener. On native platforms
      we use two listeners:

      - A listener for dynamic appearance changes within the app.
      - A resume listener to check if the appearance has changed since the app was suspended.
    */

    if (Capacitor.isNativePlatform()) {
      const onChange = (data: DarkModeListenerData): void => {
        this.update(data).catch(console.error)
      }

      await this.setNativeDarkModeListener(onChange)
    } else {
      const onChange = (ev: MediaQueryListEvent): void => {
        this.update({ dark: ev.matches }).catch(console.error)
      }

      const query = this.getDarkModeQuery()

      // Some browsers do no support addEventListener
      if (query.addEventListener) {
        query.addEventListener('change', onChange)
      } else {
        query.addListener(onChange)
      }
    }

    await this.update()
    this.registeredListener = true
  }

  async configure({
    cssClass,
    getter,
    syncStatusBar
  }: DarkModeOptions): Promise<void> {
    if (cssClass) {
      // Remove the old class if it exists
      document.documentElement.classList.remove(this.darkModeClass)
      this.darkModeClass = cssClass
    }

    if (typeof getter !== 'undefined') {
      this.getter = getter
    }

    if (typeof syncStatusBar === 'boolean') {
      this.syncStatusBar = syncStatusBar
    }

    if (!this.registeredListener) {
      await this.registerDarkModeListener()
    }

    await this.update()
  }

  async addAppearanceListener(
    listener: DarkModeListener
  ): Promise<DarkModeListenerHandle> {
    this.appearanceListeners.add(listener)
    return Promise.resolve({
      remove: () => this.appearanceListeners.delete(listener)
    })
  }

  @native()
  async isDarkMode(): Promise<boolean> {
    const query = this.getDarkModeQuery()
    return Promise.resolve(query ? query.matches : false)
  }

  // web only
  private getDarkModeQuery(): MediaQueryList {
    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    }

    return this.mediaQuery
  }

  @native(PluginReturnType.callback)
  private async setNativeDarkModeListener(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callback: DarkModeListener
  ): Promise<string> {
    // This code is never used, but we have to satisfy TS
    return Promise.resolve('')
  }

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
      const systemIsDark = data ? data.dark : await this.isDarkMode()
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
        const bodyBackgroundColor = getComputedStyle(content)
          .getPropertyValue('--background')
          .trim()

        if (bodyBackgroundColor) {
          await StatusBar.setBackgroundColor({
            color: normalizeHexColor(bodyBackgroundColor)
          })

          setStatusBarStyle = true
        }
      }
    }

    if (setStatusBarStyle) {
      await StatusBar.setStyle({ style: kAppearanceToStyleMap[appearance] })
    }
  }
}
