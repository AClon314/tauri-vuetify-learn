// Utilities
import { defineStore } from "pinia";
import { MediaItem } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { DebounceTracker } from "@/plugins/debounceTracker";

let tauS = new Store("app.bin");

export const useAppStore = defineStore(
  "app",
  () => {
    const isTauri = inject("isTauri") as boolean;
    async function tauSet(key: string, val: any) {
      // console.log("tauSet", key, val);
      if (isTauri) return await tauS.set(key, val);
      // else return localStorage.setItem(key, val);
    }
    async function tauGet(key: string) {
      if (isTauri) return await tauS.get(key);
      // else return localStorage.getItem(key);
    }

    type RefOrReactive = Ref<any> | Reactive;
    class DebounceStore {
      timer: DebounceTracker;

      /**
       * @param toStore - \{ var_u_want_store \}, eg: `{appStore}` `{myRef}`, key name auto-gereated from var name
       * @param func - usually `setLocalStorage(key, value)`
       * ---
       * @example
       * ```ts
       * const appS_ready = new DebounceStore({appStore},setLocalStorage);
       * const stopHandle = appS_ready().watch(); // start watching
       * stopHandle(); // stop watching
       * ```
       */
      constructor(
        public toStore: Set<RefOrReactive> | Record<any,RefOrReactive>,
        public func?: (key: string, val: any) => void
      ) {
        this.timer = new DebounceTracker(toStore, this.func);
      }

      /**
       * @param from - `Ref` , means watch `from`, store `to`
       * @return stop - stop watching
       * ---
       * @example
       * ```ts
       *
       */
      watch(from: RefOrReactive) {
        return watch(from, (newState) => this.timer.receiver(newState));
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
    type Reactive = ReturnType<typeof initS>;
    const appS = initS();
    const initR = toRefs(appS);

    // actions
    function addCurrentId(x: number) {
      appS.currentMediaId += appS.myMediaList.length + x;
      appS.currentMediaId %= appS.myMediaList.length;
    }

    // secondary init from tauri store
    // tauGet("keyName"), keyName = varName is a must !!!
    if (isTauri) {
      Promise.all([
        tauGet("appS").then((data: any) => {
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
        // unused variables for now
        appS.isLoaded = true;
      });
    }

    // watchS is actually a handle, call watchS() to stop watching
    const watchS = new DebounceStore({appS},tauSet).watch(appS);
    // const watchCurTime = new Watch(curTime, "curTime").stop();

    // no $reset for setup pinia, so you need to define it yourself
    function reset() {
      Object.assign(appS, initS());
      curTime.value = 0;
    }

    // deconstruct initR and else
    return {
      ...initR,
      curTime,
      watchS,
      tauSet,
      tauGet,
      reset,
      addCurrentId,
    };
  },
  {
    persist: true,
  }
);
/*
初始化store → 外部watch(store)开始监听 → 内部tauGet更新store → 触发外部watch更新
由于tauGet是异步函数，是否有办法让watch(store)在tauGet之后再开始监听？
答：可以在watch内部加一个判断，如果store已经被更新，就不再执行watch
*/
