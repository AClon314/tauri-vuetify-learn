<template>
  <v-footer v-if="appS.currentMediaId >= 0" height="70px" app elevation="10">
    <v-slider
      thumb-label
      v-model="curTime"
      @mousedown="isDragging = true"
      @mouseup="isDragging = false"
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
      @click="if (isPC) () => (isPlaying ? pause() : play());"
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
      @[isPC&&`click`]="appS.isRandom ? nextRandom() : next()"
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
import { Howl } from "howler";
import {
  startPersistentNotify,
  stopPersistentNotify,
} from "@tauri-apps/plugin-permissionsx";
const appS = useAppStore();
const appR = storeToRefs(appS);

// 小心appS.currentMediaId<0时，数组会越界访问
const current = () => appS.myMediaList[appS.currentMediaId];
const curTime = ref(appS.curTime);
const duration = ref(0);
const progressInput: Ref<number | null> = ref(null);
const isDragging = ref(false);
const isPlaying = ref(false);
let audio: Howl | null = null;
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

function refresh(retryCount: number = 0) {
  const maxRetries = 3;
  if (current()?.url) {
    const isHtml5 = !current()?.url.includes("localhost");
    audio = new Howl({ src: [current()?.url], html5: isHtml5 });
    audio.seek(curTime.value);
    audio.on("load", () => {
      if (audio) duration.value = audio.duration();
    });
    let updateInterval = setInterval(() => {
      if (!isDragging.value) curTime.value = audio?.seek() || 0;
    }, 100);
    audio.on("end", () => {
      clearInterval(updateInterval);
      if (appS.isLoop) {
        curTime.value = 0;
        play();
      } else {
        if (appS.isRandom) nextRandom();
        else next();
      }
    });
    audio.on("playerror", () => {
      if (retryCount < maxRetries) {
        console.warn(`Load retrying: ${retryCount}`);
        refresh(retryCount + 1);
      } else {
        console.log("Failed to load audio after 3 retries");
        pause();
      }
    });
    if (retryCount > 0) play();
  } else {
    audio = null;
    appS.err.msg = `Unplayable ${current()?.name}`;
    appS.err.show = true;
    console.error("Current media", current);
  }
}

function play() {
  audio?.play();
  isPlaying.value = true;
  if (isTauri)
    startPersistentNotify(
      `${current()?.name}`,
      `${current()?.alias}`
    );
}

function pause() {
  audio?.pause();
  isPlaying.value = false;
  if (isTauri) stopPersistentNotify();
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
  if (audio && Math.abs(accTime - audio.seek()) > DELTA_CUR_TIME) {
    audio.seek(accTime);
    // audio.currentTime = accTime;
  } else {
    isDragging.value = false;
  }
});

const isPC = inject("isPC");
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
