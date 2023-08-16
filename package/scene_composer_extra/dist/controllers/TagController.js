"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceTag = exports.searchTag = void 0;
const scene_composer_1 = require("@iot-app-kit/scene-composer");
const MMDModelWrapper_1 = require("../objects/mmd/MMDModelWrapper");
const MeshUiButtonWrapper_1 = require("../objects/three-mesh-ui/MeshUiButtonWrapper");
const MeshUiTextWrapper_1 = require("../objects/three-mesh-ui/MeshUiTextWrapper");
/**
 * タグを検索する
 *
 * @param nodeMap ノードの一覧（TwinMakerが管理する画面の構成情報）
 * @param requiredName 必要なタグ名
 * @param callback タグが見つかった時に返却するコールバック
 * @returns ExtraObjectWrapperのインスタンス
 */
function searchTag(nodeMap, requiredName, callback) {
    // TwinMakerの構成情報をすべてさらう
    for (let ref of Object.keys(nodeMap)) {
        const node = nodeMap[ref];
        // タグ名が一致するのなら処理をする
        if (node.name === requiredName) {
            return executeIfNodeIsTag(ref, node, callback);
        }
    }
    return undefined;
}
exports.searchTag = searchTag;
/**
 * もしタグ情報が一致するのならコールバック関数を実行する
 *
 * @param ref タグオブジェクトのRef ID
 * @param node TwinMakerが管理する構成情報
 * @param callback タグが見つかった時に返却するコールバック
 * @returns ExtraObjectWrapperのインスタンス
 */
function executeIfNodeIsTag(ref, node, callback) {
    // ノードの詳細情報を参照する
    const type = node.components.map((component) => component.type);
    // コンポーネントがタグであるとき
    if (type.includes(scene_composer_1.KnownComponentType.Tag)) {
        // タグのコンポーネントには、タグ情報、オーバレイ情報などがあるため、タグ情報だけをフィルタして返す
        for (let component of node.components) {
            if (component.type === scene_composer_1.KnownComponentType.Tag) {
                // タグの詳細情報を渡す
                return callback(ref, component);
            }
        }
    }
    return undefined;
}
class ReplaceTag {
    /**
     * コンストラクタ
     * @param getObject3DBySceneNodeRef 関数: TwinMakerのノード情報からThree.jsのオブジェクトを参照する関数
     */
    constructor(getObject3DBySceneNodeRef) {
        this._getObject3DBySceneNodeRef = getObject3DBySceneNodeRef;
    }
    /**
     * TwinMakerのタグオブジェクトをMMDに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    toMMD(ref, anchor) {
        const tag = this._getObject3DBySceneNodeRef(ref);
        if (tag) {
            tag.visible = false;
            return new MMDModelWrapper_1.MMDModelWrapper(tag.position, tag.rotation, tag.scale, anchor);
        }
        return undefined;
    }
    /**
     * TwinMakerのタグオブジェクトをボタンに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    toButton(ref, anchor) {
        const tag = this._getObject3DBySceneNodeRef(ref);
        if (tag) {
            tag.visible = false;
            return new MeshUiButtonWrapper_1.MeshUiButtonWrapper(tag.position, tag.rotation, tag.scale, anchor);
        }
        return undefined;
    }
    /**
     * TwinMakerのタグオブジェクトをテキストに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    toText(ref, anchor) {
        const tag = this._getObject3DBySceneNodeRef(ref);
        if (tag) {
            tag.visible = false;
            return new MeshUiTextWrapper_1.MeshUiTextWrapper(tag.position, tag.rotation, tag.scale, anchor);
        }
        return undefined;
    }
}
exports.ReplaceTag = ReplaceTag;
//# sourceMappingURL=TagController.js.map