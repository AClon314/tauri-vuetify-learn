// Utilities
import { defineStore } from "pinia";
import { MediaItem } from "@/types";
import { Store } from "@tauri-apps/plugin-store";

const DEBOUNCE_TIME = 1500;
const REPEAT_TIME = 5000;
const DEFAULT_KEY = "initS";

let tauS = new Store("app.bin");

export const useAppStore = defineStore(
  "app",
  () => {
    const isTauri = inject("isTauri") as boolean;
    async function tauSet(val: any, key: string = DEFAULT_KEY) {
      if (isTauri) return await tauS.set(key, val);
    }
    async function tauGet(key: string = DEFAULT_KEY) {
      if (isTauri) return await tauS.get(key);
    }

    /**
     * @param key: string, will be abandoned. 临时方案
     */
    class Watch {
      timerDebounce?: NodeJS.Timeout | null;
      timerRepeat?: NodeJS.Timeout | null;

      constructor(
        public refer: Ref<any> | UnwrapNestedRefs,
        public func?: Function | null,
        public key: string = DEFAULT_KEY
      ) {}

      async stop() {
        return watch(this.refer, (newState) => {
          // console.log("watch", this.timerRepeat, timerDebounce);
          if (this.timerDebounce) {
            clearTimeout(this.timerDebounce);
            this.timerDebounce = null;
          }
          this.timerDebounce = setTimeout(() => {
            if (this.timerRepeat) {
              clearInterval(this.timerRepeat);
              this.timerRepeat = null; // 坑爹
            }
            if (this.func) this.func(newState, this.key);
            console.log(
              "saved after debounce mode",
              this.timerDebounce,
              this.key,
              newState
            );
          }, DEBOUNCE_TIME);
          if (!this.timerRepeat) {
            this.timerRepeat = setInterval(() => {
              if (this.func) this.func(newState, this.key);
              console.log("saved in repeat mode", this.timerRepeat, this.key);
            }, REPEAT_TIME);
            if (this.func) this.func(newState, this.key);
            console.log("saved before repeat mode", this.timerRepeat, this.key);
          }
        });
      }
    }

    const curTime = ref(0);

    /**
     * ### Put non-continuously updated variables into initS~~tatic~~
     * 将非持续性的变量放到initS中。
     *
     * 假设：进度条秒数在播放后，是持续更新的；那么偶尔更新的变量，就叫非持续性变量.
     */
    let initS = reactive({
      myMediaList: [] as MediaItem[],
      currentMediaId: 0,
      selected: [] as number[],
      isLoop: false,
      isRandom: false,
      err: {
        msg: "",
        show: false,
      },
      save2tau: false,
    });
    type UnwrapNestedRefs = typeof initS;
    const initR = toRefs(initS);

    function addCurrentId(x: number) {
      initS.currentMediaId += initS.myMediaList.length + x;
      initS.currentMediaId %= initS.myMediaList.length;
    }

    if (isTauri) {
      console.log("tauGet");
      tauGet().then((data: any) => {
        if (data) {
          console.log("hydrate", data.selected);
          Object.assign(initS, data);
        }
      });

      tauGet("curTime").then((data) => {
        if (data) {
          console.log("hydrate", data);
          curTime.value = data as number;
        }
      });
    }

    const watchS = new Watch(initS, tauSet).stop();
    const watchCurTime = new Watch(curTime, tauSet, "curTime").stop();

    return {
      ...initR,
      curTime,
      watchS,
      watchCurTime,
      addCurrentId,
    };
  },
  {
    persist: true,
  }
);
/*
初始化store → watch(store)开始监听 → tauGet更新store → 触发watch更新
由于tauGet是异步函数，是否有办法让watch(store)在tauGet之后再开始监听？
*/
