import { generateUUID } from "three/src/math/MathUtils";
import { UpdateNotifier } from "../types/SceneState";
import { Constructor } from "./MixinBase";
import { EventEmitter } from "events";
import { Primitive } from "@iot-app-kit/core";
import { Matrix4 } from "three";

const EventName = {
  // 基底クラスで実装
  LOAD: "load", // 読み込みを完了した: 標準イベント
  TICK: "tick", // レンダリングされた: 標準イベント
  VISIBLE: "visible", // 表示状態を更新した: 標準イベント
  HIDE: "hide", // 表示状態を更新した: 標準イベント
  UPDATE_STATE: "updateState", // 状態を更新した: 標準イベント
  UPDATE_VALUE: "updateValue", // 値を更新した: 標準イベント
  UPDATE_CAMERA: "updateCamera", // カメラの状態を更新した: 標準イベント
  // 操作可能なクラスで実装
  CLICK: "click", // クリック操作を受けた: 標準イベント
};

export interface EventParameterUpdateState {
  state: string | number;
}

export interface EventParameterUpdateValue {
  values: Record<string, Primitive>;
}

export interface EventParameterUpdateCameraAngle {
  cameraState: string;
  matrix: Matrix4;
}

interface EventParameterBase {
  self: any;
  tagName: string;
  breadcrumb: string;
  rootScene: any;
}

export type CreateEventValueParameter =
  | EventParameterUpdateState
  | EventParameterUpdateValue
  | EventParameterUpdateCameraAngle
  | undefined;

export interface EventParameter
  extends EventParameterBase,
    Partial<EventParameterUpdateState>,
    Partial<EventParameterUpdateValue>,
    Partial<EventParameterUpdateCameraAngle> {}

// 受信関数
export interface MixinEventNotifierObserver {
  createParameter(value: any): any;
  /** 読み込みが完了したことを通知する関数 */
  observerLoad(receiver: (parameter: any) => void): void;
  /** 状態が変更されたことを通知する関数 */
  observerUpdateState(receiver: (parameter: any) => void): void;
  /** 値が変更されたことを通知する関数 */
  observerUpdateValue(receiver: (parameter: any) => void): void;
  /** カメラの表示範囲が変更されたことを通知する関数 */
  observerUpdateCameraAngle(receiver: (parameter: any) => void): void;
  /** 画面の状態が更新されたことを通知する関数 */
  observerTick(receiver: (parameter: any) => void): void;
  /** effectDependsOnで設定した更新通知クラスが更新された */
  observerEffect(receiver: (parameter: any) => void): void;
  /** useSceneStateで取得する更新通知クラス */
  observerEffectDependsOn(notifier: UpdateNotifier): void;
  /** 表示状態が表示に変わった時に通知する関数 */
  observerVisible(receiver: (parameter: any) => void): void;
  /** 表示状態が非表示に変わった時に通知する関数 */
  observerHide(receiver: (parameter: any) => void): void;
  /** クリック操作を受けたときに通知する関数 */
  observerClick(receiver: (parameter: any) => void): void;
}

// 受信関数
export interface EventNotifierInterface<S, T> {
  createParameter(value: any): S;
  /** 読み込みが完了したことを通知する関数 */
  onLoad(receiver: (parameter: S) => void): T;
  /** 状態が変更されたことを通知する関数 */
  onUpdateState(receiver: (parameter: S) => void): T;
  /** 値が変更されたことを通知する関数 */
  onUpdateValue(receiver: (parameter: S) => void): T;
  /** カメラの表示範囲が変更されたことを通知する関数 */
  onUpdateCameraAngle(receiver: (parameter: S) => void): T;
  /** 画面の状態が更新されたことを通知する関数 */
  onTick(receiver: (parameter: S) => void): T;
  /** effectDependsOnで設定した更新通知クラスが更新された */
  onEffect(receiver: (parameter: S) => void): T;
  /** useSceneStateで取得する更新通知クラス */
  effectDependsOn(notifier: UpdateNotifier): T;
  /** 表示状態が表示に変わった時に通知する関数 */
  onVisible(receiver: (parameter: S) => void): T;
  /** 表示状態が非表示に変わった時に通知する関数 */
  onHide(receiver: (parameter: S) => void): T;
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
    "emitHide" in object &&
    "emitUpdateValue" in object &&
    "emitUpdateCamera" in object &&
    "emitClick" in object
  );
}

// 発行関数
export interface MixinEventNotifierEmitter {
  emitOnLoad(): void;
  emitUpdateState(parameter: EventParameterUpdateState): void;
  emitUpdateValue(parameter: EventParameterUpdateValue): void;
  emitUpdateCamera(parameter: EventParameterUpdateCameraAngle): void;
  emitTick(): void;
  emitVisible(): void;
  emitHide(): void;
  emitClick(): void;
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

    createParameter(
      value: CreateEventValueParameter = undefined,
      event?: EventParameter
    ): EventParameter {
      const parameter: EventParameter = event ?? {
        self: this,
        tagName: "",
        breadcrumb: "",
        rootScene: null,
        ...(value ?? {}),
      };
      return parameter;
    }

    emitUpdateState(parameter: EventParameterUpdateState): void {
      this.#_eventEmitter.emit(
        EventName.UPDATE_STATE,
        this.createParameter(parameter)
      );
    }

    emitTick(): void {
      this.#_eventEmitter.emit(EventName.TICK, this.createParameter());
    }

    emitOnLoad() {
      this.#_eventEmitter.emit(EventName.LOAD, this.createParameter());
    }

    emitVisible(): void {
      this.#_eventEmitter.emit(EventName.VISIBLE, this.createParameter());
    }

    emitHide(): void {
      this.#_eventEmitter.emit(EventName.HIDE, this.createParameter());
    }

    emitUpdateValue(parameter: EventParameterUpdateValue): void {
      this.#_eventEmitter.emit(
        EventName.UPDATE_VALUE,
        this.createParameter(parameter)
      );
    }

    emitUpdateCamera(parameter: EventParameterUpdateCameraAngle): void {
      this.#_eventEmitter.emit(
        EventName.UPDATE_CAMERA,
        this.createParameter(parameter)
      );
    }

    emitClick(): void {
      this.#_eventEmitter.emit(EventName.CLICK, this.createParameter());
    }

    observerUpdateState(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.UPDATE_STATE, receiver);
    }

    observerTick(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.TICK, receiver);
    }

    observerLoad(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.LOAD, receiver);
    }

    observerEffect(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(this.#_eventUUID, receiver);
    }

    observerVisible(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.VISIBLE, receiver);
    }

    observerHide(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.HIDE, receiver);
    }

    observerEffectDependsOn(notifier: UpdateNotifier): void {
      notifier.bind(() => this.#_eventEmitter.emit(this.#_eventUUID));
    }

    observerUpdateValue(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.UPDATE_VALUE, receiver);
    }

    observerUpdateCameraAngle(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.UPDATE_CAMERA, receiver);
    }

    observerClick(receiver: (parameter: any) => void): void {
      this.#_eventEmitter.on(EventName.CLICK, receiver);
    }
  };
}
