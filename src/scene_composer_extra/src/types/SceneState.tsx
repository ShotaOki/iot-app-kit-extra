import { useMemo, useState } from "react";
import { EventEmitter } from "events";

export class UpdateNotifier {
  emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }
  onUpdateRecord() {
    this.emitter.emit("update");
  }
  bind(listener: () => void) {
    this.emitter.on("update", listener);
  }
}

/**
 * useStateに近い形で利用できる関数
 * stateの更新と、3Dレコードの更新がどちらもできる
 *
 * @param instance
 * @returns
 */
export function useSceneState<T extends object>(
  instance: T
): [T, UpdateNotifier] {
  const [count, setCount] = useState(0);

  // 再描画でインスタンスを再生成させない
  return useMemo(() => {
    // 更新の通知を受け取る
    const notifier = new UpdateNotifier();

    // 値の更新を監視する
    const result = new Proxy(instance, {
      set(obj, prop, newval) {
        // Emitterに更新を通知する
        notifier.onUpdateRecord();
        // Stateを更新する
        setCount((_) => Math.random() + count + 1);
        //@ts-ignore
        return Reflect.set(...arguments);
      },
    });

    return [result, notifier];
  }, []);
}
