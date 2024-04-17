<template>
  <v-footer height="70px" app elevation="5">
    <v-slider
      thumb-label
      v-model="currentProgress"
      density="compact"
      :max="duration"
      style="position: absolute; margin-bottom: 50px; z-index: 1; width: 95%"
    ></v-slider>
    <v-img
      min-width="64px"
      :src="current?.cover"
      draggable="false"
      :inline="true"
    ></v-img>

    <div>
      <span style="font-size: large; font-weight: 600">{{ current?.name }}</span
      ><br />
      <span class="v-list-item-subtitle">{{ current?.path }}</span>
    </div>

    <v-text-field
      v-model="currentProgress"
      density="compact"
      style="max-width: 80px"
      type="number"
      variant="outlined"
      hide-details
    ></v-text-field
    >/{{ duration }}

    <v-btn @click="next(-1)" variant="text" icon="mdi-skip-previous"></v-btn>
    <v-btn
      @click="switchPlay"
      variant="text"
      :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
    ></v-btn>
    <v-btn @click="next" variant="text" icon="mdi-skip-next"></v-btn>
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

const currentProgress = ref(0);
const duration = ref(0);
var audio: HTMLAudioElement | null = null;
var isPlaying = false;

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
  pause();
  currentProgress.value = 0;
  if (props.current && props.current.url) {
    audio = new Audio(props.current.url);
    audio.onloadedmetadata = () => {
      if (audio) duration.value = audio.duration;
      play();
    };
    audio.onerror = () => {
      console.error("Failed to load audio");
    };
    // audio.onended = () => {
    //   next();
    // };
  }
});

watch(currentProgress, (newTime) => {
  if (audio && Math.abs(newTime - audio.currentTime) > 0.2)
    audio.currentTime = newTime;
});

async function play() {
  if (props.current && props.current.url && audio) {
    audio.currentTime = currentProgress.value;
    audio.play();
    audio.ontimeupdate = () => {
      if (audio) currentProgress.value = audio.currentTime;
    };
    isPlaying = true;
  }
}

async function pause() {
  if (props.current && props.current.url && audio) {
    audio.pause();
    isPlaying = false;
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
  if (props.current && props.current.url && audio) {
    currentProgress.value = 0;
    pause();
    appStore.addCurrentId(add);
  }
}
</script>
