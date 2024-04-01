<template>
  <h3>{{ result }}</h3>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { internalIpV4 } from "internal-ip";
const result = ref("");
internalIpV4().then(ip => result.value = ip ?? "");
</script>
