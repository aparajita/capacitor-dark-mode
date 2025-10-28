import { registerPlugin } from '@capacitor/core'

import type { DarkModePlugin } from './definitions'

const proxy = registerPlugin<DarkModePlugin>('DarkModeNative', {
  web: async () => {
    const module = await import('./web')
    return new module.DarkModeWeb()
  },
  ios: async () => {
    const module = await import('./native')
    return new module.DarkModeNative(proxy)
  },
  android: async () => {
    const module = await import('./native')
    return new module.DarkModeNative(proxy)
  },
})

export * from './definitions'
export * from './utils'
export { proxy as DarkMode }
