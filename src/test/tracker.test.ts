import DebounceTracker from "@/plugins/debounceTracker";
import { expect, test, describe } from "vitest";

describe("constructor src/plugins/debounceTracker.ts", () => {
  test("Tracker({ myKey: true })", () => {
    expect.assertions(3);
    const tracker = new DebounceTracker({ myKey: true });
    // console.log("tracker = ", tracker);
    expect(tracker.keyName).toBe("myKey");
    expect(tracker.val).toBe(true);
    expect(tracker.curVal).toBe(true);
  });

  test("Tracker({ myRef })", () => {
    expect.assertions(3);
    const myRef = ref(1);
    const tracker = new DebounceTracker({ myRef });
    // console.log("tracker = ", tracker);
    expect(tracker.keyName).toBe("myRef");
    expect(tracker.val.value).toBe(1);
    expect(tracker.curVal).toBe(1);
  });
});

describe("receiver", () => {
  test("Tracker({ myRef })", async () => {
    const passGoal = 4;
    // expect.assertions(passGoal);

    let intervalHandle: NodeJS.Timeout | null = null;
    function setStorage(key: string, value: any) {
      // expect(key).toBe("myRef");
      expect(value).toBe(myRef.value);
    }

    const myRef = ref(0);
    DebounceTracker._debounceTime = 400;
    DebounceTracker._repeatTime = 200;
    const tracker = new DebounceTracker({ myRef }, setStorage);

    watch(myRef, (newState) => tracker.receiver(newState));

    // expect(tracker.keyName).toBe("myRef");
    // expect(tracker.val.value).toBe(0);
    // expect(tracker.curVal).toBe(0);

    const INTERVAL_DUR = 100;
    console.log(`interval expect: ${passGoal * INTERVAL_DUR}ms`);
    intervalHandle = setInterval(() => {
      myRef.value++;
      if (myRef.value >= passGoal) {
        clearInterval(intervalHandle!);
        intervalHandle = null;
      }
    }, INTERVAL_DUR);

    await new Promise((resolve) => {
      let checkInterval = setInterval(() => {
        console.log(myRef.value, "👀");
        if (myRef.value >= passGoal) {
          clearInterval(checkInterval);
          clearInterval(intervalHandle!);
          intervalHandle = null;
          resolve(null);
        }
      }, INTERVAL_DUR);
    });

    // 再等1s，确保debounce结束
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 500);
    });
  });
});
