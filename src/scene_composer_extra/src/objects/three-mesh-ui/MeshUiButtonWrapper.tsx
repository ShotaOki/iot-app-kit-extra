import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import ThreeMeshUI from "three-mesh-ui";
import { AnimationParameter } from "../../types/DataType";
import { getState } from "../../utility/SceneUtility";
import { Raycaster, Color, Camera, TextureLoader } from "three/src/Three";
import { FontData } from "../../types/MeshUiFont";

export interface MeshUiButtonColor {
  backgroundColor: Color;
  fontColor: Color;
}

export interface MeshUiButtonFileContents {
  filePath: string;
}

export interface MeshUiButtonParameter extends ModelParameterBase {
  // テキスト, またはコンテンツ
  content: string | MeshUiButtonFileContents;
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

  private _content?: any;
  private _onClickEvent?: () => void;
  private _onAnimatingEvent?: (text: MeshUiButtonWrapper) => void;

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
    this.applyAttitude(container, parameter);
    /** シーンに配置する */
    this._rootScene.add(container);

    /** ボタンを作成する */
    const button: any = new ThreeMeshUI.Block({
      width: parameter.width,
      height: parameter.height,
      justifyContent: "center",
      offset: 0.05,
      margin: 0.02,
      borderRadius: 0.075,
    });

    /** コンテンツの内容に合わせてデータを設定する */
    if (typeof parameter.content === "string") {
      this._content = new ThreeMeshUI.Text({});
    } else {
      this._content = new ThreeMeshUI.InlineBlock({});
    }
    this.setContent(parameter.content);
    button.add(this._content);

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

    /** カメラを参照する */
    const { camera } = getState(this._rootScene);
    that._camera = camera;

    return this;
  }

  /** イベント: クリックを受けた */
  onClickEvent(clickEvent: () => void) {
    this._onClickEvent = clickEvent;
    return this;
  }

  /** イベント: アニメーションループが実行された */
  onAnimating(animatingEvent: (text: MeshUiButtonWrapper) => void) {
    this._onAnimatingEvent = animatingEvent;
    return this;
  }

  get content() {
    // 設定先のコンテンツがなければ処理を終了する
    if (this._content === undefined) return;
    try {
      // コンテンツを取得する
      return this._content.content;
    } catch {
      // 取得できないのならundefinedを返す
      return undefined;
    }
  }

  /**
   * コンテンツを更新する
   */
  setContent(content: string | MeshUiButtonFileContents) {
    // 設定先のコンテンツがなければ処理を終了する
    if (this._content === undefined) return;
    // データを更新する
    if (typeof content === "string") {
      // テキストコンテンツを更新する
      this._content.set({
        content,
      });
    } else {
      // テクスチャ画像を更新する
      const loader = new TextureLoader();
      loader.loadAsync(content.filePath).then((texture) => {
        this._content.set({
          backgroundTexture: texture,
        });
      });
    }
  }

  /**
   * コンテンツを直接設定する
   */
  set(jsonData: any) {
    // 設定先のコンテンツがなければ処理を終了する
    if (this._content === undefined) return;
    // データを更新する
    this._content.set(jsonData);
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    if (this._camera && parameter.mouse) {
      parameter.raycaster.setFromCamera(parameter.mouse, this._camera);
      this.raycast(parameter.raycaster, parameter.isSelect);
    }
    if (this._onAnimatingEvent && this._content !== undefined) {
      this._onAnimatingEvent(this);
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
