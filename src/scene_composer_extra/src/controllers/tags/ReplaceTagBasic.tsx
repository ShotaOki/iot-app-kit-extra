import { GroupWrapper } from "../../objects/group/GroupWrapper";
import { HTMLModelWrapper } from "../../objects/html/HTMLModelWrapper";
import { MMDModelWrapper } from "../../objects/mmd/MMDModelWrapper";
import { GLTFModelWrapper } from "../../objects/model/GLTFModelWrapper";
import { ImageModelWrapper } from "../../objects/model/ImageModelWrapper";
import { TextureAtrasVideoWrapper } from "../../objects/model/TextureAtrasVideoWrapper";
import { MeshUiButtonWrapper } from "../../objects/three-mesh-ui/MeshUiButtonWrapper";
import { MeshUiTextWrapper } from "../../objects/three-mesh-ui/MeshUiTextWrapper";
import { ReplaceTagPluginConstructor } from "./ReplaceTagBase";

/**
 * 対象のクラスにアニメーションを設定するMixin
 */
export function ReplaceTagBasic<TBase extends ReplaceTagPluginConstructor>(
  Base: TBase
) {
  return class BasicTags extends Base {
    /**
     * TwinMakerのタグオブジェクトをグループに置き換える
     */
    get toGroup() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new GroupWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトをMMDに置き換える
     *
     * @param ref タグオブジェクトのRef ID
     * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
     * @returns MMDの管理クラス
     */
    get toMMD() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new MMDModelWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトをGLTF, GLBに置き換える
     *
     * @returns GLTF, GLBの管理クラス
     */
    get toGLTF() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new GLTFModelWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトをボタンに置き換える
     *
     * @returns MMDの管理クラス
     */
    get toButton() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new MeshUiButtonWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトをテキストに置き換える
     *
     * @returns MMDの管理クラス
     */
    get toText() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new MeshUiTextWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトをHTMLに置き換える
     */
    get toHTML() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new HTMLModelWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトを2D画像に置き換える
     */
    get toImage() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new ImageModelWrapper(this.parameter(tag));
      }
      return undefined;
    }

    /**
     * テクスチャアトラスを使ったビデオに置き換える
     */
    get toTextureAtrasVideo() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new TextureAtrasVideoWrapper(this.parameter(tag));
      }
      return undefined;
    }
  };
}
