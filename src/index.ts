import { registerPlugin } from '@capacitor/core'
import type { DarkModePlugin } from './definitions'

const proxy = registerPlugin<DarkModePlugin>('DarkModeNative', {
  web: async () => import('./web').then((module) => new module.DarkModeWeb()),
  ios: async () =>
    import('./native').then((module) => new module.DarkModeNative(proxy)),
  android: async () =>
    import('./native').then((module) => new module.DarkModeNative(proxy)),
})

export * from './definitions'
export * from './utils'
export { proxy as DarkMode }
