<template>
  <v-app>
    <v-app-bar
      :style="{
        backgroundColor: isFocused.valueOf()
          ? 'rgb(var(--v-theme-primary))'
          : 'transparent',
        color: isFocused.valueOf() ? 'white' : 'grey',
      }"
      style="transition: background-color 0.2s"
      density="compact"
      :height="isPC ? 50 : undefined"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-app-bar-title class="min-content">Viewer</v-app-bar-title>
      <v-spacer class="fill-height" data-tauri-drag-region></v-spacer>

      <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>

      <v-btn
        icon="mdi-minus"
        variant="text"
        @click="() => wd().minimize()"
        size="small"
        v-if="isPC && isTauri"
      ></v-btn>
      <v-btn
        class="ms-2"
        :icon="
          isMaximized ? 'mdi-window-restore' : 'mdi-checkbox-blank-outline'
        "
        variant="text"
        @click="() => wd().toggleMaximize()"
        size="small"
        v-if="isPC && isTauri"
      ></v-btn>
      <v-btn
        class="ms-2"
        icon="mdi-close"
        variant="text"
        @click="
          () => {
            wd().close();
            exit();
          }
        "
        size="small"
        v-if="isPC && isTauri"
      ></v-btn>
    </v-app-bar>

    <v-main scrollable>
      <router-view />
    </v-main>

    <v-snackbar v-model="appStore.err.show">
      {{ appStore.err.msg }}
      <template v-slot:actions>
        <v-btn variant="text" @click="appStore.err.show = false" icon="mdi-close"> </v-btn>
      </template>
    </v-snackbar>

    <AppFooter />
  </v-app>
</template>

<script lang="ts" setup>
import { getCurrent as wd } from "@tauri-apps/api/window";
import { useTheme } from "vuetify";
import { useAppStore } from "@/stores/app";
const appStore = useAppStore();

const isPC = inject("isPC");
const isFocused = ref(false);
const isMaximized = ref(false);
const isFullscreen = ref(false);
const isTauri = inject("isTauri");
const theme = useTheme();

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}

window.addEventListener("focus", () => (isFocused.value = true));
window.addEventListener("blur", () => (isFocused.value = false));

let unlisten: Promise<() => void> | null = null;

onMounted(() => {
  if (isTauri) {
    unlisten = wd().listen("tauri://resize", () => {
      wd()
        .isMaximized()
        .then((max) => (isMaximized.value = max));
      wd()
        .isFullscreen()
        .then((full) => (isFullscreen.value = full));
    });
  } else {
  }
});

onUnmounted(() => {
  if (unlisten) {
    unlisten.then((u) => u());
  }
});

function exit() {
  window.close();
}
</script>
<style scoped>
.v-toolbar-title {
  flex: none;
}
</style>
