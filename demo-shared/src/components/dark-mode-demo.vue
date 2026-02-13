<script setup lang="ts">
import type {
  DarkModeListenerHandle,
  DarkModeSyncStatusBar,
} from '@aparajita/capacitor-dark-mode'
import { DarkMode, DarkModeAppearance } from '@aparajita/capacitor-dark-mode'
import { version } from '@aparajita/capacitor-dark-mode/package.json'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import {
  alertController,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { onMounted, onUnmounted, ref } from 'vue'

import {
  getAppearancePref,
  getSyncStatusBarPref,
  setAppearancePref,
  setSyncStatusBarPref,
} from '@/prefs'

const platform = Capacitor.getPlatform()
const isAndroid = platform === 'android'
const isIOS = platform === 'ios'
const buildVariant = BUILD_VARIANT

const syncStatusBar = ref<DarkModeSyncStatusBar>(getSyncStatusBarPref())
const appearance = ref(DarkModeAppearance.system)
let appearanceListenerHandle: DarkModeListenerHandle | null = null

async function showAlert(message: string): Promise<void> {
  const alert = await alertController.create({
    header: `Appearance change:`,
    subHeader: '',
    message,
    buttons: ['OK'],
  })
  await alert.present()
}

onMounted(async () => {
  appearanceListenerHandle = await DarkMode.addAppearanceListener(
    ({ dark }) => {
      showAlert(`System dark mode is ${dark ? 'on' : 'off'}.`).catch(
        console.error,
      )
    },
  )

  const storedAppearance = getAppearancePref()

  if (storedAppearance) {
    appearance.value = storedAppearance
  }

  await DarkMode.update()
  await SplashScreen.hide()
})

onUnmounted(() => {
  appearanceListenerHandle?.remove()
})

async function onSyncStatusBarChange(): Promise<void> {
  setSyncStatusBarPref(syncStatusBar.value)
  await DarkMode.configure({ syncStatusBar: syncStatusBar.value })
}

async function updateAppearance(): Promise<void> {
  setAppearancePref(appearance.value)
  await DarkMode.update()
}
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dark mode demo</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-radio-group
          v-model="appearance"
          @ion-change="updateAppearance"
        >
          <ion-list-header>
            <ion-label>Appearance</ion-label>
          </ion-list-header>

          <ion-item lines="full">
            <ion-radio
              slot="start"
              label-placement="end"
              justify="start"
              :value="DarkModeAppearance.system"
            >
              System
            </ion-radio>
          </ion-item>

          <ion-item lines="full">
            <ion-radio
              slot="start"
              label-placement="end"
              justify="start"
              :value="DarkModeAppearance.light"
            >
              Light
            </ion-radio>
          </ion-item>

          <ion-item lines="full">
            <ion-radio
              slot="start"
              label-placement="end"
              justify="start"
              :value="DarkModeAppearance.dark"
            >
              Dark
            </ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>

      <ion-list
        v-if="isAndroid"
        class="ion-margin-top"
      >
        <ion-list-header>
          <ion-label>Status bar sync</ion-label>
        </ion-list-header>

        <ion-radio-group
          v-model="syncStatusBar"
          @ion-change="onSyncStatusBarChange"
        >
          <ion-item lines="full">
            <ion-radio
              :value="false"
              label-placement="end"
              justify="start"
            >
              Off
            </ion-radio>
          </ion-item>

          <ion-item lines="full">
            <ion-radio
              :value="true"
              label-placement="end"
              justify="start"
            >
              Everything
            </ion-radio>
          </ion-item>

          <ion-item lines="full">
            <ion-radio
              value="textOnly"
              label-placement="end"
              justify="start"
            >
              Text only
            </ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>

      <div class="py-4 text-sm text-center">
        Version {{ version
        }}<template v-if="isIOS"> ({{ buildVariant }})</template>
      </div>
    </ion-content>
  </ion-page>
</template>
