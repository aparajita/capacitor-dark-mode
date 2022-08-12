import DarkModeBase from './base'
import type { DarkModeListenerData, IsDarkModeResult } from './definitions'

// eslint-disable-next-line import/prefer-default-export
export class DarkModeNative extends DarkModeBase {
  protected async registerDarkModeListener(): Promise<void> {
    /*
      On native platforms we use two listeners:

      - A listener for dynamic appearance changes within the app.
      - A resume listener to check if the appearance has changed since the app was suspended.
    */
    const onChange = (data: DarkModeListenerData): void => {
      this.update(data).catch(console.error)
    }

    await this.native.setNativeDarkModeListener({}, onChange)
    this.registeredListener = true
  }

  // @native(promise)
  async isDarkMode(): Promise<IsDarkModeResult> {
    // Never called, but we have to satisfy TS
    return Promise.resolve({ dark: false })
  }
}
