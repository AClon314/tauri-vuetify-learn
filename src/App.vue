<template>
  <Suspense>
    <v-app>
      <v-main>
        <router-view />
      </v-main> </v-app
  ></Suspense>
</template>

<script lang="ts" setup>
// @ts-ignore
provide("isTauri", window.__TAURI_INTERNALS__);
</script>
