// Utilities
import { defineStore } from 'pinia'
import { MediaItem } from '@/types'

export const useAppStore = defineStore('app', {
  state: () => ({
    myMediaList: [] as MediaItem[],
    currentMediaId: 0,
  }),
  actions: {
    setCurrentMedia(id: number) {
      this.currentMediaId = id
    },
    setMyMediaList(list: MediaItem[]) {
      this.myMediaList = list
    },
    addCurrentId(x: number) {
      this.currentMediaId += x
    },
  },
})
