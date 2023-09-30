import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import {
  Texture,
  TextureLoader,
  BufferGeometry,
  BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Clock,
} from "three/src/Three";
import { AnimationParameter } from "../../types/DataType";

interface AtrasData {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextureAtrasVideoParameter extends ModelParameterBase {
  // 画像のファイルパス
  imagePath: string;
  // 表示位置データ
  atras: AtrasData[];
  // 画像の幅
  width: number;
  // 画像の高さ
  height: number;
  // アニメーションの実行速度：0でアニメーションしない
  fps?: number;
}

/**
 * 2D画像、または2D画像の配列を表示するクラス
 */
export class TextureAtrasVideoWrapper extends ExtraObjectWrapper {
  private _imageBlock: any;

  private _texture?: Texture;

  private _atras: AtrasData[] = [];
  private _atrasIndex: number = 0;

  private _fps: number = 0;

  private _clock?: Clock;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: TextureAtrasVideoParameter) {
    const POS_LEFT_TOP = [-parameter.width / 2, parameter.height / 2, 0];
    const POS_RIGHT_TOP = [parameter.width / 2, parameter.height / 2, 0];
    const POS_LEFT_BOTTOM = [-parameter.width / 2, -parameter.height / 2, 0];
    const POS_RIGHT_BOTTOM = [parameter.width / 2, -parameter.height / 2, 0];
    const UV_LEFT_TOP = [0, 1]; // x : y + h
    const UV_RIGHT_TOP = [1, 1]; // x + w : y + h
    const UV_LEFT_BOTTOM = [0, 0]; // x : y
    const UV_RIGHT_BOTTOM = [1, 0]; // x + w : y

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array([
          ...POS_LEFT_TOP,
          ...POS_LEFT_BOTTOM,
          ...POS_RIGHT_TOP,
          ...POS_RIGHT_TOP,
          ...POS_LEFT_BOTTOM,
          ...POS_RIGHT_BOTTOM,
        ]),
        3
      )
    );
    geometry.setAttribute(
      "uv",
      new BufferAttribute(
        new Float32Array([
          ...UV_LEFT_TOP,
          ...UV_LEFT_BOTTOM,
          ...UV_RIGHT_TOP,
          ...UV_RIGHT_TOP,
          ...UV_LEFT_BOTTOM,
          ...UV_RIGHT_BOTTOM,
        ]),
        2
      )
    );
    const material = new MeshBasicMaterial({ color: 0xffffff });
    this._imageBlock = new Mesh(geometry, material);

    // 画像の表示位置を補正する
    this.applyAttitude(this._imageBlock, parameter);

    /** 画面に配置する */
    this._rootScene.add(this._imageBlock);

    // 表示データを設定する
    this._atras = parameter.atras;

    // フレームレートを設定する
    this._fps = parameter.fps ?? 0;

    this._clock = new Clock();

    // 画像を表示する
    this.setImage(parameter.imagePath);

    return this;
  }

  get atrasIndex() {
    return this._atrasIndex;
  }

  setAtrasLength() {
    return this._atras.length;
  }

  setAtrasIndex(index: number) {
    this._atrasIndex = Math.max(Math.min(index, this._atras.length - 1), 0);
    const atras = this._atras[this._atrasIndex];
    this.setImageAtras(atras.x, atras.y, atras.w, atras.h);
  }

  setImageAtras(x: number, y: number, w: number, h: number) {
    if (this._imageBlock === undefined) {
      return;
    }

    const UV_LEFT_TOP = [x, y + h]; // x : y + h
    const UV_RIGHT_TOP = [x + w, y + h]; // x + w : y + h
    const UV_LEFT_BOTTOM = [x, y]; // x : y
    const UV_RIGHT_BOTTOM = [x + w, y]; // x + w : y

    this._imageBlock.geometry.setAttribute(
      "uv",
      new BufferAttribute(
        new Float32Array([
          ...UV_LEFT_TOP,
          ...UV_LEFT_BOTTOM,
          ...UV_RIGHT_TOP,
          ...UV_RIGHT_TOP,
          ...UV_LEFT_BOTTOM,
          ...UV_RIGHT_BOTTOM,
        ]),
        2
      )
    );
    this._imageBlock.material.needsUpdate = true;
  }

  /**
   * 画像、または画像の配列を登録する
   * @param imagePath 画像のパス
   */
  setImage(imagePath: string) {
    // 古いテクスチャを破棄する
    if (this._texture !== undefined) {
      this._texture.dispose();
      this._texture = undefined;
    }
    // ローダーを作成する
    const loader = new TextureLoader();
    const that = this;

    loader.loadAsync(imagePath).then((texture) => {
      that._texture = texture;

      this._imageBlock.material.map = texture;
      this._imageBlock.material.needsUpdate = true;
    });
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    // アニメーションの状態を更新
    if (this._clock && this._fps >= 1) {
      const oldTime = this._clock.oldTime;
      const delta = this._clock.getDelta();
      const threash = 1.0 / this._fps;
      if (delta >= threash) {
        const oldIndex = this.atrasIndex;
        this.setAtrasIndex(this.atrasIndex + Math.floor(delta / threash));
        if (oldIndex == this.atrasIndex) {
          this.setAtrasIndex(0);
          this._clock.oldTime = oldTime;
        }
      } else {
        this._clock.oldTime = oldTime;
      }
    }
  }
}
