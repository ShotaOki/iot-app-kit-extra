import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import { Texture, TextureLoader } from "three/src/Three";
import ThreeMeshUI from "three-mesh-ui";
import { MixinLoadObserver } from "../../mixin/MixinLoadObserver";
import { MixinBillboard } from "../../mixin/MixinBillboard";

const IMAGE_LOADED_KEY = "imageLoaded";

export interface ImageModelParameter extends ModelParameterBase {
  // 画像のファイルパス
  imagePath: string | string[];
  // 画像の幅
  width: number;
  // 画像の高さ
  height: number;
  // ビルボード
  isBillboard?: boolean;
}

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObject = /** */
MixinLoadObserver( // ローディングの完了を監視する
MixinBillboard( // 必ずこちら側を向くビルボード機能を定義する
  ExtraObjectWrapper
));

/**
 * 2D画像、または2D画像の配列を表示するクラス
 */
export class ImageModelWrapper extends MixinExtraObject {
  private _imageBlock: any;

  private _textureList: Texture[] = [];

  private _textureIndex: number = 0;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: ImageModelParameter) {
    // 読み込みの完了を監視する
    this._loadObserverInitiate({ requiredParameter: [IMAGE_LOADED_KEY] });

    // パネルを作成する
    const imageBlock: any = new ThreeMeshUI.Block({
      height: parameter.height,
      width: parameter.width,
    });
    this._imageBlock = imageBlock;

    // 画像の表示位置を補正する
    this.applyAttitude(imageBlock, parameter);

    /** 画面に配置する */
    this.add(imageBlock);

    // 画像を表示する
    this.setImage(parameter.imagePath);

    // 必ずこちら側を向く機能を定義する
    this._billboardInitialize({
      isEnabled: parameter.isBillboard ?? false,
      target: imageBlock,
    });

    return this;
  }

  /**
   * テクスチャのインデックスを取得する
   */
  get textureIndex() {
    return this._textureIndex;
  }

  /**
   * テクスチャの枚数を取得する
   */
  get textureCounts() {
    return this._textureList.length;
  }

  /**
   * 次の画像を表示する
   */
  showNextImage() {
    this.setIndex(this.textureIndex + 1);
  }

  /**
   * 前の画像を表示する
   */
  showBeforeImage() {
    this.setIndex(this.textureIndex - 1);
  }

  /**
   * 画像データをクリアする
   */
  clearImage() {
    if (this._imageBlock) {
      // 表示画像をクリアする
      this._imageBlock.set({
        backgroundTexture: null,
      });
    }
    // テクスチャを破棄する
    for (let texture of this._textureList) {
      texture.dispose();
    }
    // 変数を初期化する
    this._textureIndex = 0;
    this._textureList = [];
  }

  /**
   * 表示画像のインデックスを設定する
   * @param imageIndex 画像の表示インデックス
   */
  setIndex(imageIndex: number) {
    if (this._textureList && this._textureList.length >= 1) {
      // 画像を取得できる有効範囲内かを判定する
      this._textureIndex = Math.min(
        Math.max(imageIndex, 0),
        this._textureList.length - 1
      );
      // 有効範囲内であれば、画像のインデックスを設定する
      this._imageBlock.set({
        backgroundTexture: this._textureList[this._textureIndex],
      });
    }
  }

  /**
   * 画像、または画像の配列を登録する
   * @param imagePath 画像のパス
   */
  setImage(imagePath: string[] | string) {
    // ローダーを作成する
    const loader = new TextureLoader();
    const that = this;

    // テクスチャリストを初期化する
    this.clearImage();
    // テクスチャを設定する
    if (typeof imagePath == "string") {
      // 1つのファイルを受け取ったのなら、その画像を表示する
      loader.loadAsync(imagePath).then((texture) => {
        that._textureList = [texture];
        that.setIndex(0);
        that.sendMessageToLoadObserver(IMAGE_LOADED_KEY);
      });
    } else {
      // 配列で受けた画像を全て登録する
      // 先頭画像を表示する
      Promise.all(imagePath.map((path) => loader.loadAsync(path))).then(
        (textureList) => {
          that._textureList = textureList;
          that.setIndex(0);
          that.sendMessageToLoadObserver(IMAGE_LOADED_KEY);
        }
      );
    }
  }
}
