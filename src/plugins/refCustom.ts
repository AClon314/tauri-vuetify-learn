import { customRef } from 'vue'

/**
 * Creates a debounced ref that delays updating its value until a specified delay has passed.
 * @param value - The initial value of the ref.
 * @param delay - The delay in milliseconds before updating the ref value. Default is 200ms.
 * @returns A debounced ref object with a `get` and `set` method.
 */
export function refDebounced(value: any, delay = 200) {
  let timeout: any;
  return customRef((track, trigger) => {
    return {
      /**
       * Gets the current value of the debounced ref.
       * @returns The current value of the ref.
       */
      get() {
        track();
        return value;
      },
      /**
       * Sets a new value for the debounced ref.
       * @param newValue - The new value to set.
       */
      set(newValue: any) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      }
    };
  });
}
