import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { Vector3, Euler } from "three/src/Three";
import { AnimationParameter } from "../types/DataType";
export declare class ExtraObjectWrapper {
    protected _position: Vector3;
    protected _rotate: Euler;
    protected _scale: Vector3;
    _anchor: IAnchorComponent;
    protected _state: string | number;
    protected _flagLoaded: boolean;
    constructor(position: Vector3, rotate: Euler, scale: Vector3, anchor: IAnchorComponent);
    /** 読み込みの完了フラグ */
    get isLoaded(): boolean;
    /** アニメーションループ */
    executeAnimationLoop(parameter: AnimationParameter): void;
    /**
     * 状態を変更する
     * @param newState 次の状態
     */
    stateChange(newState: string | number): void;
    /**
     * 子クラスで実装: イベント通知関数
     * @param newState 次の状態
     */
    protected onChangeState(newState: string | number): void;
}
