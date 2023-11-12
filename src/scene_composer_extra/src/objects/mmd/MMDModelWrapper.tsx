import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import {
  BufferGeometry,
  Material,
  SkinnedMesh,
  AnimationClip,
  Clock,
  Object3D,
} from "three/src/Three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper";
import { AnimationParameter, SystemLoadingStatus } from "../../types/DataType";
import { NoLightingShader } from "../../shader/NoLightingShader";
import { MixinLoadObserver } from "../../mixin/MixinLoadObserver";

export interface MMDModelParameter extends ModelParameterBase {
  // MMDモデルのファイルパス
  pmxPath: string;
  // モーションの読み込みリスト, モーション名: ファイルパス
  useMotionList?: { [key: string]: string };
}
type MMDMesh = SkinnedMesh<BufferGeometry, Material | Material[]>;

/** 状態変更イベント: 状態が変更された */
export type StateChangeEvent = (
  mesh: MMDMesh,
  model: MMDModelWrapper,
  state: string | number
) => string[];

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObject = /** */
MixinLoadObserver( // ローディングの完了を監視する
  ExtraObjectWrapper
);

const MOTION_LOADED_KEY = "motionLoaded";
const MESH_LOADED_KEY = "meshLoaded";

export class MMDModelWrapper extends MixinExtraObject {
  // MMDモデル
  private _mesh?: MMDMesh;
  // 状態変更イベント
  private _stateChange?: StateChangeEvent;
  // アニメーションのマップ
  private _useMotionList?: { [key: string]: AnimationClip };
  // タイマーループ
  private _clock?: Clock;
  // アニメーションヘルパー
  private _animationHelper?: MMDAnimationHelper;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MMDModelParameter) {
    // ローダーを作成する
    const loader = new MMDLoader();
    // アニメーションヘルパー
    const animationHelper = new MMDAnimationHelper({ afterglow: 2.0 });
    this._animationHelper = animationHelper;
    // 自身のインスタンスの参照を保持
    const that = this;
    // 読み込みが完了するまで、ダミーのオブジェクトを保持する
    that._object = new Object3D();
    // 読み込みの完了を検知するオブザーバ
    const requiredParameter = parameter.useMotionList
      ? [MESH_LOADED_KEY, MOTION_LOADED_KEY] // モーション、モデルの両方の読み込みの完了後にOnLoadを実行
      : [MESH_LOADED_KEY]; // モデルの読み込み完了後にOnLoadを実行
    this._loadObserverInitiate({ requiredParameter });
    /** 非同期でMMDモデルを取得する */
    loader.loadAsync(parameter.pmxPath).then((mesh) => {
      // 位置情報、大きさ、回転角度をTwinMakerのタグに合わせる
      this.applyAttitude(mesh, parameter);
      // 影を表示する
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = that._object?.visible ?? true;

      // TwinMakerに合わせてシェーダを補正する
      for (let m of mesh.material as Material[]) {
        // TwinMakerが明るすぎて白飛びするため、MMDに光源の影響を受けないシェーダを使う
        // ※MotionIndicatorComponent用のシェーダを転用したもの
        m.onBeforeCompile = (shader) => {
          shader.fragmentShader = NoLightingShader;
        };
        m.needsUpdate = true;
      }

      // 読み込んだMMDモデルを表示する
      this.add(mesh);
      this._mesh = mesh;

      // 状態を初期化する
      that.stateChange(SystemLoadingStatus.Init);

      // メッシュの登録完了を通知する
      this.sendMessageToLoadObserver(MESH_LOADED_KEY);

      // モーションを読み込む
      if (parameter.useMotionList) {
        const motionKeyList = Object.keys(parameter.useMotionList);
        Promise.all(
          motionKeyList.map(
            (key) =>
              new Promise((resolve) =>
                // アニメーションを非同期で読み込む
                new MMDLoader().loadAnimation(
                  parameter.useMotionList![key],
                  mesh,
                  (animation) => {
                    // 非同期読み込みの完了を通知
                    resolve(animation);
                  }
                )
              )
          )
        )
          .then((results) => {
            const useMotionList: { [key: string]: AnimationClip } = {};
            results.forEach((motion, index) => {
              useMotionList[motionKeyList[index]] = motion as AnimationClip;
            });
            this._flagLoaded = true;
            this._useMotionList = useMotionList;
          })
          .finally(() => {
            // アニメーションの登録完了を通知する
            this.sendMessageToLoadObserver(MOTION_LOADED_KEY);
          });
      } else {
        this._flagLoaded = true;
      }

      // アニメーションを実行する
      that._clock = new Clock();
    });

    return this;
  }

  /**
   * 状態の変更通知を受け取る
   *
   * @param newState 次のオブジェクトの状態
   */
  protected receivedChangeState(newState: string | number) {
    if (this._stateChange && this._mesh && this._animationHelper) {
      const animationNames = this._stateChange(this._mesh!, this, newState);
      // もしアニメーションの戻り値がないのならアニメーションを終了する
      if (!(animationNames && animationNames.length)) {
        if (this._animationHelper) {
          if (this._animationHelper.objects.has(this._mesh)) {
            this._animationHelper.remove(this._mesh);
          }
          return;
        }
      }
      // 戻り値で受け取ったアニメーションを再生する
      if (this._animationHelper && this._useMotionList) {
        const motionList = this._useMotionList;
        if (this._animationHelper.objects.has(this._mesh)) {
          this._animationHelper.remove(this._mesh);
        }
        this._animationHelper?.add(this._mesh, {
          animation: animationNames.map((name) => motionList[name]),
          physics: false,
        });
      }
    }
  }

  /**
   * 状態変更イベントをバインドする
   *
   * @param stateChange 状態変更イベント
   * @returns 自身のオブジェクト（チェイン可能）
   */
  onStateChangeEvent(stateChange: StateChangeEvent) {
    this._stateChange = stateChange;
    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    // アニメーションの状態を更新
    if (this._clock) {
      const delta = this._clock.getDelta();
      if (this._animationHelper) this._animationHelper.update(delta);
    }
  }
}
