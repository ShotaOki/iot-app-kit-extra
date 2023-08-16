"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontData = void 0;
class FontData {
    constructor(parameter) {
        const defaultDomain = "https://raw.githubusercontent.com";
        const path = "felixmariotto/three-mesh-ui/master/examples/assets";
        const fontName = "Roboto-msdf";
        if (parameter.fontFamily) {
            this._fontFamily = parameter.fontFamily;
        }
        else {
            this._fontFamily = `${defaultDomain}/${path}/${fontName}.json`;
        }
        if (parameter.fontTexture) {
            this._fontTexture = parameter.fontTexture;
        }
        else {
            this._fontTexture = `${defaultDomain}/${path}/${fontName}.png`;
        }
    }
    get familiy() {
        return this._fontFamily;
    }
    get texture() {
        return this._fontTexture;
    }
    static default() {
        return new FontData({});
    }
}
exports.FontData = FontData;
//# sourceMappingURL=MeshUiFont.js.map