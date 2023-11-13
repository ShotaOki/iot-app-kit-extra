import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { Vector3, Euler, Scene, Object3D } from "three/src/Three";
import { AnimationParameter, SystemLoadingStatus } from "../types/DataType";
import { degToRad } from "three/src/math/MathUtils";
import { isBillboardMixinObject } from "../mixin/MixinBillboard";
import { isLoadObserverMixinObject } from "../mixin/MixinLoadObserver";
import {
  MixinEventNotifier,
  MixinEventNotifierEmitter,
  MixinEventNotifierInterface,
} from "../mixin/MixinEventNotifier";

/** 位置の絶対/相対値指定 */
export interface ModelParameterVector3 {
  x?: number;
  y?: number;
  z?: number;
  isAbsolute?: boolean;
}

/** スケールの絶対/相対値指定 */
export interface ModelParameterScaler {
  scaler: number;
  isAbsolute?: boolean;
}

/** スケールがModelParameterScaleで定義されたのならTrueを返す */
export function isModelParameterScaler(
  object: any
): object is ModelParameterScaler {
  return object !== undefined && "scaler" in object;
}

/** モデルの共通パラメータ */
export interface ModelParameterBase {
  // モデルの表示サイズ
  scale?: number | ModelParameterScaler;
  // モデルの表示アングル(ヨー方向、単位はDegree)
  angle?: number;
  // 位置座標
  position?: ModelParameterVector3;
}

export interface ExtraObjectWrapperParameter {
  // ルートシーン
  rootScene: Scene;
  // 表示位置
  position: Vector3;
  // 回転: 単位はDegree
  rotate: Euler;
  // 拡大縮小
  scale: Vector3;
  // オブジェクトの表示情報
  anchor: IAnchorComponent;
  // オプション: 親オブジェクト（未設定であればルートシーンを親とする）
  parentObject?: Object3D;
}

/**
 * 外部から呼び出し可能なExtraObjectの情報
 */
export interface ExtraObjectInterface
  extends MixinEventNotifierInterface,
    MixinEventNotifierEmitter {
  /** 読み込みの完了フラグ */
  get isLoaded(): boolean;
  /** Object3Dのオブジェクトを返却する */
  get object(): Object3D | undefined;
  /** タグの詳細情報を取得する */
  get anchor(): IAnchorComponent;
  /** アニメーションループの実行 */
  callAnimationLoop(parameter: AnimationParameter): void;
  /** 状態の変更 */
  stateChange(newState: string | number): void;
  /** create完了通知関数 */
  awake(): void;
}

