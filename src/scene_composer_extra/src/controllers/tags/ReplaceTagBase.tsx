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

  /**
   * @param ref タグオブジェクトのRef ID
   * @param anchor タグオブジェクトのアンカー情報(位置、色、アイコン情報などが入っている)
   */
  constructor(
    rootScene: Scene,
    anchor: IAnchorComponent,
    tag?: Object3D<Event>,
    parentGroup?: Object3D
  ) {
    this._rootScene = rootScene;
    this._anchor = anchor;
    this._tag = tag;
    this._parentGroup = parentGroup;
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
    };
  }
}
