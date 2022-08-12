import { registerPlugin } from '@capacitor/core'
import type { DarkModePlugin } from './definitions'
import info from './info.json'

console.log(`loaded ${info.name} v${info.version}`)

const proxy = registerPlugin<DarkModePlugin>('DarkModeNative', {
  web: async () =>
    import('./web').then((module) => new module.DarkModeWeb(proxy)),
  ios: async () =>
    import('./native').then((module) => new module.DarkModeNative(proxy)),
  android: async () =>
    import('./native').then((module) => new module.DarkModeNative(proxy))
})

export * from './definitions'
export { proxy as DarkMode }