/** ライブラリ内部で利用できるExtraObjectの情報 */
export class ExtraObjectWrapper
  extends MixinEventNotifier(Object)
  implements ExtraObjectInterface
{
  // 表示位置
  protected _position: Vector3;
  // 回転角度
  protected _rotate: Euler;
  // 表示スケール
  protected _scale: Vector3;
  // タグの詳細情報
  protected _anchor: IAnchorComponent;
  // クラウドと同期したモデルの状態
  protected _state: string | number;
  // 読み込み完了フラグ
  protected _flagLoaded: boolean;
  // ルートシーン
  protected _rootScene;
  // オブジェクト
  protected _object: Object3D | undefined;
  // オプション: 親オブジェクト（未設定であればルートシーンを親とする）
  protected _parentObject: Object3D | undefined;

  constructor(parameter: ExtraObjectWrapperParameter) {
    super();
    this._rootScene = parameter.rootScene;
    this._position = parameter.position;
    this._rotate = parameter.rotate;
    this._scale = parameter.scale;
    this._anchor = parameter.anchor;
    this._state = "";
    this._flagLoaded = false;
    this._object = undefined;
    this._parentObject = parameter.parentObject;
    this.eventNotifierInitialize();
  }

  /** 子オブジェクトを追加する */
  protected add(child: Object3D) {
    this._object = child;
    if (this._parentObject) {
      // 親グループが設定されていれば、親グループに配置する
      this._parentObject?.add(child);
    } else {
      // 親グループがなければ、ルートシーンに直接配置する
      this._rootScene.add(child);
    }
  }

  /**
   * TwinMakerの表示データを参照する
   *
   * @param model 適用先のモデル
   * @param parameter プログラムで設定されたパラメータ
   */
  protected applyAttitude(model: Object3D, parameter: ModelParameterBase) {
    // 位置情報、大きさ、回転角度をTwinMakerのタグに合わせる
    model.position.copy(this._position);
    model.rotation.copy(this._rotate);
    if (parameter.angle !== undefined) {
      // 角度の指定があれば反映する
      model.rotation.set(
        model.rotation.x,
        degToRad(parameter.angle),
        model.rotation.z
      );
    }
    if (parameter.scale !== undefined && typeof parameter.scale == "number") {
      // 数値で直接スケールの指定があれば絶対値として反映する
      model.scale.set(parameter.scale, parameter.scale, parameter.scale);
    } else if (isModelParameterScaler(parameter.scale)) {
      let scaleMultiply = this.defaultScale;
      if (parameter.scale.isAbsolute ?? false) {
        // スケールの絶対値指定があれば反映する
        scaleMultiply = 1.0;
      }
      // スカラーを反映する
      model.scale.set(
        scaleMultiply * parameter.scale.scaler,
        scaleMultiply * parameter.scale.scaler,
        scaleMultiply * parameter.scale.scaler
      );
    } else {
      // スケールが未指定であれば反映する
      model.scale.set(
        this.defaultScale * this._scale.x,
        this.defaultScale * this._scale.y,
        this.defaultScale * this._scale.z
      );
    }
    if (parameter.position !== undefined) {
      // 絶対位置指定: trueであればタグの位置に関わらず指定する
      // ※グループの場合は必ず相対になる
      const isAbsolute = parameter.position.isAbsolute ?? false;
      if (isAbsolute) {
        // 位置の指定があれば絶対位置として反映する
        model.position.set(
          parameter.position.x ?? 0.0,
          parameter.position.y ?? 0.0,
          parameter.position.z ?? 0.0
        );
      } else {
        // 相対位置指定: trueであればタグの位置からの相対位置を指定する
        // ※グループの場合は必ず相対になる
        // 位置の指定があれば相対位置として反映する
        model.position.set(
          (parameter.position.x ?? 0.0) + this._position.x,
          (parameter.position.y ?? 0.0) + this._position.y,
          (parameter.position.z ?? 0.0) + this._position.z
        );
      }
    }
  }

  /// -------------------
  /// 継承可能な関数
  /// -------------------

  /** アニメーションループ */
  protected executeAnimationLoop(parameter: AnimationParameter) {}

  /**
   * 子クラスで実装: イベント通知関数
   * @param newState 次の状態
   */
  protected receivedChangeState(newState: string | number) {}

  /// -------------------
  /// SceneController、親グループから呼び出し可能な関数
  /// -------------------

  /** タグの詳細情報 */
  get anchor(): IAnchorComponent {
    return this._anchor;
  }

  /** 読み込みの完了フラグ */
  get isLoaded() {
    return this._flagLoaded;
  }

  /** Object3Dのオブジェクトを返却する */
  get object() {
    return this._object;
  }

  /** デフォルトのスケール: オブジェクトによって異なる */
  get defaultScale() {
    return 1.0;
  }

  /**
   * アニメーションループ
   * onTickで通知する
   */
  callAnimationLoop(parameter: AnimationParameter) {
    this.executeAnimationLoop(parameter);
    // Tickの通知関数を呼び出す
    this.emitTick();
    // MixinでBillboardを継承しているのなら、MixinのAwakeを呼び出す
    if (isBillboardMixinObject(this)) {
      this.executeBillboardAnimation(parameter, this.object);
    }
  }

  /**
   * 状態を変更する
   * onUpdateStateで通知する
   * @param newState 次の状態
   */
  stateChange(newState: string | number) {
    // 同じ状態であれば処理をしない
    if (this._state === newState) {
      return;
    }
    // 初期化完了は読み込みの完了前であっても受け入れる
    if (newState === SystemLoadingStatus.Init) {
      this._state = newState;
      return;
    }
    // 読み込みが完了していないのなら状態を更新しない
    if (!this._flagLoaded) {
      return;
    }
    // 状態を更新する
    this._state = newState;
    // 状態の変更を通知する
    this.emitUpdateState(newState);
    // 子クラスに状態の変更を伝達する
    this.receivedChangeState(newState);
  }

  /**
   * create完了通知関数
   * onLoadで通知する
   */
  awake() {
    // MixinでLoadObserverを継承しているのなら、MixinのAwakeを呼び出す
    if (isLoadObserverMixinObject(this)) {
      this._loadObserverAwake();
    } else {
      // onLoadを実行する
      // 実行する必要がないのなら、子クラスでoverrideする
      this.emitOnLoad();
    }
  }
}
