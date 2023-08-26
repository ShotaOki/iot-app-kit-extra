import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import {
  BufferGeometry,
  Material,
  SkinnedMesh,
  AnimationMixer,
  AnimationClip,
  Clock,
} from "three/src/Three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader";
import { CCDIKSolver } from "three/examples/jsm/animation/CCDIKSolver";
import { AnimationParameter, SystemLoadingStatus } from "../../types/DataType";

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

export class MMDModelWrapper extends ExtraObjectWrapper {
  // MMDモデル
  private _mesh?: MMDMesh;
  // 状態変更イベント
  private _stateChange?: StateChangeEvent;
  // アニメーションを管理するミキサー
  private _mixier?: AnimationMixer;
  // アニメーションのマップ
  private _useMotionList?: { [key: string]: AnimationClip };
  // タイマーループ
  private _clock?: Clock;
  // IKのリゾルバ
  private _ikResolver?: CCDIKSolver;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MMDModelParameter) {
    // ローダーを作成する
    const loader = new MMDLoader();
    // 自身のインスタンスの参照を保持
    const that = this;
    /** 非同期でMMDモデルを取得する */
    loader.loadAsync(parameter.pmxPath).then((mesh) => {
      // 位置情報、大きさ、回転角度をTwinMakerのタグに合わせる
      this.applyAttitude(mesh, parameter);
      // 影を表示する
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // アニメーションミキサーを初期化する
      this._mixier = new AnimationMixer(mesh);

      // 発光設定、アウトライン設定をTwinMakerに合わせて補正する
      for (let m of mesh.material as Material[]) {
        let ma: any = m;
        ma.emissive.multiplyScalar(0.1);
        ma.userData.outlineParameters.thickness = 0.001;
        ma.needsUpdate = true;
      }

      // 読み込んだMMDモデルを表示する
      this._rootScene.add(mesh);
      this._mesh = mesh;

      // 状態を初期化する
      that.stateChange(SystemLoadingStatus.Init);

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
        ).then((results) => {
          const useMotionList: { [key: string]: AnimationClip } = {};
          results.forEach((motion, index) => {
            useMotionList[motionKeyList[index]] = motion as AnimationClip;
          });
          try {
            this._ikResolver = new CCDIKSolver(
              mesh,
              mesh.geometry.userData.MMD.iks
            );
          } catch (_) {
            this._ikResolver = undefined;
          }
          this._flagLoaded = true;
          this._useMotionList = useMotionList;
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
    if (this._stateChange && this._mesh && this._mixier) {
      const animationNames = this._stateChange(this._mesh!, this, newState);
      // もしアニメーションの戻り値がないのならアニメーションを終了する
      if (!(animationNames && animationNames.length)) {
        if (this._mixier) {
          this._mixier.stopAllAction();
          return;
        }
      }
      // 戻り値で受け取ったアニメーションを再生する
      if (this._mixier && this._useMotionList) {
        this._mixier.stopAllAction();
        for (let name of animationNames) {
          const motion = this._useMotionList[name];
          this._mixier.clipAction(motion).play();
        }
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
    if (this._ikResolver) {
      this._ikResolver.update();
    }
    // アニメーションの状態を更新
    if (this._clock) {
      const delta = this._clock.getDelta();
      if (this._mixier) this._mixier.update(delta);
    }
  }
}
