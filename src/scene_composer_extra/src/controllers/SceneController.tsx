import {
  Raycaster,
  Vector2,
  AmbientLight,
  Object3D,
  Event,
  Scene,
} from "three/src/Three";
import { ISceneNodeInternal } from "@iot-app-kit/scene-composer/dist/src/store";
import {
  findRootScene,
  getState,
  setupSceneForMMD,
} from "../utility/SceneUtility";
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
import { searchTag } from "./TagController";
import { SystemLoadingStatus } from "../types/DataType";
import ThreeMeshUI from "three-mesh-ui";

export enum SceneControllerState {
  Initialize,
  Active,
}

export class SceneController {
  // コンポーザーID
  private _composerId: string;
  // シーンの更新通知関数
  private _interface: ISceneFieldInterface;
  // Tagを置き換えたあとのオブジェクト管理インスタンス
  private _objects: { [key: string]: ExtraObjectWrapper };
  // マウスクリック位置
  private _mouse: Vector2 | null;
  // レイキャスト
  private _raycaster: Raycaster;
  // 選択状態
  private _selectState: boolean;

  constructor(composeId: string, sceneInterface: ISceneFieldInterface) {
    this._composerId = composeId;
    this._interface = sceneInterface;
    this._objects = {};
    this._raycaster = new Raycaster();
    this._selectState = false;
    this._mouse = null;

    window.addEventListener("pointermove", (event) => {
      this._mouse = new Vector2();
      this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("pointerdown", () => {
      this._selectState = true;
    });

    window.addEventListener("pointerup", () => {
      this._selectState = false;
    });

    window.addEventListener("touchstart", (event) => {
      this._selectState = true;
      this._mouse = new Vector2();
      this._mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this._mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("touchend", () => {
      this._selectState = false;
      this._mouse = null;
    });

    const that = this;
    function animate() {
      requestAnimationFrame(animate);

      Object.keys(that._objects).forEach((k) => {
        that._objects[k].executeAnimationLoop({
          mouse: that._mouse,
          isSelect: that._selectState,
          raycaster: that._raycaster,
        });
      });

      // アニメーションの状態を更新
      ThreeMeshUI.update();
    }
    animate();
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
      // ライティングを設定する
      rootScene.add(new AmbientLight(0xffffff, 0.7));
      // RendererをMMDに合わせて最適化する
      const { gl } = getState(rootScene);
      setupSceneForMMD(gl);
    }
  }

  /**
   * コンポーザーIDを参照する
   */
  get composerId() {
    return this._composerId;
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
        const overrides = this._interface.overrideTags(rootScene as Scene);
        // 上書き対象のオブジェクトをさらう
        for (let tag of Object.keys(overrides)) {
          // 上書きを実行、成功すれば_objects変数に保持する
          const wrapper = searchTag(nodeMap, tag, overrides[tag]);
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
      id?: string | undefined
    ) => Readonly<IRuleBasedMap | undefined>
  ) {
    // 自身が管理するExtraObjectWrapperをすべてさらう
    for (let tag of Object.keys(this._objects)) {
      const wrapper = this._objects[tag];
      if (wrapper && wrapper._anchor) {
        // SiteWiseのクラウド側の最新値を参照する
        const values: Record<string, unknown> = dataBindingValuesProvider(
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
          wrapper.stateChange(ruleTarget);
        }
      }
    }
  }
}
