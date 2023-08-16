import { ExtraObjectWrapper } from "../ExtraObjectWrapper";
import { Color, Scene } from "three/src/Three";
import ThreeMeshUI from "three-mesh-ui";
import { AnimationParameter } from "../../types/DataType";
import { FontData } from "../../types/MeshUiFont";
export interface MeshUiButtonColor {
    backgroundColor: Color;
    fontColor: Color;
}
export interface MeshUiTextParameter {
    rootScene: Scene;
    angle?: number;
    content: string;
    font?: FontData;
}
export declare class MeshUiTextWrapper extends ExtraObjectWrapper {
    private _text?;
    private _onAnimatingEvent?;
    /**
     * 初期化する
     *
     * @param parameter モデルのパラメータ
     * @returns
     */
    create(parameter: MeshUiTextParameter): this;
    /** イベント: アニメーションループが実行された */
    onAnimating(animatingEvent: (text: ThreeMeshUI.Text) => void): this;
    /** アニメーションループ */
    executeAnimationLoop(parameter: AnimationParameter): void;
}
