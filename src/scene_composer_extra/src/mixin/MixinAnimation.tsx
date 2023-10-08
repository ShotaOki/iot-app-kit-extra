import { Object3D, Clock } from "three/src/Three";

type Constructor = new (...args: any[]) => {};

export interface AnimationInfo {
  step: number;
  stepEventHandling: number;
  stepEnd: number;
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
// 1秒あたりのFPSを定義する
const FRAME_PER_SECONDS = 60;

/**
 * 対象のクラスにアニメーションを設定するMixin
 */
export function MixinAnimation<TBase extends Constructor>(Base: TBase) {
  return class Animatable extends Base {
    // アニメーションのイベントハンドラ
    _animationHandlerEvent?: () => void;
    _animationClock?: Clock;
    // 拡縮アニメーションのパラメータ
    _scaleAnimation: AnimationInfo = {
      step: 0,
      stepEventHandling: 50,
      stepEnd: 100,
      speed: ANIMATION_STATUS_STOP,
      loop: false,
      value: 1.0,
      handlerFlg: false,
    };

    /** アニメーションを開始する */
    _updateParameterForStart(
      handlerEvent: () => void,
      duration: number,
      loop: boolean = false
    ) {
      if (this._animationClock === undefined) {
        this._animationClock = new Clock();
      }
      const stepEnd = Math.max(Math.floor(duration * FRAME_PER_SECONDS), 1);
      const animation: AnimationInfo = {
        step: ANIMATION_RANGE_START,
        stepEventHandling: (stepEnd - ANIMATION_RANGE_START) / 2,
        stepEnd: stepEnd,
        speed: ANIMATION_STATUS_START,
        value: 1.0,
        loop: loop,
        handlerFlg: true,
      };
      this._animationHandlerEvent = handlerEvent;
      return animation;
    }

    /** アニメーションの進捗状態を計算する */
    _calcAnimation(animation: AnimationInfo, animationStep: number) {
      // アニメーションを進める
      // 1.0 -> 0.0 -> 1.0でアニメーションさせるので、円の半周にマッピングする
      const progress = ((1.0 * animation.step) / animation.stepEnd) * Math.PI;
      animation.value = Math.abs(Math.cos(progress));
      animation.step += animation.speed;
      // アニメーションが最後まで進んだのなら、0に戻る
      if (animation.step >= animation.stepEnd) {
        animation.step = animation.speed * animationStep;
        if (!animation.loop) {
          animation.speed = ANIMATION_STATUS_STOP;
          animation.handlerFlg = true;
        }
      }
      // アニメーションが折り返したのなら、イベントハンドラを実行する
      if (
        animation.handlerFlg &&
        animation.step >= animation.stepEventHandling &&
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

    /** 拡縮アニメーションの実行中であればtrueを返す */
    get isScaleAnimating() {
      if (this._scaleAnimation.speed >= ANIMATION_STATUS_START) {
        return true;
      }
      return false;
    }

    /** 拡縮アニメーションを開始する */
    public startScaleAnimation(
      handlerEvent: () => void,
      duration: number = 1.0,
      loop: boolean = false
    ) {
      this._scaleAnimation = this._updateParameterForStart(
        handlerEvent,
        duration,
        loop
      );
    }

    /** アニメーションループ */
    public executeAnimation(animationController?: Object3D) {
      // アニメーションを実行する
      if (animationController) {
        let animationStep = 1;
        if (this._animationClock) {
          animationStep = Math.floor(
            this._animationClock.getDelta() * FRAME_PER_SECONDS
          );
        }
        // アニメーションを実行する: スケール
        if (this._scaleAnimation.speed >= ANIMATION_STATUS_START) {
          this._scaleAnimation = this._calcAnimation(
            this._scaleAnimation,
            animationStep
          );
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
