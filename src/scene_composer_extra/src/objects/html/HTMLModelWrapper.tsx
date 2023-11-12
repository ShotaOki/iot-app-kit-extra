import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer";
import { renderToStaticMarkup } from "react-dom/server";
import { AnimationParameter } from "../../types/DataType";
import { Clock } from "three/src/Three";
import { MixinBillboard } from "../../mixin/MixinBillboard";

// 動的な更新が可能なコンテンツ
export type DynamicDrawing = () => JSX.Element;

// このラッパの初期化パラメータ:
// 子クラスの引数として利用できないものを除いたパラメータを指定する
export interface HTMLModelParameterBaseInterface extends ModelParameterBase {
  // 更新周期: 単位: 秒
  updateSpan?: number;
  // ビルボード
  isBillboard?: boolean;
}

// このラッパの初期化パラメータ:
// 子クラスの引数として利用できないものを定義する
export interface HTMLModelParameter extends HTMLModelParameterBaseInterface {
  // JSX形式のエレメント
  element: JSX.Element | DynamicDrawing;
}

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObject = /** */
MixinBillboard( // 必ずこちら側にオブジェクトを向ける
  ExtraObjectWrapper
);

export class HTMLModelWrapper extends MixinExtraObject {
  // Webサイトの管理インスタンス
  private _website?: CSS3DObject;
  // JSXのエレメント
  private _element?: DynamicDrawing;
  // 時間計測用のクロック
  private _clock?: Clock;
  // 経過時間
  private _deltaTime: number = 0;
  // 更新周期
  private _updateSpan: number = 1.0;

  /** デフォルトのスケール: スケール未指定時に設定する */
  get defaultScale() {
    return 0.0025;
  }

  /**
   * レンダラを初期化する
   *
   * @returns CSS3DRenderer
   */
  static initiate(
    renderer: CSS3DRenderer,
    width: number,
    height: number,
    top: number,
    left: number
  ) {
    HTMLModelWrapper.updateSize(renderer, width, height, top, left);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(renderer.domElement);
    return renderer;
  }
  static updateSize(
    renderer: CSS3DRenderer,
    width: number,
    height: number,
    top: number,
    left: number
  ) {
    renderer.setSize(width, height);
    renderer.domElement.style.top = `${top.toFixed(0)}px`;
    renderer.domElement.style.left = `${left.toFixed(0)}px`;
  }
  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: HTMLModelParameter) {
    // レンダリング関数を作成する
    if (typeof parameter.element == "function") {
      // 引数として受け取ったレンダリング関数を格納する
      this._element = parameter.element;
    } else {
      // 引数として受け取ったJSXを固定値として格納する
      //@ts-ignore
      this._element = () => {
        return parameter.element;
      };
    }

    // Webサイトを作成する
    const website = new CSS3DObject(document.createElement("div"));
    if (this._element) {
      website.element.innerHTML = renderToStaticMarkup(this._element());
    }

    // 変数を保持する
    this._website = website;
    this._clock = new Clock();
    this._deltaTime = 0;
    this._updateSpan = parameter.updateSpan ?? 1.0;

    /** 位置を元のタグの位置に合わせる */
    this.applyAttitude(website, parameter);
    /** 画面に配置する */
    this.add(website);

    // 画面をこちら側に向ける
    this._billboardInitialize({
      isEnabled: parameter.isBillboard ?? false,
      target: website,
    });

    return this;
  }

  /**
   * 更新する
   * element: 更新後のJSX Element、未指定の場合は前回と同じJSXで更新をかける
   */
  public update(element?: JSX.Element | DynamicDrawing) {
    // 入力があれば新しい情報に更新する
    if (element) {
      if (typeof element == "function") {
        // 動的な更新が可能なコンテンツとして、関数をそのまま設定する
        this._element = element;
      } else {
        // 静的なコンテンツとして登録する
        //@ts-ignore
        this._element = () => {
          return element;
        };
      }
    }
    // レコードを更新する
    if (this._element && this._website) {
      this._website.element.innerHTML = renderToStaticMarkup(this._element());
    }
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    this._deltaTime += this._clock?.getDelta() ?? 0;
    if (this._deltaTime >= this._updateSpan) {
      this._deltaTime = 0;
      // 更新周期ごとに画面を更新する
      this.update();
    }
  }
}
