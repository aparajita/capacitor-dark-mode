<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'

import DarkModeDemo from '@/components/dark-mode-demo.vue'
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
    </ion-content>
  </ion-page>
</template>
