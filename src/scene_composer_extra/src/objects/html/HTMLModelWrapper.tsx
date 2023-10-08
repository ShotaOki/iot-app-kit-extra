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

export interface HTMLModelParameter extends ModelParameterBase {
  // JSX形式のエレメント
  element: JSX.Element;
  // 更新周期: 単位: 秒
  updateSpan?: number;
}
export class HTMLModelWrapper extends ExtraObjectWrapper {
  // Webサイトの管理インスタンス
  private _website?: CSS3DObject;
  // JSXのエレメント
  private _element?: JSX.Element;
  // 時間計測用のクロック
  private _clock?: Clock;
  // 経過時間
  private _deltaTime: number = 0;
  // 更新周期
  private _updateSpan: number = 1.0;

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
    // Webサイトを作成する
    const website = new CSS3DObject(document.createElement("div"));
    website.element.innerHTML = renderToStaticMarkup(parameter.element);

    // 変数を保持する
    this._website = website;
    this._element = parameter.element;
    this._clock = new Clock();
    this._deltaTime = 0;
    this._updateSpan = parameter.updateSpan ?? 1.0;

    /** 位置を元のタグの位置に合わせる */
    this.applyAttitude(website, parameter);
    /** 画面に配置する */
    this.add(website);

    return this;
  }

  /** 
   * 更新する 
   * element: 更新後のJSX Element、未指定の場合は前回と同じJSXで更新をかける
   */
  public update(element?: JSX.Element) {
    // 入力があれば新しい情報に更新する
    if (element) {
      this._element = element;
    }
    // レコードを更新する
    if (this._element && this._website) {
      this._website.element.innerHTML = renderToStaticMarkup(this._element);
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
