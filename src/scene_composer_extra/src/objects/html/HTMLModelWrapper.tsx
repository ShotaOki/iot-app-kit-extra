import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer";
import { renderToStaticMarkup } from "react-dom/server";

export interface HTMLModelParameter extends ModelParameterBase {
  element: JSX.Element;
}
export class HTMLModelWrapper extends ExtraObjectWrapper {
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
    // 自身のインスタンスの参照を保持
    const that = this;

    const object = document.createElement("div");
    object.innerHTML = renderToStaticMarkup(parameter.element);
    const website = new CSS3DObject(object);

    /** 位置を元のタグの位置に合わせる */
    this.applyAttitude(website, parameter);
    /** 画面に配置する */
    this._rootScene.add(website);

    return this;
  }
}
