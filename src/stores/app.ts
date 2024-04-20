// Utilities
import { defineStore } from "pinia";
import { MediaItem } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import DebounceTracker from "@/plugins/debounceTracker";

let tauS = new Store("app.bin");

export const useAppStore = defineStore(
  "app",
  () => {
    const isTauri = inject("isTauri") as boolean;
    async function tauSet(val: any, key: string) {
      if (isTauri) return await tauS.set(key, val);
    }
    async function tauGet(key: string) {
      if (isTauri) return await tauS.get(key);
    }

    class Watch {
      timer: DebounceTracker;

      constructor(
        public from: Ref<any> | UnwrapNestedRefs,
        public to?: Ref<any> | UnwrapNestedRefs | null,
        public func?: Function
      ) {
        if (to == null) this.to = from;
        console.error("Watcher", this);
        this.timer = new DebounceTracker({to}, this.func);
      }

      stop() {
        return watch(this.from, (newState) => this.timer.receiver(newState));
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

    // actions
    function addCurrentId(x: number) {
      appS.currentMediaId += appS.myMediaList.length + x;
      appS.currentMediaId %= appS.myMediaList.length;
    }

    if (isTauri) {
      console.log("tauGet");
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
    const watchS = new Watch(appS).stop();
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
      Watch,
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
