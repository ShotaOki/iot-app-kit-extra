"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshUiTextWrapper = void 0;
const ExtraObjectWrapper_1 = require("../ExtraObjectWrapper");
const Three_1 = require("three/src/Three");
const three_mesh_ui_1 = __importDefault(require("three-mesh-ui"));
const MathUtils_1 = require("three/src/math/MathUtils");
const MeshUiFont_1 = require("../../types/MeshUiFont");
class MeshUiTextWrapper extends ExtraObjectWrapper_1.ExtraObjectWrapper {
    /**
     * 初期化する
     *
     * @param parameter モデルのパラメータ
     * @returns
     */
    create(parameter) {
        var _a, _b;
        // 自身のインスタンスの参照を保持
        const that = this;
        const font = (_a = parameter.font) !== null && _a !== void 0 ? _a : MeshUiFont_1.FontData.default();
        /** コンテナを作成、フォントを設定する */
        const container = new three_mesh_ui_1.default.Block({
            justifyContent: "center",
            contentDirection: "row-reverse",
            fontFamily: font.familiy,
            fontTexture: font.texture,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
            width: 1.0,
            height: 0.2,
            backgroundColor: new Three_1.Color(0x222222),
            backgroundOpacity: 1.0,
        });
        /** 位置を元のタグの位置に合わせる */
        container.position.copy(that._position);
        container.rotation.copy(that._rotate);
        container.rotation.y = (0, MathUtils_1.degToRad)((_b = parameter.angle) !== null && _b !== void 0 ? _b : 0);
        parameter.rootScene.add(container);
        /** テキストを作成する */
        const text = new three_mesh_ui_1.default.Text({ content: parameter.content });
        container.add(text);
        this._text = text;
        return this;
    }
    /** イベント: アニメーションループが実行された */
    onAnimating(animatingEvent) {
        this._onAnimatingEvent = animatingEvent;
        return this;
    }
    /** アニメーションループ */
    executeAnimationLoop(parameter) {
        if (this._onAnimatingEvent && this._text) {
            this._onAnimatingEvent(this._text);
        }
    }
}
exports.MeshUiTextWrapper = MeshUiTextWrapper;
//# sourceMappingURL=MeshUiTextWrapper.js.map