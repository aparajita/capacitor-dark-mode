<script setup lang="ts">
import DarkModeDemo from '@/components/dark-mode-demo.vue'
import { version } from '@aparajita/capacitor-dark-mode/package.json'
import { Capacitor } from '@capacitor/core'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'

const platform = Capacitor.getPlatform()
let buildVariant: string | null = null

if (platform !== 'android') {
  buildVariant = platform === 'ios' ? BUILD_VARIANT : 'Web'
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
      <DarkModeDemo />

      <div class="py-4 text-sm text-center">
        Version {{ version
        }}<template v-if="buildVariant"> ({{ buildVariant }})</template>
      </div>
    </ion-content>
  </ion-page>
</template>
