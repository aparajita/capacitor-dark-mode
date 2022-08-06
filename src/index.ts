import { registerPlugin } from '@capacitor/core'
import type { DarkModePlugin } from './definitions'
import { kPluginName } from './definitions'
import info from './info.json'
import DarkMode from './web'

console.log(`loaded ${info.name} v${info.version}`)

// Because we are using @aparajita/capacitor-native-decorator,
// we have one version of the TS code to rule them all, and there
// is no need to lazy load. 😁
const plugin = new DarkMode()

registerPlugin<DarkModePlugin>(kPluginName, {
  web: plugin,
  ios: plugin,
  android: plugin
})

export { plugin as DarkMode }
export * from './definitions'
