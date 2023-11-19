import { Object3D, Quaternion } from "three/src/Three";
import { AnimationParameter } from "../types/DataType";
import { Constructor } from "./MixinBase";

// 外部に公開するMixinの関数
export interface BillboardMixinInterface {
  executeBillboardAnimation(
    parameter: AnimationParameter,
    animationController?: Object3D
  ): void;
}

// Mixinの継承判定
export function isBillboardMixinObject(
  object: any
): object is BillboardMixinInterface {
  return "executeBillboardAnimation" in object;
}

export interface MixinBillboardParameter {
  isEnabled: boolean;
  target?: Object3D;
}

/**
 * 常にこちら側に3Dオブジェクトを向けるMixin
 */
export function MixinBillboard<TBase extends Constructor>(Base: TBase) {
  return class Billboard extends Base implements BillboardMixinInterface {
    #_isBillboardEnabled: boolean = false;
    #_billboardTarget?: Object3D;

    _billboardInitialize(parameter: MixinBillboardParameter) {
      this.#_isBillboardEnabled = parameter.isEnabled;
      this.#_billboardTarget = parameter.target;
    }

    /**
     * ワールド座標系の回転情報（クォータニオン）を、一つ親のオブジェクトから見たローカル座標系の回転情報に変換する
     * @param targetObject 回転させたいオブジェクト
     * @param worldRotation ワールド座標系の回転情報
     * @returns ローカル座標系の回転情報
     */
    #_worldQuaternionToLocalRotate(
      targetObject: Object3D,
      worldRotation: Quaternion
    ): Quaternion {
      // 元を確保する
      const worldQuaternion = new Quaternion();
      // 親オブジェクトの回転情報を取得する
      if (targetObject.parent) {
        targetObject.parent.getWorldQuaternion(worldQuaternion);
      } else {
        // もし親オブジェクトがないのなら、それ自体の回転情報を取得する
        targetObject.getWorldQuaternion(worldQuaternion);
      }
      // 逆関数（逆方向の回転）に対してワールド座標系の回転を適用する
      // 回転の差分が残るので、それを返す
      return worldQuaternion.invert().multiply(worldRotation);
    }

    /** アニメーションループ */
    public executeBillboardAnimation(
      parameter: AnimationParameter,
      animationController?: Object3D
    ) {
      if (this.#_isBillboardEnabled) {
        if (this.#_billboardTarget) {
          // もし対象が指定されていれば、そのオブジェクトを回転させる
          this.#_billboardTarget.quaternion.copy(
            this.#_worldQuaternionToLocalRotate(
              this.#_billboardTarget,
              parameter.cameraAngle
            )
          );
        } else if (animationController) {
          // 指定されていないのなら、ベースのオブジェクトを回転させる
          animationController.quaternion.copy(
            this.#_worldQuaternionToLocalRotate(
              animationController,
              parameter.cameraAngle
            )
          );
        }
      }
    }
  };
}
