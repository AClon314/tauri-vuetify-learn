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
            console.log("saved after debounce mode", this.key, newState);
          }, DEBOUNCE_TIME);

          if (!this.timerRepeat) {
            this.timerRepeat = setInterval(() => {
              if (this.func)
                this.func(
                  isRef(this.refer) ? this.refer.value : this.refer,
                  this.key
                );
              console.log(
                "saved in repeat mode",
                this.key,
                isRef(this.refer) ? this.refer.value : this.refer
              );
            }, REPEAT_TIME);
            if (this.func) this.func(newState, this.key);
            console.log("saved before repeat mode", this.key, newState);
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
    const initS = () =>
      reactive({
        myMediaList: [] as MediaItem[],
        currentMediaId: -1,
        selected: [] as number[],
        isLoop: false,
        isRandom: false,
        err: {
          msg: "",
          show: false,
        },
        isLoaded: false,
        save2tau: false,
      });
    type UnwrapNestedRefs = ReturnType<typeof initS>;
    let appS = initS();
    const initR = toRefs(appS);

    function addCurrentId(x: number) {
      appS.currentMediaId += appS.myMediaList.length + x;
      appS.currentMediaId %= appS.myMediaList.length;
    }

    if (isTauri) {
      console.log("tauGet");
      Promise.all([
        tauGet().then((data: any) => {
          if (data) {
            console.log("hydrate", data.selected);
            Object.assign(appS, data);
          }
        }),

        tauGet("curTime").then((data) => {
          if (data) {
            // console.log("hydrate", data);
            curTime.value = data as number;
          }
        }),
      ]).then(() => {
        appS.isLoaded = true;
      });
    }

    const watchS = new Watch(appS, tauSet).stop();
    const watchCurTime = new Watch(curTime, tauSet, "curTime").stop();

    function reset() {
      Object.assign(appS, initS());
      curTime.value = 0;
    }

    return {
      ...initR,
      curTime,
      watchS,
      watchCurTime,
      reset,
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
