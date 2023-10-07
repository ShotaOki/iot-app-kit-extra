import { Object3D } from "three/src/Three";

type Constructor = new (...args: any[]) => {};

export interface AnimationInfo {
  step: number;
  speed: number;
  loop: boolean;
  value: number;
  handlerFlg: boolean;
}

// アニメーションの実行速度を定義する
const ANIMATION_STATUS_STOP = 0.0;
const ANIMATION_STATUS_START = 1.0;
// アニメーションの実行範囲を定義する
const ANIMATION_RANGE_START = 0;
const ANIMATION_RANGE_STOP = 100;

/**
 * 対象のクラスにアニメーションを設定するMixin
 */
export function MixinAnimation<TBase extends Constructor>(Base: TBase) {
  return class Animatable extends Base {
    // アニメーションのイベントハンドラ
    _animationHandlerEvent?: () => void;
    // 拡縮アニメーションのパラメータ
    _scaleAnimation: AnimationInfo = {
      step: 0,
      speed: ANIMATION_STATUS_STOP,
      loop: false,
      value: 1.0,
      handlerFlg: false,
    };

    /** アニメーションを開始する */
    _updateParameterForStart(handlerEvent: () => void, loop: boolean = false) {
      const animation: AnimationInfo = {
        step: ANIMATION_RANGE_START,
        speed: ANIMATION_STATUS_START,
        value: 1.0,
        loop: loop,
        handlerFlg: true,
      };
      this._animationHandlerEvent = handlerEvent;
      return animation;
    }

    /** アニメーションの進捗状態を計算する */
    _calcAnimation(animation: AnimationInfo) {
      // 0 ~ 100の幅でアニメーションを進める
      // 1.0 -> 0.0 -> 1.0でアニメーションさせるので、円の半周にマッピングする
      const progress =
        ((1.0 * animation.step) / ANIMATION_RANGE_STOP) * Math.PI;
      animation.value = Math.abs(Math.cos(progress));
      animation.step += animation.speed;
      // アニメーションが最後まで進んだのなら、0に戻る
      if (animation.step >= ANIMATION_RANGE_STOP) {
        animation.step = ANIMATION_RANGE_START;
        if (!animation.loop) {
          animation.speed = ANIMATION_STATUS_STOP;
          animation.handlerFlg = true;
        }
      }
      // アニメーションが折り返したのなら、イベントハンドラを実行する
      if (
        animation.handlerFlg &&
        animation.step >= (ANIMATION_RANGE_STOP - ANIMATION_RANGE_START) / 2 &&
        this._animationHandlerEvent
      ) {
        animation.handlerFlg = false;
        this._animationHandlerEvent();
      }
      return animation;
    }

    /** このクラスのアニメーション設定を初期化する */
    public mixinAnimationInitialize() {
      // 変数に格納、初期化する
      this._scaleAnimation.step = ANIMATION_RANGE_START;
      this._scaleAnimation.speed = ANIMATION_STATUS_STOP;
      this._scaleAnimation.value = 1.0;
      this._scaleAnimation.loop = false;
      this._animationHandlerEvent = undefined;
    }

    /** 拡縮アニメーションを開始する */
    public startScaleAnimation(
      handlerEvent: () => void,
      loop: boolean = false
    ) {
      this._scaleAnimation = this._updateParameterForStart(handlerEvent, loop);
    }

    /** アニメーションループ */
    public executeAnimation(animationController?: Object3D) {
      // アニメーションを実行する
      if (animationController) {
        // アニメーションを実行する: スケール
        if (this._scaleAnimation.speed >= ANIMATION_STATUS_START) {
          this._scaleAnimation = this._calcAnimation(this._scaleAnimation);
        }
        // アニメーションの結果を反映する
        animationController.scale.set(
          this._scaleAnimation.value,
          this._scaleAnimation.value,
          this._scaleAnimation.value
        );
      }
    }
  };
}
