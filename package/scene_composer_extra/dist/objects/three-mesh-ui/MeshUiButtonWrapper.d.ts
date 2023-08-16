import { ExtraObjectWrapper } from "../ExtraObjectWrapper";
import ThreeMeshUI from "three-mesh-ui";
import { AnimationParameter } from "../../types/DataType";
import { Scene, Color } from "three/src/Three";
import { FontData } from "../../types/MeshUiFont";
export interface MeshUiButtonColor {
    backgroundColor: Color;
    fontColor: Color;
}
export interface MeshUiButtonParameter {
    rootScene: Scene;
    angle?: number;
    content: string;
    stateStyle: {
        [style: string]: MeshUiButtonColor;
    };
    width: number;
    height: number;
    font?: FontData;
}
export declare class MeshUiButtonWrapper extends ExtraObjectWrapper {
    private _camera;
    private _objsToTest;
    private _text?;
    private _onClickEvent?;
    private _onAnimatingEvent?;
    /**
     * 初期化する
     *
     * @param parameter モデルのパラメータ
     * @returns
     */
    create(parameter: MeshUiButtonParameter): this;
    /** イベント: クリックを受けた */
    onClickEvent(clickEvent: () => void): this;
    /** イベント: アニメーションループが実行された */
    onAnimating(animatingEvent: (text: ThreeMeshUI.Text) => void): this;
    /** アニメーションループ */
    executeAnimationLoop(parameter: AnimationParameter): void;
    private raycast;
}
