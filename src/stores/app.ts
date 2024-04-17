// Utilities
import { defineStore } from "pinia";
import { MediaItem } from "@/types";

export const useAppStore = defineStore("app", {
  state: () => ({
    myMediaList: [] as MediaItem[],
    currentMediaId: -1,
    selected: [] as number[],
    err: {
      msg: "",
      show: false,
    }
  }),
  actions: {
    setCurrentMedia(id: number) {
      this.currentMediaId = id;
    },
    setMyMediaList(list: MediaItem[]) {
      this.myMediaList = list;
    },
    addCurrentId(x: number) {
      this.currentMediaId += x;
      this.currentMediaId %= this.myMediaList.length;
    },
    setSelected(x: number[]) {
      this.selected = x;
    },
  },
});
