import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import { Euler, Object3D, Vector3 } from "three/src/Three";
import {
  AnimationParameter,
  OverrideTagsParameter,
} from "../../types/DataType";
import { ReplaceTag } from "../../controllers/TagController";
import { MixinAnimation } from "../../mixin/MixinAnimation";

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

/**
 * 複数のオブジェクトを一つのタグに紐づけるクラス
 */
export class GroupWrapper extends MixinAnimation(ExtraObjectWrapper) {
  // 子オブジェクト
  protected _children: { [key: string]: ExtraObjectWrapper } = {};
  protected _animationController?: Object3D;

  /**
   * 子オブジェクトを初期化する
   * @param children
   */
  protected updateChildren(
    children: OverrideTagsParameter,
    groupParent: Object3D
  ) {
    this._children = {};
    // シーンコントローラの更新通知イベントを実行: タグを上書きする
    const overrides = children;
    // 上書き対象のオブジェクトをさらう
    for (let tag of Object.keys(overrides)) {
      const override = overrides[tag];
      const result = override(
        new ReplaceTag(
          this._rootScene,
          this._anchor,
          new DummyTag(
            new Vector3(0, 0, 0),
            new Euler(0, 0, 0),
            new Vector3(1.0, 1.0, 1.0)
          ) as any,
          groupParent
        )
      );
      if (result) {
        this._children[tag] = result;
      }
    }
  }

  /** 子オブジェクトを参照する */
  public getChild(key: string) {
    if (key in this._children) {
      return this._children[key];
    }
    return undefined;
  }

  /** キーに一致する子オブジェクトを表示、それ以外を隠す */
  public showSingleChild(key: string) {
    Object.keys(this._children).forEach((k) => {
      const object = this._children[k].object;
      if (object) {
        if (k == key) {
          object.visible = true;
        } else {
          object.visible = false;
        }
      }
    });
  }

  /** 全ての子オブジェクトを表示する */
  public showAllChild() {
    Object.keys(this._children).forEach((k) => {
      const object = this._children[k].object;
      if (object) {
        object.visible = true;
      }
    });
  }

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: GroupParameter) {
    // 親オブジェクトを設定、初期化する
    // 親オブジェクトの表示位置はタグに合わせる
    const groupParent = new Object3D();
    this.applyAttitude(groupParent, parameter);
    this.add(groupParent);
    // アニメーションの管理コントローラを設定する
    // 親オブジェクトに直接変形をかけるとレイアウトが崩れるため、
    // アニメーション用のオブジェクトだけを切り出して作成する
    const animationController = new Object3D();
    // アニメーションの初期状態を設定する
    animationController.position.set(0, 0, 0);
    animationController.rotation.set(0, 0, 0);
    animationController.scale.set(1, 1, 1);
    groupParent.add(animationController);
    // 子オブジェクトを初期化する
    // 子オブジェクトは親オブジェクトの下に配置する
    this.updateChildren(parameter.children, animationController);
    // 変数に格納、初期化する
    this._animationController = animationController;
    // アニメーションの実行変数を初期化する
    this.mixinAnimationInitialize();
    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    // アニメーションの状態を更新
    for (let key of Object.keys(this._children)) {
      // イベントは子オブジェクトに連携する
      this._children[key].executeAnimationLoop(parameter);
    }
    // アニメーションを実行する
    this.executeAnimation(this._animationController);
  }
}
