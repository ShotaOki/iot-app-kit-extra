import { Object3D, Event, Scene } from "three/src/Three";
import { ISceneNodeInternal } from "@iot-app-kit/scene-composer/dist/src/store";
import { findRootScene, getState } from "../utility/SceneUtility";
import { ISceneFieldInterface } from "../types/ISceneField";
import { ExtraObjectWrapper } from "../objects/ExtraObjectWrapper";
import {
  IDataBindingTemplate,
  IDataInput,
  IRuleBasedMap,
} from "@iot-app-kit/scene-composer";
import {
  dataBindingValuesProvider,
  ruleEvaluator,
} from "@iot-app-kit/scene-composer/dist/src/utils/dataBindingUtils";
import { ReplaceContext, searchTag } from "./TagController";
import { SystemLoadingStatus } from "../types/DataType";
import ThreeMeshUI from "three-mesh-ui";
import { MixinMouseInput } from "./input/MixinMouseInput";
import { Primitive } from "@iot-app-kit/core";

export enum SceneControllerState {
  Initialize,
  Active,
}

export class SceneController extends MixinMouseInput(Object) {
  // コンポーザーID
  private _composerId: string;
  // コンテキスト
  private _context: ReplaceContext;
  // シーンの更新通知関数
  private _interface: ISceneFieldInterface;
  // Tagを置き換えたあとのオブジェクト管理インスタンス
  private _objects: { [key: string]: ExtraObjectWrapper };

  constructor(
    composeId: string,
    context: ReplaceContext,
    sceneInterface: ISceneFieldInterface
  ) {
    super();
    this._composerId = composeId;
    this._context = context;
    this._interface = sceneInterface;
    this._objects = {};
    this.initiate();
  }

  private searchRootScene(
    nodeMap: Record<string, ISceneNodeInternal>,
    getObject3DBySceneNodeRef: (
      ref: string | undefined
    ) => Object3D<Event> | undefined
  ) {
    // documentから3Dシーンを取得する
    for (let ref of Object.keys(nodeMap)) {
      // オブジェクトを参照する
      const object3D = getObject3DBySceneNodeRef(ref);
      const rootScene: any = findRootScene(object3D) as Scene;
      if (rootScene !== null && rootScene !== undefined) {
        return rootScene;
      }
    }
    return undefined;
  }

  /**
   * シーンの状態を更新する
   * @param current
   * @param rootScene
   */
  private onUpdateScene(current: SceneControllerState, rootScene: Scene) {
    if (current === SceneControllerState.Initialize) {
      // RendererをMMDに合わせて最適化する
      const { camera } = getState(rootScene);
      // 3Dキャンバスの表示位置を参照する
      const model = this.setupCanvas();
      // ボタン操作のイベントを設定する
      this.setupPointerEvent();
      // アニメーションループを実行する
      const that = this;
      function animate() {
        requestAnimationFrame(animate);
        model?.render(rootScene, camera);

        // カメラの状態を文字列化する
        let cameraState = "-";
        try {
          cameraState = camera.matrix.elements
            .map((e) => e.toFixed(3))
            .join("")
            .replaceAll("-", "")
            .replaceAll(".", "");
        } catch {
          cameraState = "-";
        }

        // マウスイベントを通知する
        Object.keys(that._objects).forEach((k) => {
          that._objects[k].callAnimationLoop({
            ...that.currentEvent,
            cameraState: cameraState,
          });
        });
        that.next();

        // アニメーションの状態を更新
        ThreeMeshUI.update();
      }
      animate();
    }
  }

  /**
   * コンポーザーIDを参照する
   */
  get composerId() {
    return this._composerId;
  }

  /**
   * 上書きしたオブジェクトを取得する
   */
  getObject(key: string) {
    if (key in this._objects) {
      return this._objects[key];
    }
    return undefined;
  }

  /**
   * 実行する(0.5秒に1回実行する)
   * Reactの変数は再生成で破棄されるため、必要に応じてRedux管理できるよう、コアの状態管理変数はインスタンス外に出しておく
   *
   * @param state 現在のSceneコントローラーの状態を管理する変数
   * @param nodeMap TwinMakerのノード状態(S3ファイルから取得した画面構成情報)
   * @param getObject3DBySceneNodeRef 関数: ノード情報からjsオブジェクトを参照する関数
   * @returns state : 更新後のstateを返却する
   */
  exec(
    state: SceneControllerState,
    nodeMap: Record<string, ISceneNodeInternal>,
    getObject3DBySceneNodeRef: (
      ref: string | undefined
    ) => Object3D<Event> | undefined
  ) {
    // ルートになるシーンを参照する(TwinMakerの読み込みが完了するまではundefinedを返す)
    const rootScene = this.searchRootScene(nodeMap, getObject3DBySceneNodeRef);
    if (rootScene !== undefined) {
      // TwinMakerの読み込みが完了した
      // 状態がInitializeである=初回実行であるとき
      if (state === SceneControllerState.Initialize) {
        // シーンの更新通知を実行する
        this.onUpdateScene(state, rootScene as Scene);
        // シーンコントローラの更新通知イベントを実行: タグを上書きする
        const overrides = this._interface.overrideTags;
        // 上書き対象のオブジェクトをさらう
        for (let tag of Object.keys(overrides)) {
          // 上書きを実行、成功すれば_objects変数に保持する
          const wrapper = searchTag(
            rootScene,
            this._context,
            nodeMap,
            tag,
            overrides[tag]
          );
          if (wrapper) {
            this._objects[tag] = wrapper;
          }
        }
        // 状態をActiveに変更する
        return SceneControllerState.Active;
      }
    }
    // 何もしなければ、受け取った時点のままのステートを返却する
    return state;
  }

  /**
   * データの更新を実行する(0.5秒に1回実行する)
   *
   * @param dataInput TwinMakerが管理するクラウド側データソース
   * @param dataBindingTemplate TwinMakerの設定パラメータ、データソースの紐づけ変数
   * @param getSceneRuleMapById 関数: ルールをTwinMakerから取得する関数
   */
  execData(
    dataInput: IDataInput | undefined,
    dataBindingTemplate: IDataBindingTemplate | undefined,
    getSceneRuleMapById: (
      id?: string | unknown
    ) => Readonly<IRuleBasedMap | undefined>
  ) {
    // 自身が管理するExtraObjectWrapperをすべてさらう
    for (let tag of Object.keys(this._objects)) {
      const wrapper = this._objects[tag];
      if (wrapper && wrapper._anchor) {
        // SiteWiseのクラウド側の最新値を参照する
        const values: Record<string, Primitive> = dataBindingValuesProvider(
          dataInput,
          wrapper._anchor.valueDataBinding,
          dataBindingTemplate
        );
        // TwinMakerの色変更ルールを参照する
        const ruleId = wrapper._anchor.ruleBasedMapId;
        const ruleTarget = ruleEvaluator(
          SystemLoadingStatus.UndefinedState,
          values,
          getSceneRuleMapById(ruleId)
        );
        // 色変更ルールにもとづいた、現在の状態を適用する
        if (ruleTarget) {
          wrapper.stateChange(ruleTarget.target);
        }
      }
    }
  }
}
