"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MMDModelWrapper = void 0;
const ExtraObjectWrapper_1 = require("../ExtraObjectWrapper");
const Three_1 = require("three/src/Three");
const MMDLoader_1 = require("three/examples/jsm/loaders/MMDLoader");
const DataType_1 = require("../../types/DataType");
const MathUtils_1 = require("three/src/math/MathUtils");
class MMDModelWrapper extends ExtraObjectWrapper_1.ExtraObjectWrapper {
    /**
     * 初期化する
     *
     * @param parameter モデルのパラメータ
     * @returns
     */
    create(parameter) {
        // ローダーを作成する
        const loader = new MMDLoader_1.MMDLoader();
        // 自身のインスタンスの参照を保持
        const that = this;
        /** 非同期でMMDモデルを取得する */
        loader.loadAsync(parameter.pmxPath).then((mesh) => {
            // 位置情報、大きさ、回転角度をTwinMakerのタグに合わせる
            mesh.position.copy(this._position);
            mesh.rotation.copy(this._rotate);
            if (parameter.angle !== undefined) {
                // 角度の指定があれば反映する
                mesh.rotation.set(mesh.rotation.x, (0, MathUtils_1.degToRad)(parameter.angle), mesh.rotation.z);
            }
            if (parameter.scale !== undefined) {
                // スケールの指定があれば反映する
                mesh.scale.set(parameter.scale, parameter.scale, parameter.scale);
            }
            else {
                mesh.scale.copy(this._scale);
            }
            // 影を表示する
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // アニメーションミキサーを初期化する
            this._mixier = new Three_1.AnimationMixer(mesh);
            // 発光設定、アウトライン設定をTwinMakerに合わせて補正する
            for (let m of mesh.material) {
                let ma = m;
                ma.emissive.multiplyScalar(0.1);
                ma.userData.outlineParameters.thickness = 0.001;
                ma.needsUpdate = true;
            }
            // 読み込んだMMDモデルを表示する
            parameter.rootScene.add(mesh);
            this._mesh = mesh;
            // 状態を初期化する
            that.stateChange(DataType_1.SystemLoadingStatus.Init);
            // モーションを読み込む
            if (parameter.motionMap) {
                const motionKeyList = Object.keys(parameter.motionMap);
                Promise.all(motionKeyList.map((key) => new Promise((resolve) => 
                // アニメーションを非同期で読み込む
                new MMDLoader_1.MMDLoader().loadAnimation(parameter.motionMap[key], mesh, (animation) => {
                    // 非同期読み込みの完了を通知
                    resolve(animation);
                })))).then((results) => {
                    const motionMap = {};
                    results.forEach((motion, index) => {
                        motionMap[motionKeyList[index]] = motion;
                    });
                    this._flagLoaded = true;
                    this._motionMap = motionMap;
                });
            }
            else {
                this._flagLoaded = true;
            }
            // アニメーションを実行する
            that._clock = new Three_1.Clock();
        });
        return this;
    }
    /**
     * 状態の変更通知を受け取る
     *
     * @param newState 次のオブジェクトの状態
     */
    onChangeState(newState) {
        if (this._stateChange && this._mesh && this._mixier) {
            const animationNames = this._stateChange.onChangeState(this._mesh, this, newState);
            // もしアニメーションの戻り値がないのならアニメーションを終了する
            if (!(animationNames && animationNames.length)) {
                if (this._mixier) {
                    this._mixier.stopAllAction();
                    return;
                }
            }
            // 戻り値で受け取ったアニメーションを再生する
            if (this._mixier && this._motionMap) {
                this._mixier.stopAllAction();
                for (let name of animationNames) {
                    const motion = this._motionMap[name];
                    this._mixier.clipAction(motion).play();
                }
            }
        }
    }
    /**
     * 状態変更イベントをバインドする
     *
     * @param stateChange 状態変更イベント
     * @returns 自身のオブジェクト（チェイン可能）
     */
    bindOnStateChangeEvent(stateChange) {
        this._stateChange = stateChange;
        return this;
    }
    /** アニメーションループ */
    executeAnimationLoop(parameter) {
        // アニメーションの状態を更新
        if (this._clock) {
            const delta = this._clock.getDelta();
            if (this._mixier)
                this._mixier.update(delta);
        }
    }
}
exports.MMDModelWrapper = MMDModelWrapper;
//# sourceMappingURL=MMDModelWrapper.js.map