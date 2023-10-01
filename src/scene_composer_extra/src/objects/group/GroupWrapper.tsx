import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import { Euler, Vector3 } from "three/src/Three";
import {
  AnimationParameter,
  OverrideTagsParameter,
} from "../../types/DataType";
import { ReplaceTag } from "../../controllers/TagController";

export interface GroupParameter extends ModelParameterBase {
  // 子オブジェクトの一覧
  children: OverrideTagsParameter;
}

/** Object3Dのダミーオブジェクト */
class DummyTag {
  public position: Vector3;
  public rotation: Euler;
  public scale: Vector3;
  public visible: boolean;

  constructor(position: Vector3, rotation: Euler, scale: Vector3) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.visible = true;
  }
}

export class GroupWrapper extends ExtraObjectWrapper {
  // 子オブジェクト
  protected _children: ExtraObjectWrapper[] = [];

  /**
   * 子オブジェクトを初期化する
   * @param children
   */
  protected updateChildren(children: OverrideTagsParameter) {
    this._children = [];
    // シーンコントローラの更新通知イベントを実行: タグを上書きする
    const overrides = children;
    // 上書き対象のオブジェクトをさらう
    for (let tag of Object.keys(overrides)) {
      const override = overrides[tag];
      const result = override(
        new ReplaceTag(
          this._rootScene,
          this._anchor,
          new DummyTag(this._position, this._rotate, this._scale) as any
        )
      );
      if (result) {
        this._children.push(result);
      }
    }
  }

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: GroupParameter) {
    // 子オブジェクトを初期化する
    this.updateChildren(parameter.children);
    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    // アニメーションの状態を更新
    for (let child of this._children) {
      child.executeAnimationLoop(parameter);
    }
  }
}
