"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtraObjectWrapper = void 0;
const DataType_1 = require("../types/DataType");
class ExtraObjectWrapper {
    constructor(position, rotate, scale, anchor) {
        this._position = position;
        this._rotate = rotate;
        this._scale = scale;
        this._anchor = anchor;
        this._state = "";
        this._flagLoaded = false;
    }
    /** 読み込みの完了フラグ */
    get isLoaded() {
        return this._flagLoaded;
    }
    /** アニメーションループ */
    executeAnimationLoop(parameter) { }
    /**
     * 状態を変更する
     * @param newState 次の状態
     */
    stateChange(newState) {
        // 同じ状態であれば処理をしない
        if (this._state === newState) {
            return;
        }
        // 初期化完了は読み込みの完了前であっても受け入れる
        if (newState === DataType_1.SystemLoadingStatus.Init) {
            this._state = newState;
            return;
        }
        // 読み込みが完了していないのなら状態を更新しない
        if (!this._flagLoaded) {
            return;
        }
        // 状態を更新する
        this._state = newState;
        this.onChangeState(newState);
    }
    /**
     * 子クラスで実装: イベント通知関数
     * @param newState 次の状態
     */
    onChangeState(newState) { }
}
exports.ExtraObjectWrapper = ExtraObjectWrapper;
//# sourceMappingURL=ExtraObjectWrapper.js.map