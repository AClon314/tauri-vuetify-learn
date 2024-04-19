// Utilities
import { defineStore } from "pinia";
import { MediaItem } from "@/types";

export const useAppStore = defineStore("app", {
  state: () => ({
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
  }),
  actions: {
    setCurrentMedia(id: number) {
      this.currentMediaId = id;
    },
    setMyMediaList(list: MediaItem[]) {
      this.myMediaList = list;
    },
    addCurrentId(x: number) {
      this.currentMediaId += this.myMediaList.length + x;
      this.currentMediaId %= this.myMediaList.length;
    },
    setSelected(x: number[]) {
      this.selected = x;
    },
  },
  persist: true,
});
