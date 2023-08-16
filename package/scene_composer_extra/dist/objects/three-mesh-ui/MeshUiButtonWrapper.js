"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshUiButtonWrapper = void 0;
const ExtraObjectWrapper_1 = require("../ExtraObjectWrapper");
const three_mesh_ui_1 = __importDefault(require("three-mesh-ui"));
const MathUtils_1 = require("three/src/math/MathUtils");
const SceneUtility_1 = require("../../utility/SceneUtility");
const Three_1 = require("three/src/Three");
const MeshUiFont_1 = require("../../types/MeshUiFont");
class MeshUiButtonWrapper extends ExtraObjectWrapper_1.ExtraObjectWrapper {
    constructor() {
        super(...arguments);
        this._camera = null;
        this._objsToTest = [];
    }
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
        this._objsToTest = [];
        const font = (_a = parameter.font) !== null && _a !== void 0 ? _a : MeshUiFont_1.FontData.default();
        /** コンテナを作成、フォントを設定する */
        const container = new three_mesh_ui_1.default.Block({
            justifyContent: "center",
            contentDirection: "row-reverse",
            fontFamily: font.familiy,
            fontTexture: font.texture,
            fontSize: 0.14,
            padding: 0.02,
            borderRadius: 0.11,
            width: 1.0,
            height: 1.0,
            backgroundColor: new Three_1.Color(0xffffff),
            backgroundOpacity: 0,
        });
        /** 位置を元のタグの位置に合わせる */
        container.position.copy(that._position);
        container.rotation.copy(that._rotate);
        container.rotation.y = (0, MathUtils_1.degToRad)((_b = parameter.angle) !== null && _b !== void 0 ? _b : 0);
        parameter.rootScene.add(container);
        /** ボタンを作成する */
        const button = new three_mesh_ui_1.default.Block({
            width: parameter.width,
            height: parameter.height,
            justifyContent: "center",
            offset: 0.05,
            margin: 0.02,
            borderRadius: 0.075,
        });
        const text = new three_mesh_ui_1.default.Text({ content: parameter.content });
        button.add(text);
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
        this._text = text;
        /** カメラを参照する */
        const { camera } = (0, SceneUtility_1.getState)(parameter.rootScene);
        that._camera = camera;
        return this;
    }
    /** イベント: クリックを受けた */
    onClickEvent(clickEvent) {
        this._onClickEvent = clickEvent;
        return this;
    }
    /** イベント: アニメーションループが実行された */
    onAnimating(animatingEvent) {
        this._onAnimatingEvent = animatingEvent;
        return this;
    }
    /** アニメーションループ */
    executeAnimationLoop(parameter) {
        if (this._camera && parameter.mouse) {
            parameter.raycaster.setFromCamera(parameter.mouse, this._camera);
            this.raycast(parameter.raycaster, parameter.isSelect);
        }
        if (this._onAnimatingEvent && this._text) {
            this._onAnimatingEvent(this._text);
        }
    }
    raycast(raycaster, isSelected) {
        this._objsToTest.forEach((obj) => {
            const target = obj;
            if (raycaster.intersectObject(obj, true).length >= 1) {
                if (isSelected) {
                    target.setState("selected");
                }
                else {
                    target.setState("hovered");
                }
            }
            else {
                target.setState("idle");
            }
        });
    }
}
exports.MeshUiButtonWrapper = MeshUiButtonWrapper;
//# sourceMappingURL=MeshUiButtonWrapper.js.map