import DarkModeBase from './base'
import type { IsDarkModeResult } from './definitions'

// eslint-disable-next-line import/prefer-default-export
export class DarkModeWeb extends DarkModeBase {
  private mediaQuery?: MediaQueryList

  protected async registerDarkModeListener(): Promise<void> {
    // On the web, we can use a MediaQueryList listener.
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

    this.registeredListener = true
    return Promise.resolve()
  }

  async isDarkMode(): Promise<IsDarkModeResult> {
    const query = this.getDarkModeQuery()
    return Promise.resolve({ dark: query ? query.matches : false })
  }

  private getDarkModeQuery(): MediaQueryList {
    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    }

    return this.mediaQuery
  }
}
