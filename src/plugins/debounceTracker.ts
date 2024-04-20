import { nameOf } from "@/plugins/utils";
const DEBOUNCE_TIME = 1500;
const REPEAT_TIME = 5000;
type SetStorageFunc = (key: string, val: any) => void;

export class DebounceTracker {
  /** change `static` to `public` if you want */
  static _debounceTime = DEBOUNCE_TIME;
  static _repeatTime = REPEAT_TIME;

  // get debounceTime() {
  //   return this._debounceTime;
  // }
  // get repeatTime() {
  //   return this._repeatTime;
  // }
  // set debounceTime(val: number) {
  //   if (val>=0) this._debounceTime = val;
  //   else throw new Error("debounce_time must be a positive number");
  //   if (val<=3) console.warn("debounce_time is too short, may cause performance issue");
  // }
  // set repeatTime(val: number) {
  //   if (val>=0) this._repeatTime = val;
  //   else throw new Error("repeat_time must be a positive number");
  //   if (val<=3) console.warn("repeat_time is too short, may cause performance issue");
  // }

  private timerDebounce: NodeJS.Timeout | null = null;
  private timerRepeat: NodeJS.Timeout | null = null;
  readonly val: Ref<any> | any | (() => any) = null;
  readonly isRefFlag: boolean = false;
  readonly keyName: string;

  get curVal() {
    if (this.isRefFlag) {
      return this.val.value;
    } else if (typeof this.val === "function") {
      return this.val();
    }
    return this.val;
  }

  /**
   * ### Constructor 构造器
   * @param varInDict the variable to be saved
   * @param func a function which get 2 params: `key` and `value`
   * ---
   * @example
   * ```ts
   * const myRef = ref(0);
   * const tracker = new DebounceTracker({ myRef }, setLocalStorage);
   * const track_2 = new DebounceTracker({ myKey:true }, setLocalStorage);
   * // inside receiver():
   * setLocalStorage("myRef", myRef.value); // auto convert varName to key name
   * setLocalStorage("myKey", true);
   * ```
   */
  constructor(
    varInDict: Record<any, any> | Set<any>,
    public func?: SetStorageFunc
  ) {
    let value; // need final in flutter
    [this.keyName, value] = nameOf(varInDict);

    // this.keyName = Object.keys(varInDict)[0];
    // const value = Object.values(varInDict)[0];

    const typeOf = typeof value;
    if (isRef(value)) {
      this.val = value;
      this.isRefFlag = true; // only check Ref ONCE !!!
    } else if (
      typeOf === "number" ||
      typeOf === "string" ||
      typeOf === "boolean"
    ) {
      this.val = value;
    } else {
      // maybe buggy
      this.val = eval(`() => ${this.keyName}`);
    }
  }

  destroy() {
    if (this.timerDebounce) {
      clearTimeout(this.timerDebounce);
      this.timerDebounce = null;
    }
    if (this.timerRepeat) {
      clearInterval(this.timerRepeat);
      this.timerRepeat = null;
    }
  }

  /**
   * ### As a `watch`'s callback function.
   * 作为watcher的回调函数
   * @param newState: the new state to be saved
   * ---
   * example:
   * ```ts
   * <script setup>
   * watch(myRef, (newState) => tracker.receiver(newState));
   * </script>
   * ```
   */
  receiver(newState: any) {
    // console.log("watch", this.timerRepeat, this.timerDebounce);
    if (this.timerDebounce) {
      clearTimeout(this.timerDebounce);
      this.timerDebounce = null;
    }
    this.timerDebounce = setTimeout(() => {
      if (this.timerRepeat) {
        clearInterval(this.timerRepeat);
        this.timerRepeat = null; // 坑爹
      }
      // save
      if (this.func) this.func(this.keyName, newState);
      console.log("saved after debounce mode", this.keyName, newState);
    }, DebounceTracker._debounceTime);

    if (!this.timerRepeat) {
      this.timerRepeat = setInterval(() => {
        if (this.func) {
          // save, due to newState will keep constant incorrectly
          this.func(this.keyName, this.curVal);
          console.log("saved in interval mode", this.keyName, this.curVal);
        }
      }, DebounceTracker._repeatTime);
      // save
      if (this.func) this.func(this.keyName, newState);
      console.log("saved before repeat mode", this.keyName, newState);
    }
  }
}
