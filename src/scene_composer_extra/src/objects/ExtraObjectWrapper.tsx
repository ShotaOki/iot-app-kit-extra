import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { Vector3, Euler, Scene, Object3D } from "three/src/Three";
import { AnimationParameter, SystemLoadingStatus } from "../types/DataType";
import { degToRad } from "three/src/math/MathUtils";

/** モデルの共通パラメータ */
export interface ModelParameterBase {
  // モデルの表示サイズ
  scale?: number;
  // モデルの表示アングル(ヨー方向、単位はDegree)
  angle?: number;
}

export class ExtraObjectWrapper {
  // 表示位置
  protected _position: Vector3;
  // 回転角度
  protected _rotate: Euler;
  // 表示スケール
  protected _scale: Vector3;
  // タグの詳細情報
  public _anchor: IAnchorComponent;
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

  constructor(
    rootScene: Scene,
    position: Vector3,
    rotate: Euler,
    scale: Vector3,
    anchor: IAnchorComponent,
    parentObject?: Object3D
  ) {
    this._rootScene = rootScene;
    this._position = position;
    this._rotate = rotate;
    this._scale = scale;
    this._anchor = anchor;
    this._state = "";
    this._flagLoaded = false;
    this._object = undefined;
    this._parentObject = parentObject;
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

  /** 読み込みの完了フラグ */
  get isLoaded() {
    return this._flagLoaded;
  }

  /** Object3Dのオブジェクトを返却する */
  get object() {
    return this._object;
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
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {}

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

  /**
   * 子クラスで実装: イベント通知関数
   * @param newState 次の状態
   */
  protected receivedChangeState(newState: string | number) {}
}
