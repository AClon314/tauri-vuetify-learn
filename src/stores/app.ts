// Utilities
import { defineStore } from "pinia";
import { MediaItem } from "@/types";
import { Store } from "@tauri-apps/plugin-store";

const DEBOUNCE_TIME = 1000;
const REPEAT_TIME = 1000;

let timerDebounce: NodeJS.Timeout | null = null;
let timerRepeat: NodeJS.Timeout | null = null;
let stopWatch: Function | null = null;
let tauS = new Store("pinia.bin");

type MyState = typeof initState;
const initState = {
  myMediaList: [] as MediaItem[],
  currentMediaId: 0,
  selected: [] as number[],
  isLoop: false,
  isRandom: false,
  curTime: 0,
  err: {
    msg: "",
    show: false,
  },
  save2tau: false,
};

export const useAppStore = defineStore("app", {
  state: () => initState,
  actions: {
    pinia2tau() {
      stopWatch = watch(
        this.$subscribe((state) => state),
        (newState) => {
          console.log("watch");
          if (timerDebounce) clearTimeout(timerDebounce);
          timerDebounce = setTimeout(() => {
            console.log("store saved in debounce mode", newState);
            if (timerRepeat) clearInterval(timerRepeat);
          }, DEBOUNCE_TIME);
          if (!timerRepeat)
            timerRepeat = setInterval(() => {
              console.log("store saved in repeat mode", newState);
            }, REPEAT_TIME);
        }
      );
      console.log("pinia2tau", this.$state);
    },
    addCurrentId(x: number) {
      this.currentMediaId += this.myMediaList.length + x;
      this.currentMediaId %= this.myMediaList.length;
    },
  },
  hydrate(state, initialState) {
    if (false)
      tauS.get("app").then((data) => {
        if (data) {
          console.log("hydrate", data);
          state = data as MyState;
        }
      });
  },
  persist: true,
});
