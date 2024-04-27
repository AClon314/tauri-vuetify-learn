<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
provide(
  "isTauri",
  Boolean(
    window != undefined && (window as any).__TAURI_INTERNALS__ !== undefined
  )
);
provide("isPC", navigator.userAgent.indexOf("Mobile") == -1);
</script>
