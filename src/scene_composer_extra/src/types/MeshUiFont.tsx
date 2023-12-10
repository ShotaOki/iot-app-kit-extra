import { ThreeMeshUIText } from "../objects/three-mesh-ui/vendor/ThreeMeshUiTextComponent";

export interface FontDataParameter {
  // フォントデータ（JSON）パス
  fontFamily?: string;
  // フォントデータ（MSDF）パス
  fontTexture?: string;
  // フォントデータの画像サイズ
  fontImageSize?: number;
}
export class FontData {
  private _fontFamily: string;
  private _fontTexture: string;
  private _fontImageSize: number;
  constructor(parameter: FontDataParameter) {
    const defaultDomain = "https://raw.githubusercontent.com";
    const path = "felixmariotto/three-mesh-ui/master/examples/assets";
    const fontName = "Roboto-msdf";
    if (parameter.fontFamily) {
      this._fontFamily = parameter.fontFamily;
    } else {
      this._fontFamily = `${defaultDomain}/${path}/${fontName}.json`;
    }
    if (parameter.fontTexture) {
      this._fontTexture = parameter.fontTexture;
    } else {
      this._fontTexture = `${defaultDomain}/${path}/${fontName}.png`;
    }
    if (parameter.fontImageSize) {
      this._fontImageSize = parameter.fontImageSize;
    } else {
      this._fontImageSize = ThreeMeshUIText.defaultFontTextureSize();
    }
  }

  get familiy(): string {
    return this._fontFamily;
  }

  get texture(): string {
    return this._fontTexture;
  }

  get fontImageSize(): number {
    return this._fontImageSize;
  }

  static default() {
    return new FontData({});
  }
}
