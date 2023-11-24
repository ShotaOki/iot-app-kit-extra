import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import ThreeMeshUI from "three-mesh-ui";
import { AnimationParameter } from "../../types/DataType";
import { getState } from "../../utility/SceneUtility";
import { Raycaster, Color, Camera, TextureLoader } from "three/src/Three";
import { FontData } from "../../types/MeshUiFont";
import { MixinBillboard } from "../../mixin/MixinBillboard";
import {
  CreateEventValueParameter,
  EventParameter,
} from "../../mixin/MixinEventNotifier";

export interface MeshUiButtonColor {
  backgroundColor: Color;
  fontColor: Color;
}

export interface MeshUiButtonFileContents {
  filePath: string;
}

export interface MeshUiButtonSetterEvent {
  set: (jsonData: any) => void;
  setContent: (content: string | MeshUiButtonFileContents) => void;
}

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObject = /** */
MixinBillboard( // 必ずこちら側にオブジェクトを向ける
  ExtraObjectWrapper
);

export interface MeshUiButtonParameter extends ModelParameterBase {
  // テキスト, またはコンテンツ
  content: string | MeshUiButtonFileContents;
  // 状態ごとの表示スタイル
  stateStyle: { [style: string]: MeshUiButtonColor };
  // ボタンの幅
  width: number;
  // ボタンの高さ
  height: number;
  // フォントデータ
  font?: FontData;
  // ビルボード
  isBillboard?: boolean;
}
export class MeshUiButtonWrapper extends MixinExtraObject {
  private _camera: Camera | null = null;
  private _objsToTest: Array<ThreeMeshUI.Block> = [];
  private _content?: any;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MeshUiButtonParameter) {
    // 自身のインスタンスの参照を保持
    const that = this;
    this._objsToTest = [];

    const font = parameter.font ?? FontData.default();

    /** コンテナを作成、フォントを設定する */
    const container = new ThreeMeshUI.Block({
      justifyContent: "center",
      contentDirection: "row-reverse",
      fontFamily: font.familiy,
      fontTexture: font.texture,
      fontSize: 0.14,
      padding: 0.02,
      borderRadius: 0.11,
      width: 1.0,
      height: 1.0,
      backgroundColor: new Color(0xffffff),
      backgroundOpacity: 0,
    });

    /** 位置を元のタグの位置に合わせる */
    this.applyAttitude(container, parameter);
    /** シーンに配置する */
    this.add(container);

    /** ボタンを作成する */
    const button: any = new ThreeMeshUI.Block({
      width: parameter.width,
      height: parameter.height,
      justifyContent: "center",
      offset: 0.05,
      margin: 0.02,
      borderRadius: 0.075,
    });

    /** コンテンツの内容に合わせてデータを設定する */
    if (typeof parameter.content === "string") {
      this._content = new ThreeMeshUI.Text({});
      button.add(this._content);
    } else {
      this._content = button;
    }
    this.setContent(parameter.content);

    /**
     * 状態変更イベントを登録する
     */
    button.setupState({
      state: "selected",
      attributes: {
        offset: 0.02,
        ...parameter.stateStyle["selected"],
      },
      onSet: () => {
        that.emitClick();
      },
    });
    button.setupState({
      state: "hovered",
      attributes: {
        offset: 0.035,
        backgroundOpacity: 1,
        ...parameter.stateStyle["hovered"],
      },
    });
    button.setupState({
      state: "idle",
      attributes: {
        offset: 0.035,
        backgroundOpacity: 1.0,
        ...parameter.stateStyle["idle"],
      },
    });

    container.add(button);
    that._objsToTest.push(button);

    /** カメラを参照する */
    const { camera } = getState(this._rootScene);
    that._camera = camera;

    // 必要があれば、必ずカメラの方向にオブジェクトを向ける
    this._billboardInitialize({
      isEnabled: parameter.isBillboard ?? false,
      target: container,
    });

    return this;
  }

  /** onイベントの通知先に連携するデータを定義する */
  createParameter(
    value: CreateEventValueParameter,
    event?: EventParameter
  ): EventParameter & MeshUiButtonSetterEvent {
    const that = this;
    return {
      /** 共通のイベントデータ */
      ...super.createParameter(value, event),
      /** ボタンにデータコンテンツを設定する */
      set: (jsonData: any) => that.set(jsonData),
      /** ボタンにデータコンテンツを設定する */
      setContent: (content: string | MeshUiButtonFileContents) =>
        that.setContent(content),
    };
  }

  /** イベント: クリックを受けた */
  onClick(clickEvent: (parameter: EventParameter) => void) {
    this.observerClick(clickEvent);
    return this;
  }

  /** イベント: レンダリング状態を更新した */
  onTick(
    receiver: (parameter: EventParameter & MeshUiButtonSetterEvent) => void
  ): this {
    this.observerTick(receiver);
    return this;
  }

  get content() {
    // 設定先のコンテンツがなければ処理を終了する
    if (this._content === undefined) return;
    try {
      // コンテンツを取得する
      return this._content.content;
    } catch {
      // 取得できないのならundefinedを返す
      return undefined;
    }
  }

  /**
   * コンテンツを更新する
   */
  setContent(content: string | MeshUiButtonFileContents) {
    // 設定先のコンテンツがなければ処理を終了する
    if (this._content === undefined) return;
    // データを更新する
    if (typeof content === "string") {
      // テキストコンテンツを更新する
      this._content.set({
        content,
      });
    } else {
      // テクスチャ画像を更新する
      const loader = new TextureLoader();
      loader.loadAsync(content.filePath).then((texture) => {
        this._content.set({
          backgroundTexture: texture,
        });
      });
    }
  }

  /**
   * コンテンツを直接設定する
   */
  set(jsonData: any) {
    // 設定先のコンテンツがなければ処理を終了する
    if (this._content === undefined) return;
    // データを更新する
    this._content.set(jsonData);
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    if (this._camera && parameter.mouse) {
      parameter.raycaster.setFromCamera(parameter.mouse, this._camera);
      this.raycast(parameter.raycaster, parameter.isSelect);
    }
  }

  private raycast(raycaster: Raycaster, isSelected: boolean) {
    this._objsToTest.forEach((obj) => {
      const target: any = obj;
      if (raycaster.intersectObject(obj, true).length >= 1) {
        if (isSelected) {
          target.setState("selected");
        } else {
          target.setState("hovered");
        }
      } else {
        target.setState("idle");
      }
    });
  }

  /**
   * --------------------------------
   * 前方互換性のために残す関数
   * --------------------------------
   */

  /**
   * @deprecated onClickを使用
   * イベント: クリックを受けた */
  onClickEvent(clickEvent: (parameter: EventParameter) => void) {
    return this.onClick(clickEvent);
  }

  /**
   * @deprecated onTickを使用
   * イベント: アニメーションループが実行された */
  onAnimating(
    animatingEvent: (text: EventParameter & MeshUiButtonSetterEvent) => void
  ) {
    return this.onTick(animatingEvent);
  }
}
