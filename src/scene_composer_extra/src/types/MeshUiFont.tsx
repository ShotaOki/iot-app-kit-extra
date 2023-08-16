export interface FontDataParameter {
  // フォントデータ（JSON）パス
  fontFamily?: string;
  // フォントデータ（MSDF）パス
  fontTexture?: string;
}
export class FontData {
  private _fontFamily: string;
  private _fontTexture: string;
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
  }

  get familiy(): string {
    return this._fontFamily;
  }

  get texture(): string {
    return this._fontTexture;
  }

  static default() {
    return new FontData({});
  }
}
