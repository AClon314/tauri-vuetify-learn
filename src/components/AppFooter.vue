<template>
  <v-footer v-if="appS.currentMediaId >= 0" height="70px" app elevation="10">
    <v-slider
      thumb-label
      v-model="curTime"
      color="primary"
      track-color="primary"
      :max="duration"
      style="position: fixed; top: -15px; width: calc(100% - 45px)"
    ></v-slider>
    <!-- @mouseup="audio!.currentTime = curTime;" -->
    <v-img
      v-if="current()?.cover"
      min-width="64px"
      draggable="false"
      style="z-index: -1"
      :src="current()?.cover"
      :inline="true"
    ></v-img>

    <div style="z-index: 1; max-height: 2em; margin-bottom: 1em">
      <span style="font-weight: 600">{{ current()?.name }}</span
      ><br />
      <span class="v-list-item-subtitle" style="font-size: small">{{
        current()?.alias
      }}</span>
    </div>

    <v-spacer></v-spacer>

    <div style="line-height: 0.5; margin-bottom: 10px">
      <v-text-field
        v-model="progressInput"
        :label="Math.floor(curTime).toString()"
        @keyup.enter="
          () => {
            if (progressInput) curTime = progressInput;
          }
        "
        @focus="
          progressInput = Math.floor(curTime);
          $nextTick(() => $event.target.select());
        "
        @blur="progressInput = null"
        density="compact"
        style="max-width: 5ch"
        variant="underlined"
        hide-details
      ></v-text-field>
      <br /><span>{{ duration.toFixed(1) }}</span>
    </div>

    <v-btn @click="next(-1)" variant="text" icon="mdi-skip-previous"></v-btn>
    <v-btn
      @touchstart="startPress(appR.isLoop)"
      @touchend="stopPress(() => (isPlaying ? pause() : play()))"
      @click.right="appS.isLoop = !appS.isLoop"
      :active="appS.isLoop"
      :variant="appS.isLoop ? 'outlined' : 'text'"
      :color="appS.isLoop ? 'primary' : ''"
      :icon="
        isPlaying
          ? appS.isLoop
            ? 'mdi-motion-pause-outline'
            : 'mdi-pause'
          : 'mdi-play'
      "
    ></v-btn>
    <v-btn
      @touchstart="startPress(appR.isRandom)"
      @touchend="stopPress(() => (appS.isRandom ? nextRandom() : next()))"
      @click.right="appS.isRandom = !appS.isRandom"
      :active="appS.isRandom"
      :variant="appS.isRandom ? 'outlined' : 'text'"
      :color="appS.isRandom ? 'primary' : ''"
      :icon="appS.isRandom ? 'mdi-shuffle' : 'mdi-skip-next'"
    ></v-btn>
  </v-footer>
</template>

<script lang="ts" setup>
const DELTA_CUR_TIME = 0.1;
const LONG_PRESS_TIME = 700;
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { DebounceTracker as Tracker } from "@/plugins/debounceTracker";
// import { invoke } from "@tauri-apps/api/core";
import {
  startPersistentNotify,
  stopPersistentNotify,
} from "@tauri-apps/plugin-permissionsx";
import { invoke } from "@tauri-apps/api/core";
const appS = useAppStore();
const appR = storeToRefs(appS);

// 小心appS.currentMediaId<0时，数组会越界访问
const current = () => appS.myMediaList[appS.currentMediaId];
const curTime = ref(appS.curTime);
const duration = ref(0);
const progressInput: Ref<number | null> = ref(null);
const isPlaying = ref(false);
let audio: HTMLAudioElement | null = null;
let everPlay = false;

let pressTimer: any = null;
let pressLock = false;
function startPress(ref: Ref<boolean>) {
  pressLock = true;
  pressTimer = setTimeout(() => {
    ref.value = !ref.value;
    pressLock = false;
  }, LONG_PRESS_TIME);
}
function stopPress(func: () => void) {
  clearTimeout(pressTimer);
  if (pressLock) {
    func();
    pressLock = false;
  }
}
onMounted(() => {
  refresh();
});

onUnmounted(() => {
  pause();
  audio = null;
});

function refresh() {
  if (current()?.url) {
    audio = new Audio(current()?.url);
    audio.currentTime = curTime.value;
    audio.onloadedmetadata = () => {
      if (audio) duration.value = audio.duration;
    };
    audio.onerror = () => {
      console.error("Failed to load audio");
    };
    audio.ontimeupdate = () => {
      curTime.value = audio?.currentTime || 0;
    };
    audio.onended = () => {
      if (appS.isLoop) {
        curTime.value = 0;
        play();
      } else {
        if (appS.isRandom) nextRandom();
        else next();
      }
    };
  } else {
    audio = null;
    appS.err.msg = `Unplayable ${current()?.name}`;
    appS.err.show = true;
    console.error("Current media", current);
  }
}

function play() {
  audio?.play().catch((e) => {
    console.error("Failed to play audio", e);
  });
  isPlaying.value = true;
  // startPersistentNotify(
  //   `😉常驻通知栏成功`,
  //   `${current()?.name} - ${current()?.alias}`
  // );
  invoke('plugin:permissionsx|startPersistentNotify',{title: `😉常驻通知栏成功`,content: `${current()?.name} - ${current()?.alias}`}).catch((e) => {
    console.error(e);
  });
}

function pause() {
  audio?.pause();
  isPlaying.value = false;
  stopPersistentNotify();
}

function next(add: number = 1) {
  pause();
  curTime.value = 0;
  appS.addCurrentId(add);
  appS.selected = [appS.currentMediaId];
  // console.log(`+${add}=${appStore.currentMediaId}`);
}

function nextRandom() {
  next(Math.ceil(Math.random() * (appS.myMediaList.length - 1)));
}

let tracker = new Tracker({ curTime }, (k, v) => {
  appS.tauSet(k, v);
  appS.curTime = v;
});
watch(curTime, (accTime) => {
  tracker.receiver(accTime);
  if (audio && Math.abs(accTime - audio.currentTime) > DELTA_CUR_TIME)
    audio.currentTime = accTime;
});

const isTauri = inject("isTauri");
watch(appR.currentMediaId, (current) => {
  pause();
  refresh();
  if (!isTauri || everPlay) {
    // 临时补丁
    curTime.value = 0;
    play();
  }
  everPlay = true;
});
</script>
