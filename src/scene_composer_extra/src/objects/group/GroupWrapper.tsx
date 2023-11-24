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

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObjectWrapper = /** GroupWrapperの継承元クラス */
MixinAnimation( // アニメーションを有効にする
  ExtraObjectWrapper
);

/**
 * 複数のオブジェクトを一つのタグに紐づけるクラス
 */
export class GroupWrapper extends MixinExtraObjectWrapper {
  // 子オブジェクト
  protected _children: { [key: string]: ExtraObjectWrapper } = {};
  protected _animationController?: Object3D;
  private _visibleChildName: string[] = [];

  /**
   * 子オブジェクトを初期化する
   * @param children
   */
  protected updateChildren(
    children: OverrideTagsParameter,
    groupParent: Object3D
  ) {
    this._children = {};
    this._visibleChildName = [];
    // シーンコントローラの更新通知イベントを実行: タグを上書きする
    const overrides = children;
    // 上書き対象のオブジェクトをさらう
    for (let tag of Object.keys(overrides)) {
      const override = overrides[tag];
      const result = override(
        new ReplaceTag({
          rootScene: this._rootScene,
          anchor: this._anchor,
          tag: new DummyTag(
            new Vector3(0, 0, 0),
            new Euler(0, 0, 0),
            new Vector3(1.0, 1.0, 1.0)
          ) as any,
          parentGroup: groupParent,
          nodeName: tag,
        })
      );
      if (result) {
        result.awake(); // 初期化の完了を通知する
        this._children[tag] = result;
        this._visibleChildName.push(tag);
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
    this._visibleChildName = [];
    Object.keys(this._children).forEach((k) => {
      const wrapper = this._children[k];
      const object = wrapper.object;
      if (object) {
        if (k == key) {
          // 非表示なら表示中に切り替え、通知する
          if (object.visible == false) {
            object.visible = true;
            wrapper.emitVisible();
          }
          this._visibleChildName.push(k);
        } else {
          // 表示中ならば非表示に切り替え、通知する
          if (object.visible == true) {
            object.visible = false;
            wrapper.emitHide();
          }
        }
      }
    });
  }

  /** 全ての子オブジェクトを表示する */
  public showAllChild() {
    this._visibleChildName = [];
    Object.keys(this._children).forEach((k) => {
      const wrapper = this._children[k];
      const object = wrapper.object;
      if (object) {
        // 非表示であれば表示に切り替え、更新を通知する
        if (object.visible == false) {
          object.visible = true;
          wrapper.emitVisible();
        }
        this._visibleChildName.push(k);
      }
    });
  }

  /** 子オブジェクトが表示中であればtrueを返す */
  public isShow(key: string) {
    return this._visibleChildName.includes(key);
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

  /** 子オブジェクトに伝播する：アニメーションループ */
  callAnimationLoop(parameter: AnimationParameter) {
    super.callAnimationLoop(parameter);
    // アニメーションの状態を更新
    for (let key of Object.keys(this._children)) {
      // イベントは子オブジェクトに連携する
      this._children[key].callAnimationLoop(parameter);
    }
    // アニメーションを実行する
    this.executeAnimation(this._animationController);
  }

  /** 子オブジェクトに伝播する：アニメーションループ */
  stateChange(newState: string | number): void {
    super.stateChange(newState);
    // アニメーションの状態を更新
    for (let key of Object.keys(this._children)) {
      // イベントは子オブジェクトに連携する
      this._children[key].stateChange(newState);
    }
  }

  /**
   * --------------------------------
   * 前方互換性のために残す関数
   * --------------------------------
   */

  /**
   * @deprecated
   * カメラの移動を通知するイベントを登録する
   * -> onUpdateCameraAngleを利用する
   */
  public onMoveCamera(event: () => void) {
    return this.onUpdateCameraAngle(event);
  }
}
