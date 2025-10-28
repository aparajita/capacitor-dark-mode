import { DarkMode } from '@aparajita/capacitor-dark-mode'
import { IonicVue, isPlatform } from '@ionic/vue'

/* eslint-disable import-x/order */
import { getAppearancePref, getSyncStatusBarPref } from '@/prefs'

// Core CSS required for Ionic components to work properly
// oxlint-disable no-unassigned-import
import '@ionic/vue/css/core.css'

// Basic CSS for apps built with Ionic
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/padding.css'

// Dark mode support
import '@ionic/vue/css/palettes/dark.class.css'
import { createApp } from 'vue'

import App from './app.vue'
import router from './router'

import './theme/variables.css'

/* eslint-enable import-x/order */
// oxlint-enable no-unassigned-import

const config: Record<string, unknown> = {}

if (!isPlatform('android')) {
  config.mode = 'ios'
}

const app = createApp(App).use(IonicVue, config).use(router)

;(async (): Promise<void> => {
  try {
    await router.isReady()
    await DarkMode.init({
      getter: getAppearancePref,
      syncStatusBar: getSyncStatusBarPref(),
    })
    app.mount('#app')
  } catch (error) {
    console.error(error)
  }
})()
