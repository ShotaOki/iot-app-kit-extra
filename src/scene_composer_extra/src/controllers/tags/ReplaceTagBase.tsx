import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { Object3D, Event, Scene } from "three/src/Three";
import { ExtraObjectWrapperParameter } from "../../objects/ExtraObjectWrapper";

export type ReplaceTagPluginConstructor<T = ReplaceTagBase> = new (
  ...args: any[]
) => T;

export class ReplaceTagBase {
  // カメラ、レンダリング情報を持ったシーンオブジェクト
  _rootScene: Scene;
  // TwinMakerで管理されるタグの表示情報、アンカー情報
  _anchor: IAnchorComponent;
  // オプション: TwinMakerタグの3Dオブジェクト情報
  _tag?: Object3D<Event>;
  // オプション: 置き換え後のオブジェクトを配置するグループ
  _parentGroup?: Object3D;
  // タグの表示名
  _nodeName: string;
  // 表示名の階層情報
  _breadcrumb: string;

  /**
   * @param ref タグオブジェクトのRef ID
   * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
   */
  constructor(parameter: {
    rootScene: Scene;
    anchor: IAnchorComponent;
    tag?: Object3D<Event>;
    parentGroup?: Object3D;
    nodeName: string;
    breadcrumb: string;
  }) {
    this._rootScene = parameter.rootScene;
    this._anchor = parameter.anchor;
    this._tag = parameter.tag;
    this._parentGroup = parameter.parentGroup;
    this._nodeName = parameter.nodeName;
    this._breadcrumb = parameter.breadcrumb;
  }

  /* タグからの入れ替え先に受け渡すパラメータを設定する */
  parameter(tag: Object3D<Event>): ExtraObjectWrapperParameter {
    return {
      rootScene: this._rootScene,
      position: tag.position,
      rotate: tag.rotation,
      scale: tag.scale,
      anchor: this._anchor,
      parentObject: this._parentGroup,
      nodeName: this._nodeName,
      breadcrumb: this._breadcrumb,
    };
  }
}
