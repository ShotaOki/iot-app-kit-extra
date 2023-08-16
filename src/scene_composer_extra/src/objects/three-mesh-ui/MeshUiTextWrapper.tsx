import { ExtraObjectWrapper } from "../ExtraObjectWrapper";
import { Color, Scene } from "three/src/Three";
import ThreeMeshUI from "three-mesh-ui";
import { degToRad } from "three/src/math/MathUtils";
import { AnimationParameter } from "../../types/DataType";
import { FontData } from "../../types/MeshUiFont";

export interface MeshUiButtonColor {
  backgroundColor: Color;
  fontColor: Color;
}

export interface MeshUiTextParameter {
  // モデルを配置するルートシーン
  rootScene: Scene;
  // モーションの表示アングル(ヨー方向、単位はDegree)
  angle?: number;
  // テキスト
  content: string;
  // フォントデータ
  font?: FontData;
}
export class MeshUiTextWrapper extends ExtraObjectWrapper {
  private _text?: ThreeMeshUI.Text;
  private _onAnimatingEvent?: (text: ThreeMeshUI.Text) => void;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MeshUiTextParameter) {
    // 自身のインスタンスの参照を保持
    const that = this;

    const font = parameter.font ?? FontData.default();

    /** コンテナを作成、フォントを設定する */
    const container = new ThreeMeshUI.Block({
      justifyContent: "center",
      contentDirection: "row-reverse",
      fontFamily: font.familiy,
      fontTexture: font.texture,
      fontSize: 0.07,
      padding: 0.02,
      borderRadius: 0.11,
      width: 1.0,
      height: 0.2,
      backgroundColor: new Color(0x222222),
      backgroundOpacity: 1.0,
    });

    /** 位置を元のタグの位置に合わせる */
    container.position.copy(that._position);
    container.rotation.copy(that._rotate);
    container.rotation.y = degToRad(parameter.angle ?? 0);
    parameter.rootScene.add(container);

    /** テキストを作成する */
    const text = new ThreeMeshUI.Text({ content: parameter.content });
    container.add(text);

    this._text = text;

    return this;
  }

  /** イベント: アニメーションループが実行された */
  onAnimating(animatingEvent: (text: ThreeMeshUI.Text) => void) {
    this._onAnimatingEvent = animatingEvent;
    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    if (this._onAnimatingEvent && this._text) {
      this._onAnimatingEvent(this._text);
    }
  }
}
