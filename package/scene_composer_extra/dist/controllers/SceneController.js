"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneController = exports.SceneControllerState = void 0;
const Three_1 = require("three/src/Three");
const SceneUtility_1 = require("../utility/SceneUtility");
const dataBindingUtils_1 = require("@iot-app-kit/scene-composer/dist/src/utils/dataBindingUtils");
const TagController_1 = require("./TagController");
const DataType_1 = require("../types/DataType");
const three_mesh_ui_1 = __importDefault(require("three-mesh-ui"));
var SceneControllerState;
(function (SceneControllerState) {
    SceneControllerState[SceneControllerState["Initialize"] = 0] = "Initialize";
    SceneControllerState[SceneControllerState["Active"] = 1] = "Active";
})(SceneControllerState || (exports.SceneControllerState = SceneControllerState = {}));
class SceneController {
    constructor(composeId, sceneInterface) {
        this._composerId = composeId;
        this._interface = sceneInterface;
        this._objects = {};
        this._raycaster = new Three_1.Raycaster();
        this._selectState = false;
        this._mouse = null;
        window.addEventListener("pointermove", (event) => {
            this._mouse = new Three_1.Vector2();
            this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        window.addEventListener("pointerdown", () => {
            this._selectState = true;
        });
        window.addEventListener("pointerup", () => {
            this._selectState = false;
        });
        window.addEventListener("touchstart", (event) => {
            this._selectState = true;
            this._mouse = new Three_1.Vector2();
            this._mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this._mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        });
        window.addEventListener("touchend", () => {
            this._selectState = false;
            this._mouse = null;
        });
        const that = this;
        function animate() {
            requestAnimationFrame(animate);
            Object.keys(that._objects).forEach((k) => {
                that._objects[k].executeAnimationLoop({
                    mouse: that._mouse,
                    isSelect: that._selectState,
                    raycaster: that._raycaster,
                });
            });
            // アニメーションの状態を更新
            three_mesh_ui_1.default.update();
        }
        animate();
    }
    searchRootScene(nodeMap, getObject3DBySceneNodeRef) {
        // documentから3Dシーンを取得する
        for (let ref of Object.keys(nodeMap)) {
            // オブジェクトを参照する
            const object3D = getObject3DBySceneNodeRef(ref);
            const rootScene = (0, SceneUtility_1.findRootScene)(object3D);
            if (rootScene !== null && rootScene !== undefined) {
                return rootScene;
            }
        }
        return undefined;
    }
    /**
     * シーンの状態を更新する
     * @param current
     * @param rootScene
     */
    onUpdateScene(current, rootScene) {
        if (current === SceneControllerState.Initialize) {
            // ライティングを設定する
            rootScene.add(new Three_1.AmbientLight(0xffffff, 0.7));
            // RendererをMMDに合わせて最適化する
            const { gl } = (0, SceneUtility_1.getState)(rootScene);
            (0, SceneUtility_1.setupSceneForMMD)(gl);
        }
    }
    /**
     * コンポーザーIDを参照する
     */
    get composerId() {
        return this._composerId;
    }
    /**
     * 実行する(0.5秒に1回実行する)
     * Reactの変数は再生成で破棄されるため、必要に応じてRedux管理できるよう、コアの状態管理変数はインスタンス外に出しておく
     *
     * @param state 現在のSceneコントローラーの状態を管理する変数
     * @param nodeMap TwinMakerのノード状態(S3ファイルから取得した画面構成情報)
     * @param getObject3DBySceneNodeRef 関数: ノード情報からjsオブジェクトを参照する関数
     * @returns state : 更新後のstateを返却する
     */
    exec(state, nodeMap, getObject3DBySceneNodeRef) {
        // ルートになるシーンを参照する(TwinMakerの読み込みが完了するまではundefinedを返す)
        const rootScene = this.searchRootScene(nodeMap, getObject3DBySceneNodeRef);
        if (rootScene !== undefined) {
            // TwinMakerの読み込みが完了した
            // 状態がInitializeである=初回実行であるとき
            if (state === SceneControllerState.Initialize) {
                // シーンの更新通知を実行する
                this.onUpdateScene(state, rootScene);
                // シーンコントローラの更新通知イベントを実行: タグを上書きする
                const overrides = this._interface.overrideTags(rootScene);
                // 上書き対象のオブジェクトをさらう
                for (let tag of Object.keys(overrides)) {
                    // 上書きを実行、成功すれば_objects変数に保持する
                    const wrapper = (0, TagController_1.searchTag)(nodeMap, tag, overrides[tag]);
                    if (wrapper) {
                        this._objects[tag] = wrapper;
                    }
                }
                // 状態をActiveに変更する
                return SceneControllerState.Active;
            }
        }
        // 何もしなければ、受け取った時点のままのステートを返却する
        return state;
    }
    /**
     * データの更新を実行する(0.5秒に1回実行する)
     *
     * @param dataInput TwinMakerが管理するクラウド側データソース
     * @param dataBindingTemplate TwinMakerの設定パラメータ、データソースの紐づけ変数
     * @param getSceneRuleMapById 関数: ルールをTwinMakerから取得する関数
     */
    execData(dataInput, dataBindingTemplate, getSceneRuleMapById) {
        // 自身が管理するExtraObjectWrapperをすべてさらう
        for (let tag of Object.keys(this._objects)) {
            const wrapper = this._objects[tag];
            if (wrapper && wrapper._anchor) {
                // SiteWiseのクラウド側の最新値を参照する
                const values = (0, dataBindingUtils_1.dataBindingValuesProvider)(dataInput, wrapper._anchor.valueDataBinding, dataBindingTemplate);
                // TwinMakerの色変更ルールを参照する
                const ruleId = wrapper._anchor.ruleBasedMapId;
                const ruleTarget = (0, dataBindingUtils_1.ruleEvaluator)(DataType_1.SystemLoadingStatus.UndefinedState, values, getSceneRuleMapById(ruleId));
                // 色変更ルールにもとづいた、現在の状態を適用する
                if (ruleTarget) {
                    wrapper.stateChange(ruleTarget);
                }
            }
        }
    }
}
exports.SceneController = SceneController;
//# sourceMappingURL=SceneController.js.map