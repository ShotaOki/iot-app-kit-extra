import { ExtraObjectWrapper } from "../ExtraObjectWrapper";
import ThreeMeshUI from "three-mesh-ui";
import { degToRad } from "three/src/math/MathUtils";
import { AnimationParameter } from "../../types/DataType";
import { getState } from "../../utility/SceneUtility";
import { Scene, Raycaster, Color, Camera } from "three/src/Three";
import { FontData } from "../../types/MeshUiFont";

export interface MeshUiButtonColor {
  backgroundColor: Color;
  fontColor: Color;
}

export interface MeshUiButtonParameter {
  // モデルを配置するルートシーン
  rootScene: Scene;
  // モーションの表示アングル(ヨー方向、単位はDegree)
  angle?: number;
  // テキスト
  content: string;
  // 状態ごとの表示スタイル
  stateStyle: { [style: string]: MeshUiButtonColor };
  // ボタンの幅
  width: number;
  // ボタンの高さ
  height: number;
  // フォントデータ
  font?: FontData;
}
export class MeshUiButtonWrapper extends ExtraObjectWrapper {
  private _camera: Camera | null = null;
  private _objsToTest: Array<ThreeMeshUI.Block> = [];

  private _text?: ThreeMeshUI.Text;
  private _onClickEvent?: () => void;
  private _onAnimatingEvent?: (text: ThreeMeshUI.Text) => void;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MeshUiButtonParameter) {
    // 自身のインスタンスの参照を保持
    const that = this;
    this._objsToTest = [];

    const font = parameter.font ?? FontData.default();

    /** コンテナを作成、フォントを設定する */
    const container = new ThreeMeshUI.Block({
      justifyContent: "center",
      contentDirection: "row-reverse",
      fontFamily: font.familiy,
      fontTexture: font.texture,
      fontSize: 0.14,
      padding: 0.02,
      borderRadius: 0.11,
      width: 1.0,
      height: 1.0,
      backgroundColor: new Color(0xffffff),
      backgroundOpacity: 0,
    });

    /** 位置を元のタグの位置に合わせる */
    container.position.copy(that._position);
    container.rotation.copy(that._rotate);
    container.rotation.y = degToRad(parameter.angle ?? 0);
    parameter.rootScene.add(container);

    /** ボタンを作成する */
    const button: any = new ThreeMeshUI.Block({
      width: parameter.width,
      height: parameter.height,
      justifyContent: "center",
      offset: 0.05,
      margin: 0.02,
      borderRadius: 0.075,
    });
    const text = new ThreeMeshUI.Text({ content: parameter.content });
    button.add(text);

    /**
     * 状態変更イベントを登録する
     */
    button.setupState({
      state: "selected",
      attributes: {
        offset: 0.02,
        ...parameter.stateStyle["selected"],
      },
      onSet: () => {
        if (that._onClickEvent) {
          that._onClickEvent();
        }
      },
    });
    button.setupState({
      state: "hovered",
      attributes: {
        offset: 0.035,
        backgroundOpacity: 1,
        ...parameter.stateStyle["hovered"],
      },
    });
    button.setupState({
      state: "idle",
      attributes: {
        offset: 0.035,
        backgroundOpacity: 1.0,
        ...parameter.stateStyle["idle"],
      },
    });

    container.add(button);
    that._objsToTest.push(button);
    this._text = text;

    /** カメラを参照する */
    const { camera } = getState(parameter.rootScene);
    that._camera = camera;

    return this;
  }

  /** イベント: クリックを受けた */
  onClickEvent(clickEvent: () => void) {
    this._onClickEvent = clickEvent;
    return this;
  }

  /** イベント: アニメーションループが実行された */
  onAnimating(animatingEvent: (text: ThreeMeshUI.Text) => void) {
    this._onAnimatingEvent = animatingEvent;
    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    if (this._camera && parameter.mouse) {
      parameter.raycaster.setFromCamera(parameter.mouse, this._camera);
      this.raycast(parameter.raycaster, parameter.isSelect);
    }
    if (this._onAnimatingEvent && this._text) {
      this._onAnimatingEvent(this._text);
    }
  }

  private raycast(raycaster: Raycaster, isSelected: boolean) {
    this._objsToTest.forEach((obj) => {
      const target: any = obj;
      if (raycaster.intersectObject(obj, true).length >= 1) {
        if (isSelected) {
          target.setState("selected");
        } else {
          target.setState("hovered");
        }
      } else {
        target.setState("idle");
      }
    });
  }
}
