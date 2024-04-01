<template>
  <v-container>
    <v-row>
      <v-col v-for="n in 24" :key="n" :cols="isPC ? 4 : 6">
        <Card />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const isPC = navigator.userAgent.indexOf("Mobile") == -1;
</script>
