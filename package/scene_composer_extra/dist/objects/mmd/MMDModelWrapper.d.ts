import { ExtraObjectWrapper } from "../ExtraObjectWrapper";
import { Scene, BufferGeometry, Material, SkinnedMesh } from "three/src/Three";
import { AnimationParameter } from "../../types/DataType";
export interface MMDModelParameter {
    rootScene: Scene;
    scale?: number;
    angle?: number;
    pmxPath: string;
    motionMap?: {
        [key: string]: string;
    };
}
type MMDMesh = SkinnedMesh<BufferGeometry, Material | Material[]>;
export interface StateChangeEvent {
    /** 状態変更イベント: 状態が変更された */
    onChangeState: (mesh: MMDMesh, model: MMDModelWrapper, state: string | number) => string[];
}
export declare class MMDModelWrapper extends ExtraObjectWrapper {
    private _mesh?;
    private _stateChange?;
    private _mixier?;
    private _motionMap?;
    private _clock?;
    /**
     * 初期化する
     *
     * @param parameter モデルのパラメータ
     * @returns
     */
    create(parameter: MMDModelParameter): this;
    /**
     * 状態の変更通知を受け取る
     *
     * @param newState 次のオブジェクトの状態
     */
    protected onChangeState(newState: string | number): void;
    /**
     * 状態変更イベントをバインドする
     *
     * @param stateChange 状態変更イベント
     * @returns 自身のオブジェクト（チェイン可能）
     */
    bindOnStateChangeEvent(stateChange: StateChangeEvent): this;
    /** アニメーションループ */
    executeAnimationLoop(parameter: AnimationParameter): void;
}
export {};
