import { Capacitor, registerPlugin } from '@capacitor/core'
import type DarkModeBase from './base'
import type { DarkModePlugin } from './definitions'
import info from './info.json'
import { DarkModeNative } from './native'
import { DarkModeWeb } from './web'

console.log(`loaded ${info.name} v${info.version}`)
let plugin: DarkModeBase | undefined

// Because we are using Javascript code in conjunction with native code,
// we can't use async imports, because we have to ensure the Javascript
// instance is created before the native instance is created.
if (Capacitor.isNativePlatform()) {
  plugin = new DarkModeNative()
} else {
  plugin = new DarkModeWeb()
}

const proxy = registerPlugin<DarkModePlugin>('DarkModeNative', {
  web: plugin,
  ios: plugin,
  android: plugin
})

plugin.bindToProxy(proxy)

export * from './definitions'
export { proxy as DarkMode }
