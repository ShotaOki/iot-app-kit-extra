import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import { Color, TextureLoader } from "three/src/Three";
import ThreeMeshUI from "three-mesh-ui";
import { AnimationParameter } from "../../types/DataType";
import { FontData } from "../../types/MeshUiFont";
import { MixinBillboard } from "../../mixin/MixinBillboard";
import {
  CreateEventValueParameter,
  EventParameter,
} from "../../mixin/MixinEventNotifier";
import {
  MeshUiButtonFileContents,
  MeshUiButtonSetterEvent,
} from "./MeshUiButtonWrapper";

export interface MeshUiButtonColor {
  backgroundColor: Color;
  fontColor: Color;
}

export interface MeshUiTextParameter extends ModelParameterBase {
  // テキスト
  content: string;
  // フォントデータ
  font?: FontData;
  // ビルボード
  isBillboard?: boolean;
}

// クラスに取り込むミックスインを指定する
// prettier-ignore
const MixinExtraObject = /** */
MixinBillboard( // 必ずこちら側にオブジェクトを向ける
  ExtraObjectWrapper
);

export class MeshUiTextWrapper extends MixinExtraObject {
  private _content?: any;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MeshUiTextParameter) {
    // 自身のインスタンスの参照を保持
    const that = this;

    const font = parameter.font ?? FontData.default();

    /** コンテナを作成、フォントを設定する */
    const container = new ThreeMeshUI.Block({
      justifyContent: "center",
      contentDirection: "row-reverse",
      fontFamily: font.familiy,
      fontTexture: font.texture,
      fontSize: 0.07,
      padding: 0.02,
      borderRadius: 0.11,
      width: 1.0,
      height: 0.2,
      backgroundColor: new Color(0x222222),
      backgroundOpacity: 1.0,
    });

    /** 位置を元のタグの位置に合わせる */
    this.applyAttitude(container, parameter);
    /** 画面に配置する */
    this.add(container);

    /** テキストを作成する */
    const text = new ThreeMeshUI.Text({ content: parameter.content });
    container.add(text);

    this._content = text;

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

  /** イベント: レンダリング状態を更新した */
  onTick(
    receiver: (parameter: EventParameter & MeshUiButtonSetterEvent) => void
  ): this {
    this.observerTick(receiver);
    return this;
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

  /**
   * --------------------------------
   * 前方互換性のために残す関数
   * --------------------------------
   */

  /**
   * @deprecated onTickを使用
   * イベント: アニメーションループが実行された */
  onAnimating(
    animatingEvent: (text: EventParameter & MeshUiButtonSetterEvent) => void
  ) {
    return this.onTick(animatingEvent);
  }
}
