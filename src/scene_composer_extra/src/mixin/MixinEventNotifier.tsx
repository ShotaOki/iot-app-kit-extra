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
export interface MixinEventNotifierInterface {
  /** 読み込みが完了したことを通知する関数 */
  onLoad(receiver: () => void): this;
  /** 状態が変更されたことを通知する関数 */
  onUpdateState(receiver: (parameter: UpdateStateParameter) => void): this;
  /** 画面の状態が更新されたことを通知する関数 */
  onTick(receiver: () => void): this;
  /** effectDependsOnで設定した更新通知クラスが更新された */
  onEffect(receiver: () => void): this;
  /** useSceneStateで取得する更新通知クラス */
  effectDependsOn(notifier: UpdateNotifier): this;
  /** 表示状態が表示に変わった時に通知する関数 */
  onVisible(receiver: () => void): this;
  /** 表示状態が非表示に変わった時に通知する関数 */
  onHide(receiver: () => void): this;
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
    implements MixinEventNotifierInterface, MixinEventNotifierEmitter
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

    onUpdateState(receiver: (parameter: UpdateStateParameter) => void): this {
      this.#_eventEmitter.on(EventName.UPDATE_STATE, receiver);
      return this;
    }

    onTick(receiver: () => void): this {
      this.#_eventEmitter.on(EventName.TICK, receiver);
      return this;
    }

    onLoad(receiver: () => void): this {
      this.#_eventEmitter.on(EventName.LOAD, receiver);
      return this;
    }

    onEffect(receiver: () => void): this {
      this.#_eventEmitter.on(this.#_eventUUID, receiver);
      return this;
    }

    onVisible(receiver: () => void): this {
      this.#_eventEmitter.on(EventName.VISIBLE, receiver);
      return this;
    }

    onHide(receiver: () => void): this {
      this.#_eventEmitter.on(EventName.HIDE, receiver);
      return this;
    }

    effectDependsOn(notifier: UpdateNotifier): this {
      notifier.bind(() => this.#_eventEmitter.emit(this.#_eventUUID));
      return this;
    }
  };
}
