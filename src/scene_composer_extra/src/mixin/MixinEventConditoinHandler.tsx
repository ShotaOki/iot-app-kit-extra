import { Constructor } from "./MixinBase";
import {
  EventParameterUpdateCameraAngle,
  isMixinEventNotifierEmitter,
} from "./MixinEventNotifier";

export interface MixinEventConditionHandlerInterface {
  /** 条件付きEmit：カメラが移動していれば対象のクラスに通知する */
  emitUpdateCameraIfNeeded(parameter: EventParameterUpdateCameraAngle): void;
}

export function MixinEventConditionHandler<TBase extends Constructor>(
  Base: TBase
) {
  return class EventCondition
    extends Base
    implements MixinEventConditionHandlerInterface
  {
    // カメラの状態
    #_cameraState: string = "-";

    /** 条件付きemit */
    emitUpdateCameraIfNeeded(parameter: EventParameterUpdateCameraAngle) {
      // カメラが移動していれば通知する
      if (this.#_cameraState != parameter.cameraState) {
        this.#_cameraState = parameter.cameraState;
        if (isMixinEventNotifierEmitter(this)) {
          this.emitUpdateCamera(parameter);
        }
      }
    }
  };
}
