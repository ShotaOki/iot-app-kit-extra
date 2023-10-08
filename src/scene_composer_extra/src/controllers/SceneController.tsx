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
import { ReplaceContext, searchTag } from "./TagController";
import { SystemLoadingStatus } from "../types/DataType";
import ThreeMeshUI from "three-mesh-ui";
import { HTMLModelWrapper } from "../objects/html/HTMLModelWrapper";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";

export enum SceneControllerState {
  Initialize,
  Active,
}

export class SceneController {
  // コンポーザーID
  private _composerId: string;
  // コンテキスト
  private _context: ReplaceContext;
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
  // ウィンドウの幅と高さ
  private _windowWidth: number;
  private _windowHeight: number;
  private _windowTop: number;
  private _windowLeft: number;
  // CSS3DRenderer
  private _css3DRenderer: CSS3DRenderer;

  constructor(
    composeId: string,
    context: ReplaceContext,
    sceneInterface: ISceneFieldInterface
  ) {
    this._composerId = composeId;
    this._context = context;
    this._interface = sceneInterface;
    this._objects = {};
    this._raycaster = new Raycaster();
    this._selectState = false;
    this._mouse = null;
    this._windowWidth = window.innerWidth;
    this._windowHeight = window.innerHeight;
    this._windowTop = 0;
    this._windowLeft = 0;
    this._css3DRenderer = new CSS3DRenderer();
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

  private setupPointerEvent() {
    window.addEventListener("pointermove", (event) => {
      this._mouse = new Vector2();
      const x = event.clientX - this._windowLeft;
      const y = event.clientY - this._windowTop;
      this._mouse.x = (x / this._windowWidth) * 2 - 1;
      this._mouse.y = -(y / this._windowHeight) * 2 + 1;
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
      const x = event.touches[0].clientX - this._windowLeft;
      const y = event.touches[0].clientY - this._windowTop;
      this._mouse.x = (x / this._windowWidth) * 2 - 1;
      this._mouse.y = -(y / this._windowHeight) * 2 + 1;
    });

    window.addEventListener("touchend", () => {
      this._selectState = false;
      this._mouse = null;
    });
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
      const { gl, camera } = getState(rootScene);
      setupSceneForMMD(gl);
      // 3Dキャンバスの表示位置を参照する
      const canvasList = document.querySelectorAll("canvas");
      let top = 0;
      let left = 0;
      let width = window.innerWidth;
      let height = window.innerHeight;
      canvasList.forEach((item) => {
        if (item.dataset.engine && item.dataset.engine.startsWith("three.js")) {
          // 画面サイズを取得する
          const rect = item.getBoundingClientRect();
          top = rect.top;
          left = rect.left;
          width = rect.width;
          height = rect.height;
          // リサイズを監視する
          const observer = new ResizeObserver((_) => {
            // リサイズ後の画面サイズを再取得する
            const contentRect = item.getBoundingClientRect();
            this._windowTop = contentRect.top;
            this._windowLeft = contentRect.left;
            this._windowWidth = contentRect.width;
            this._windowHeight = contentRect.height;
            HTMLModelWrapper.updateSize(
              this._css3DRenderer,
              contentRect.width,
              contentRect.height,
              contentRect.top,
              contentRect.left
            );
          });
          observer.observe(item);
        }
      });
      this._windowTop = top;
      this._windowLeft = left;
      this._windowWidth = width;
      this._windowHeight = height;
      // ボタン操作のイベントを設定する
      this.setupPointerEvent();
      // CSS3 HTMLのレンダラを参照する
      const model = HTMLModelWrapper.initiate(
        this._css3DRenderer,
        width,
        height,
        top,
        left
      );
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

        Object.keys(that._objects).forEach((k) => {
          that._objects[k].callAnimationLoop({
            mouse: that._mouse,
            isSelect: that._selectState,
            raycaster: that._raycaster,
            cameraState: cameraState,
          });
        });

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
