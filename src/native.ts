import DarkModeBase from './base'
import type {
  DarkModeListenerData,
  DarkModePlugin,
  IsDarkModeResult
} from './definitions'

// eslint-disable-next-line import/prefer-default-export
export class DarkModeNative extends DarkModeBase {
  override bindToProxy(proxy: DarkModePlugin): void {
    this.setNativeDarkModeListener = proxy.setNativeDarkModeListener
    this.isDarkMode = proxy.isDarkMode
  }

  protected async registerDarkModeListener(): Promise<void> {
    /*
      On native platforms we use two listeners:

      - A listener for dynamic appearance changes within the app.
      - A resume listener to check if the appearance has changed since the app was suspended.
    */
    const onChange = (data: DarkModeListenerData): void => {
      this.update(data).catch(console.error)
    }

    await this.setNativeDarkModeListener({}, onChange)
    this.registeredListener = true
  }

  // @native(promise)
  async isDarkMode(): Promise<IsDarkModeResult> {
    // Never called, but we have to satisfy TS
    return Promise.resolve({ dark: false })
  }
}
