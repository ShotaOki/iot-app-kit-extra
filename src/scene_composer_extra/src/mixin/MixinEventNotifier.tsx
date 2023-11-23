import { generateUUID } from "three/src/math/MathUtils";
import { UpdateNotifier } from "../types/SceneState";
import { Constructor } from "./MixinBase";
import { EventEmitter } from "events";

const EventName = {
  LOAD: "load",
  UPDATE_STATE: "updateState",
  TICK: "tick",
  VISIBLE: "visible",
  HIDE: "hide",
};

type UpdateStateParameter = string | number;

// 受信関数
export interface MixinEventNotifierObserver {
  /** 読み込みが完了したことを通知する関数 */
  observerLoad(receiver: () => void): void;
  /** 状態が変更されたことを通知する関数 */
  observerUpdateState(
    receiver: (parameter: UpdateStateParameter) => void
  ): void;
  /** 画面の状態が更新されたことを通知する関数 */
  observerTick(receiver: () => void): void;
  /** effectDependsOnで設定した更新通知クラスが更新された */
  observerEffect(receiver: () => void): void;
  /** useSceneStateで取得する更新通知クラス */
  observerEffectDependsOn(notifier: UpdateNotifier): void;
  /** 表示状態が表示に変わった時に通知する関数 */
  observerVisible(receiver: () => void): void;
  /** 表示状態が非表示に変わった時に通知する関数 */
  observerHide(receiver: () => void): void;
}

// 受信関数
export interface EventNotifierInterface<T> {
  /** 読み込みが完了したことを通知する関数 */
  onLoad(receiver: () => void): T;
  /** 状態が変更されたことを通知する関数 */
  onUpdateState(receiver: (parameter: UpdateStateParameter) => void): T;
  /** 画面の状態が更新されたことを通知する関数 */
  onTick(receiver: () => void): T;
  /** effectDependsOnで設定した更新通知クラスが更新された */
  onEffect(receiver: () => void): T;
  /** useSceneStateで取得する更新通知クラス */
  effectDependsOn(notifier: UpdateNotifier): T;
  /** 表示状態が表示に変わった時に通知する関数 */
  onVisible(receiver: () => void): T;
  /** 表示状態が非表示に変わった時に通知する関数 */
  onHide(receiver: () => void): T;
}

// Mixinの継承判定
export function isMixinEventNotifierEmitter(
  object: any
): object is MixinEventNotifierEmitter {
  return (
    "emitOnLoad" in object &&
    "emitUpdateState" in object &&
    "emitTick" in object &&
    "emitVisible" in object &&
    "emitHide" in object
  );
}

// 発行関数
export interface MixinEventNotifierEmitter {
  emitOnLoad(): void;
  emitUpdateState(parameter: UpdateStateParameter): void;
  emitTick(): void;
  emitVisible(): void;
  emitHide(): void;
}

export function MixinEventNotifier<TBase extends Constructor>(Base: TBase) {
  return class EventNotifier
    extends Base
    implements MixinEventNotifierObserver, MixinEventNotifierEmitter
  {
    #_eventEmitter: EventEmitter = new EventEmitter();
    #_eventUUID: string = "";
    eventNotifierInitialize() {
      this.#_eventEmitter = new EventEmitter();
      this.#_eventUUID = generateUUID();
    }

    emitUpdateState(parameter: UpdateStateParameter): void {
      this.#_eventEmitter.emit(EventName.UPDATE_STATE, parameter);
    }

    emitTick(): void {
      this.#_eventEmitter.emit(EventName.TICK);
    }

    emitOnLoad() {
      this.#_eventEmitter.emit(EventName.LOAD);
    }

    emitVisible(): void {
      this.#_eventEmitter.emit(EventName.VISIBLE);
    }

    emitHide(): void {
      this.#_eventEmitter.emit(EventName.HIDE);
    }

    observerUpdateState(
      receiver: (parameter: UpdateStateParameter) => void
    ): void {
      this.#_eventEmitter.on(EventName.UPDATE_STATE, receiver);
    }

    observerTick(receiver: () => void): void {
      this.#_eventEmitter.on(EventName.TICK, receiver);
    }

    observerLoad(receiver: () => void): void {
      this.#_eventEmitter.on(EventName.LOAD, receiver);
    }

    observerEffect(receiver: () => void): void {
      this.#_eventEmitter.on(this.#_eventUUID, receiver);
    }

    observerVisible(receiver: () => void): void {
      this.#_eventEmitter.on(EventName.VISIBLE, receiver);
    }

    observerHide(receiver: () => void): void {
      this.#_eventEmitter.on(EventName.HIDE, receiver);
    }

    observerEffectDependsOn(notifier: UpdateNotifier): void {
      notifier.bind(() => this.#_eventEmitter.emit(this.#_eventUUID));
    }
  };
}
