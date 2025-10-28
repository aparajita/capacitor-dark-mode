import { DarkModeBase } from './base'
import type { IsDarkModeResult } from './definitions'

/* eslint-disable @typescript-eslint/require-await */
export class DarkModeWeb extends DarkModeBase {
  private mediaQuery?: MediaQueryList

  protected async registerDarkModeListener(): Promise<void> {
    // On the web, we can use a MediaQueryList listener.
    const onChange = async (event: MediaQueryListEvent): Promise<void> => {
      try {
        await this.update({ dark: event.matches })
      } catch (error) {
        console.error(error)
      }
    }

    const query = this.getDarkModeQuery()

    // Some browsers do no support addEventListener
    if (query.addEventListener) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      query.addEventListener('change', onChange)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      query.addListener(onChange)
    }

    this.registeredListener = true
  }

  async isDarkMode(): Promise<IsDarkModeResult> {
    const query = this.getDarkModeQuery()
    return { dark: query ? query.matches : false }
  }

  private getDarkModeQuery(): MediaQueryList {
    this.mediaQuery ??= window.matchMedia('(prefers-color-scheme: dark)')
    return this.mediaQuery
  }
}
/* eslint-enable @typescript-eslint/require-await */
