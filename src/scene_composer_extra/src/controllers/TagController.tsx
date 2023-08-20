import {
  IAnchorComponent,
  KnownComponentType,
} from "@iot-app-kit/scene-composer";
import { ISceneNodeInternal } from "@iot-app-kit/scene-composer/dist/src/store";
import { MMDModelWrapper } from "../objects/mmd/MMDModelWrapper";
import { SearchTagsCallback } from "../types/DataType";
import { MeshUiButtonWrapper } from "../objects/three-mesh-ui/MeshUiButtonWrapper";
import { MeshUiTextWrapper } from "../objects/three-mesh-ui/MeshUiTextWrapper";
import { Object3D, Event } from "three/src/Three";
import { GLTFModelWrapper } from "../objects/model/GLTFModelWrapper";

/**
 * タグを検索する
 *
 * @param nodeMap ノードの一覧（TwinMakerが管理する画面の構成情報）
 * @param requiredName 必要なタグ名
 * @param callback タグが見つかった時に返却するコールバック
 * @returns ExtraObjectWrapperのインスタンス
 */
export function searchTag(
  nodeMap: Record<string, ISceneNodeInternal>,
  requiredName: string,
  callback: SearchTagsCallback
) {
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

/**
 * もしタグ情報が一致するのならコールバック関数を実行する
 *
 * @param ref タグオブジェクトのRef ID
 * @param node TwinMakerが管理する構成情報
 * @param callback タグが見つかった時に返却するコールバック
 * @returns ExtraObjectWrapperのインスタンス
 */
function executeIfNodeIsTag(
  ref: string,
  node: ISceneNodeInternal,
  callback: SearchTagsCallback
) {
  // ノードの詳細情報を参照する
  const type = node.components.map((component) => component.type);
  // コンポーネントがタグであるとき
  if (type.includes(KnownComponentType.Tag)) {
    // タグのコンポーネントには、タグ情報、オーバレイ情報などがあるため、タグ情報だけをフィルタして返す
    for (let component of node.components) {
      if (component.type === KnownComponentType.Tag) {
        // タグの詳細情報を渡す
        return callback(ref, component as IAnchorComponent);
      }
    }
  }
  return undefined;
}

export class ReplaceTag {
  // Objectを参照する関数
  private _getObject3DBySceneNodeRef: (
    ref: string | undefined
  ) => Object3D<Event> | undefined;

  /**
   * コンストラクタ
   * @param getObject3DBySceneNodeRef 関数: TwinMakerのノード情報からThree.jsのオブジェクトを参照する関数
   */
  constructor(
    getObject3DBySceneNodeRef: (
      ref: string | undefined
    ) => Object3D<Event> | undefined
  ) {
    this._getObject3DBySceneNodeRef = getObject3DBySceneNodeRef;
  }

  /**
   * TwinMakerのタグオブジェクトをMMDに置き換える
   *
   * @param ref タグオブジェクトのRef ID
   * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
   * @returns MMDの管理クラス
   */
  toMMD(ref: string, anchor: IAnchorComponent) {
    const tag = this._getObject3DBySceneNodeRef(ref);
    if (tag) {
      tag.visible = false;
      return new MMDModelWrapper(tag.position, tag.rotation, tag.scale, anchor);
    }
    return undefined;
  }

  /**
   * TwinMakerのタグオブジェクトをGLTF, GLBに置き換える
   *
   * @param ref タグオブジェクトのRef ID
   * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
   * @returns GLTF, GLBの管理クラス
   */
  toGLTF(ref: string, anchor: IAnchorComponent) {
    const tag = this._getObject3DBySceneNodeRef(ref);
    if (tag) {
      tag.visible = false;
      return new GLTFModelWrapper(
        tag.position,
        tag.rotation,
        tag.scale,
        anchor
      );
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
  toButton(ref: string, anchor: IAnchorComponent) {
    const tag = this._getObject3DBySceneNodeRef(ref);
    if (tag) {
      tag.visible = false;
      return new MeshUiButtonWrapper(
        tag.position,
        tag.rotation,
        tag.scale,
        anchor
      );
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
  toText(ref: string, anchor: IAnchorComponent) {
    const tag = this._getObject3DBySceneNodeRef(ref);
    if (tag) {
      tag.visible = false;
      return new MeshUiTextWrapper(
        tag.position,
        tag.rotation,
        tag.scale,
        anchor
      );
    }
    return undefined;
  }
}
