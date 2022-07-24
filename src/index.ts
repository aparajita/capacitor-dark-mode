import { registerPlugin } from '@capacitor/core'
import type { DarkModePlugin } from './definitions'
import { kPluginName } from './definitions'
import * as package from './package.json'
import DarkMode from './web'

console.log(`loaded ${package.name}`)

// Because we are using @aparajita/capacitor-native-decorator,
// we have one version of the TS code to rule them all, and there
// is no need to lazy load. 😁
const plugin = new DarkMode()

const darkMode = registerPlugin<DarkModePlugin>(kPluginName, {
  web: plugin,
  ios: plugin,
  android: plugin
})

// eslint-disable-next-line import/prefer-default-export
export { darkMode as DarkMode }
export * from './definitions'
