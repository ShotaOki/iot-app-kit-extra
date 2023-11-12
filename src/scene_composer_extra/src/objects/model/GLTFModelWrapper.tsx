import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import { AnimationMixer, Clock } from "three/src/Three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AnimationParameter, SystemLoadingStatus } from "../../types/DataType";
import { MixinLoadObserver } from "../../mixin/MixinLoadObserver";

const GLTF_LOADED_KEY = "gltfLoaded";

export interface GLTFModelParameter extends ModelParameterBase {
  // GLBモデルのファイルパス
  modelPath: string;
  // モーションの読み込みリスト, モーション名: ファイルパス
  useMotionList?: { [key: string]: string };
}

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObject = /** */
MixinLoadObserver( // ローディングの完了を監視する
  ExtraObjectWrapper
);

export class GLTFModelWrapper extends MixinExtraObject {
  // アニメーションを管理するミキサー
  private _mixier?: AnimationMixer;
  // タイマーループ
  private _clock?: Clock;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: GLTFModelParameter) {
    // ローダーを作成する
    const loader = new GLTFLoader();
    // 読み込みの完了を監視する
    this._loadObserverInitiate({ requiredParameter: [GLTF_LOADED_KEY] });
    // 自身のインスタンスの参照を保持
    const that = this;
    /** 非同期でGLTFモデルを取得する */
    loader.loadAsync(parameter.modelPath).then((mesh) => {
      // 読み取ったモデルを参照する
      const animations = mesh.animations;
      const model = mesh.scene;
      // 位置情報、大きさ、回転角度をTwinMakerのタグに合わせる
      this.applyAttitude(model, parameter);
      // 影を表示する
      model.castShadow = true;
      model.receiveShadow = true;

      // 読み込んだMMDモデルを表示する
      this.add(model);

      // 状態を初期化する
      that.stateChange(SystemLoadingStatus.Init);

      // 読み込みの完了を通知する
      this.sendMessageToLoadObserver(GLTF_LOADED_KEY);

      // モデルにアニメーションが登録されているのなら
      if (animations.length >= 1) {
        // アニメーションミキサーを初期化する
        this._mixier = new AnimationMixer(model);

        // アニメーションを実行する
        that._clock = new Clock();
        this._mixier.clipAction(animations[0]).play();
      }
    });

    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    // アニメーションの状態を更新
    if (this._clock) {
      const delta = this._clock.getDelta();
      if (this._mixier) this._mixier.update(delta);
    }
  }
}
