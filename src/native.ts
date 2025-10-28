import { DarkModeBase } from './base'
import type {
  DarkModeListenerData,
  DarkModePlugin,
  IsDarkModeResult,
} from './definitions'

export class DarkModeNative extends DarkModeBase {
  constructor(capProxy: DarkModePlugin) {
    super()
    this.setNativeDarkModeListener = capProxy.setNativeDarkModeListener
    this.isDarkMode = capProxy.isDarkMode
  }

  protected async registerDarkModeListener(): Promise<void> {
    /*
      On native platforms we use two listeners:

      - A listener for dynamic appearance changes within the app.
      - A resume listener to check if the appearance has changed since the app was suspended.
    */
    const onChange = async (data: DarkModeListenerData): Promise<void> => {
      try {
        await this.update(data)
      } catch (error) {
        console.error(error)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await this.setNativeDarkModeListener({}, onChange)
    this.registeredListener = true
  }

  // @native(promise)
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this,@typescript-eslint/require-await
  async isDarkMode(): Promise<IsDarkModeResult> {
    // Never called, but we have to satisfy TS
    return { dark: false }
  }
}
