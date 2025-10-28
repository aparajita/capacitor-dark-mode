// / <reference types="@capacitor/splash-screen" />
// / <reference types="@capacitor/status-bar" />

import type { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.aparajita.capacitor.darkmodedemo',
  appName: 'Dark Mode',
  loggingBehavior: 'debug',
  server: {
    androidScheme: 'http',
  },
  webDir: 'dist',
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
