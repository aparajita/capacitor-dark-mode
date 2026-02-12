// / <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.aparajita.capacitor.darkmodedemo',
  appName: 'Dark Mode',
  loggingBehavior: 'debug',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None,
    },
    SplashScreen: {
      launchAutoHide: false,
    },
  },
}

export default config
