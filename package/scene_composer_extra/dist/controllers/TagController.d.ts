import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { ISceneNodeInternal } from "@iot-app-kit/scene-composer/dist/src/store";
import { MMDModelWrapper } from "../objects/mmd/MMDModelWrapper";
import { SearchTagsCallback } from "../types/DataType";
import { MeshUiButtonWrapper } from "../objects/three-mesh-ui/MeshUiButtonWrapper";
import { MeshUiTextWrapper } from "../objects/three-mesh-ui/MeshUiTextWrapper";
import { Object3D, Event } from "three/src/Three";
/**
 * タグを検索する
 *
 * @param nodeMap ノードの一覧（TwinMakerが管理する画面の構成情報）
 * @param requiredName 必要なタグ名
 * @param callback タグが見つかった時に返却するコールバック
 * @returns ExtraObjectWrapperのインスタンス
 */
export declare function searchTag(nodeMap: Record<string, ISceneNodeInternal>, requiredName: string, callback: SearchTagsCallback): import("../objects/ExtraObjectWrapper").ExtraObjectWrapper | undefined;
export declare class ReplaceTag {
    private _getObject3DBySceneNodeRef;
    /**
     * コンストラクタ
     * @param getObject3DBySceneNodeRef 関数: TwinMakerのノード情報からThree.jsのオブジェクトを参照する関数
     */
    constructor(getObject3DBySceneNodeRef: (ref: string | undefined) => Object3D<Event> | undefined);
    /**
     * TwinMakerのタグオブジェクトをMMDに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    toMMD(ref: string, anchor: IAnchorComponent): MMDModelWrapper | undefined;
    /**
     * TwinMakerのタグオブジェクトをボタンに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    toButton(ref: string, anchor: IAnchorComponent): MeshUiButtonWrapper | undefined;
    /**
     * TwinMakerのタグオブジェクトをテキストに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    toText(ref: string, anchor: IAnchorComponent): MeshUiTextWrapper | undefined;
}
