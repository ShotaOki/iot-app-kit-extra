import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { Vector3, Euler, Scene, Object3D } from "three/src/Three";
import { AnimationParameter, SystemLoadingStatus } from "../types/DataType";
import { degToRad } from "three/src/math/MathUtils";

export interface ModelParameterVector3 {
  x?: number;
  y?: number;
  z?: number;
  isAbsolute?: boolean;
}

/** モデルの共通パラメータ */
export interface ModelParameterBase {
  // モデルの表示サイズ
  scale?: number;
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
export interface ExtraObjectInterface {
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
}

/** ライブラリ内部で利用できるExtraObjectの情報 */
export class ExtraObjectWrapper implements ExtraObjectInterface {
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
    this._rootScene = parameter.rootScene;
    this._position = parameter.position;
    this._rotate = parameter.rotate;
    this._scale = parameter.scale;
    this._anchor = parameter.anchor;
    this._state = "";
    this._flagLoaded = false;
    this._object = undefined;
    this._parentObject = parameter.parentObject;
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
    if (parameter.scale !== undefined) {
      // スケールの指定があれば反映する
      model.scale.set(parameter.scale, parameter.scale, parameter.scale);
    } else {
      model.scale.copy(this._scale);
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

  /** アニメーションループ */
  callAnimationLoop(parameter: AnimationParameter) {
    this.executeAnimationLoop(parameter);
  }

  /**
   * 状態を変更する
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
    this.receivedChangeState(newState);
  }
}
