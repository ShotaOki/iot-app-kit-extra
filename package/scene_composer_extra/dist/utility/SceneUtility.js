"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSceneController = exports.setupSceneForMMD = exports.getState = exports.findRootScene = void 0;
const Three_1 = require("three/src/Three");
const store_1 = require("@iot-app-kit/scene-composer/dist/src/store");
const SceneController_1 = require("../controllers/SceneController");
const react_1 = require("react");
const TagController_1 = require("../controllers/TagController");
const MathUtils_1 = require("three/src/math/MathUtils");
/** ルートシーンを取得する */
function findRootScene(target) {
    if (target === undefined) {
        return undefined;
    }
    let current = target;
    while (current.parent !== undefined && current.parent !== null) {
        current = current.parent;
    }
    return current;
}
exports.findRootScene = findRootScene;
/**
 * R3FのStateを取得する(GLRenderer、Scene、Cameraが取得できる)
 */
function getState(rootScene) {
    const d3fScene = rootScene;
    return d3fScene.__r3f.root.getState();
}
exports.getState = getState;
/**
 * TwinMakerのシーン描画(色の描画)をMMDに合わせて調整する
 */
function setupSceneForMMD(gl) {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = Three_1.PCFSoftShadowMap;
    // LinearEncodingにすると色彩が強くなる
    gl.outputEncoding = Three_1.LinearEncoding;
    gl.toneMapping = Three_1.LinearToneMapping;
}
exports.setupSceneForMMD = setupSceneForMMD;
/**
 * シーンコントローラを利用する
 *
 * @param factory SceneControllerを作成する関数
 */
function useSceneController(factory) {
    // 任意のコンポーザーID: SceneComposerに対して固定値を指定する
    const composerId = (0, react_1.useMemo)(() => (0, MathUtils_1.generateUUID)(), []);
    /** 状態の管理フラグ */
    let [initializedFlag, setInitializedFlag] = (0, react_1.useState)(SceneController_1.SceneControllerState.Initialize);
    // TwinMaker（クラウド側）の画面構成情報を参照する(※nodeMap＝S3にあるJsonデータのこと)
    const nodeMap = (0, store_1.useStore)(composerId)((state) => state.document.nodeMap);
    // Jsonのタグ情報に紐づいた3Dオブジェクトを参照する
    const getObject3DBySceneNodeRef = (0, store_1.useStore)(composerId)((state) => state.getObject3DBySceneNodeRef);
    // データ参照変数を取る
    const { dataInput, dataBindingTemplate, getSceneRuleMapById } = (0, store_1.useStore)(composerId)((state) => state);
    /** コントローラを作成する */
    const controller = (0, react_1.useMemo)(() => factory(composerId, new TagController_1.ReplaceTag(getObject3DBySceneNodeRef)), [composerId, getObject3DBySceneNodeRef]);
    (0, react_1.useEffect)(() => {
        /** 500msごとに状態を監視する */
        const timer = setInterval(() => {
            /** 500msごとに状態を更新する */
            setInitializedFlag(controller.exec(initializedFlag, nodeMap, getObject3DBySceneNodeRef));
            controller.execData(dataInput, dataBindingTemplate, getSceneRuleMapById);
        }, 500);
        // useEffectのデストラクタ
        return () => {
            clearInterval(timer);
        };
    }, [
        nodeMap,
        getObject3DBySceneNodeRef,
        initializedFlag,
        controller,
        dataInput,
        dataBindingTemplate,
        getSceneRuleMapById,
    ]);
    return controller;
}
exports.useSceneController = useSceneController;
//# sourceMappingURL=SceneUtility.js.map