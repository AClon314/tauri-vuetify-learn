<template>
  <v-app>
    <v-app-bar
      color="primary"
      density="compact"
      :height="isPC ? 50 : undefined"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-app-bar-title class="min-content" >Photos</v-app-bar-title>
      <v-spacer class="fill-height" data-tauri-drag-region></v-spacer>

      <v-btn icon="mdi-dots-vertical"></v-btn>

      <v-btn
        icon="mdi-minus"
        variant="text"
        @click="() => getCurrent().minimize()"
        v-if="isPC"
      ></v-btn>
      <v-btn
        class="ms-2"
        icon="mdi-checkbox-blank-outline"
        variant="text"
        @click="() => getCurrent().toggleMaximize()"
        v-if="isPC"
      ></v-btn>
      <v-btn
        class="ms-2"
        icon="mdi-close"
        variant="text"
        @click="() => getCurrent().close()"
        v-if="isPC"
      ></v-btn>
    </v-app-bar>

    <v-main scrollable>
      <router-view />
    </v-main>

    <!-- <AppFooter /> -->
  </v-app>
</template>

<script lang="ts" setup>
import { getCurrent } from "@tauri-apps/api/window";

const isPC = navigator.userAgent.indexOf("Mobile") == -1;
</script>
<style scoped>
.v-toolbar-title{
  flex:none;
}
</style>
