<template>
  <v-footer height="70px" app elevation="5">
    <v-slider
      thumb-label
      v-model="curProgress"
      color="primary"
      track-color="primary"
      :max="duration"
      style="position: fixed; top: -15px; width: calc(100% - 45px)"
    ></v-slider>
    <v-img
      v-if="current?.cover"
      min-width="64px"
      draggable="false"
      style="z-index: -1"
      :src="current?.cover"
      :inline="true"
    ></v-img>

    <div style="z-index: 1; max-height: 2em; margin-bottom: 1em">
      <span style="font-weight: 600">{{ current?.name }}</span
      ><br />
      <span class="v-list-item-subtitle" style="font-size: small">{{
        current?.alias
      }}</span>
    </div>
    <v-spacer></v-spacer>

    <div style="line-height: 0.5; margin-bottom: 10px">
      <v-text-field
        v-model="progressInput"
        :label="Math.floor(curProgress).toString()"
        @keyup.enter="() => {if (progressInput) curProgress = progressInput}"
        @focus="progressInput=Math.floor(curProgress); $nextTick(()=>$event.target.select()) "
        @blur="progressInput=null"
        density="compact"
        style="max-width: 5ch"
        variant="underlined"
        hide-details
      ></v-text-field>
      <br /><span>{{ duration.toFixed(1) }}</span>
    </div>

    <v-btn @click="next(-1)" variant="text" icon="mdi-skip-previous"></v-btn>
    <v-btn
      @click="switchPlay"
      v-touch:hold="switchPlay"
      variant="text"
      :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
    ></v-btn>
    <v-btn @click="next()" variant="text" icon="mdi-skip-next"></v-btn>
  </v-footer>
</template>

<script lang="ts" setup>
import { MediaItem } from "@/types";
import { useAppStore } from "@/stores/app";
const appStore = useAppStore();
const props = defineProps({
  current: {
    type: Object as PropType<MediaItem> | null,
  },
});

const duration = ref(0);
const curProgress = ref(0);
const progressInput:Ref<number|null> = ref(null);
let audio: HTMLAudioElement | null = null;
let isPlaying = false;

function formatTime(time: Ref<number>) {
  return computed(() => {
    const minutes = Math.floor(time.value / 60);
    const seconds = Math.floor(time.value % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  });
}

onUpdated(() => {
  pause(0);
  curProgress.value = 0;
  refresh();
  if (audio) play();
  console.log("update");
});

onUnmounted(() => {
  pause();
  audio = null;
});

watch(curProgress, (accTime) => {
  if (audio && Math.abs(accTime - audio.currentTime) > 0.1)
    audio.currentTime = accTime;
});

async function refresh() {
  audio?.pause();
  if (props.current && props.current.url) {
    audio = new Audio(props.current.url);
    audio.onloadedmetadata = () => {
      if (audio) duration.value = audio.duration;
    };
    audio.onerror = () => {
      console.error("Failed to load audio");
    };
    audio.onended = () => {
      next();
    };
  } else {
    appStore.err.msg = `skipping ${props.current?.name}`;
    appStore.err.show = true;
    console.error("Current media", props.current);
    next();
  }
}

async function play() {
  if (props.current && props.current.url && audio) {
    audio.play().catch((e) => {
      console.error("Failed to play audio", e);
    });
    audio.ontimeupdate = () => {
      if (audio) curProgress.value = audio.currentTime;
    };
    isPlaying = true;
  }
}

async function pause(goto: number | null = null) {
  if (props.current && props.current.url && audio) {
    audio.pause();
    isPlaying = false;
    if (goto !== null) curProgress.value = goto;
  }
}

async function switchPlay() {
  if (isPlaying) {
    pause();
  } else {
    play();
  }
}

async function next(add: number = 1) {
  pause(0);
  appStore.addCurrentId(add);
  appStore.setSelected([appStore.currentMediaId]);
}
</script>
@/plugins/refDebounced
