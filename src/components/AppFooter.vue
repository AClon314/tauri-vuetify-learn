<template>
  <v-footer height="70px" app elevation="10">
    <v-slider
      thumb-label
      v-model="appS.curTime"
      color="primary"
      track-color="primary"
      :max="duration"
      style="position: fixed; top: -15px; width: calc(100% - 45px)"
    ></v-slider>
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
        :label="Math.floor(appS.curTime).toString()"
        @keyup.enter="
          () => {
            if (progressInput) appS.curTime = progressInput;
          }
        "
        @focus="
          progressInput = Math.floor(appS.curTime);
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
      @mousedown="startPress(appR.isLoop)"
      @mouseup="stopPress(() => (isPlaying ? pause() : play()))"
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
      @mousedown="startPress(appR.isRandom)"
      @mouseup="stopPress(() => (appS.isRandom ? nextRandom() : next()))"
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
const appS = useAppStore();
const appR = storeToRefs(appS);

// 小心appS.currentMediaId<0时，数组会越界访问
const current = () => {
  if (appS.myMediaList) return appS.myMediaList[appS.currentMediaId];
};
const duration = ref(0);
const progressInput: Ref<number | null> = ref(null);
let audio: HTMLAudioElement | null = null;
let isPlaying = ref(false);

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
    audio.currentTime = appS.curTime;
    audio.onloadedmetadata = () => {
      if (audio) duration.value = audio.duration;
    };
    audio.onerror = () => {
      console.error("Failed to load audio");
    };
    audio.ontimeupdate = () => {
      appS.curTime = audio?.currentTime || 0;
    };
    audio.onended = () => {
      if (appS.isLoop) {
        appS.curTime = 0;
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
}

function pause() {
  audio?.pause();
  isPlaying.value = false;
}

function next(add: number = 1) {
  pause();
  appS.curTime = 0;
  appS.addCurrentId(add);
  appS.selected = [appS.currentMediaId];
  // console.log(`+${add}=${appStore.currentMediaId}`);
}

function nextRandom() {
  next(Math.ceil(Math.random() * (appS.myMediaList.length - 1)));
}

watch(appR.curTime, (accTime) => {
  if (audio && Math.abs(accTime - audio.currentTime) > DELTA_CUR_TIME)
    audio.currentTime = accTime;
});

// const stopWatchCur = await appS.watchCurTime.stop();
// const stopWatchS = await appS.watchS.stop();
watch(appR.currentMediaId, (current) => {
  pause();
  appS.curTime = 0;
  refresh();
  play();
});
</script>
