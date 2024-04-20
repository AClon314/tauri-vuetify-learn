import DebounceTracker from "@/plugins/debounceTracker";
import { expect, test, describe } from "vitest";

describe("constructor src/plugins/debounceTracker.ts", () => {
  test("Tracker({ myKey: true })", () => {
    const tracker = new DebounceTracker({ myKey: true });
    // console.log("tracker = ", tracker);
    expect(tracker.keyName).toBe("myKey");
    expect(tracker.val).toBe(true);
    expect(tracker.curVal).toBe(true);
  });

  test("Tracker({ myRef })", () => {
    const myRef = ref(1);
    const tracker = new DebounceTracker({ myRef });
    // console.log("tracker = ", tracker);
    expect(tracker.keyName).toBe("myRef");
    expect(tracker.val.value).toBe(1);
    expect(tracker.curVal).toBe(1);
  });
});

describe("receiver", () => {
  test("Tracker({ myRef })", () => {
    function setStorage(key: string, value: any) {
      expect(key).toBe("myRef");
      expect(value).toBe(myRef.value);
    }

    const myRef = ref(1);
    const tracker = new DebounceTracker({ myRef },setStorage);
    // console.log("tracker = ", tracker);

    watch(myRef, (newState) => tracker.receiver(newState));

    expect(tracker.keyName).toBe("myRef");
    expect(tracker.val.value).toBe(1);
    expect(tracker.curVal).toBe(1);

    myRef.value = 2;
  });
});
