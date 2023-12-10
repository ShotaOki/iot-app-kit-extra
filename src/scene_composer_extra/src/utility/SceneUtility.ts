import { Object3D, Event, Scene } from "three/src/Three";
import { RootState } from "@react-three/fiber";
import { useStore } from "@iot-app-kit/scene-composer/dist/src/store";
import useMatterportViewer from "@iot-app-kit/scene-composer/dist/src/hooks/useMatterportViewer";
import {
  SceneController,
  SceneControllerState,
} from "../controllers/SceneController";
import { useState, useEffect, useMemo } from "react";
import { ReplaceContext } from "../controllers/TagController";
import { generateUUID } from "three/src/math/MathUtils";
import { OverrideTagsParameter } from "../types/DataType";

/** ルートシーンを取得する */
export function findRootScene(target: Object3D<Event> | undefined) {
  if (target === undefined) {
    return undefined;
  }
  let current: Object3D<Event> = target;
  while (current.parent !== undefined && current.parent !== null) {
    current = current.parent as Object3D<Event>;
  }
  return current;
}

/**
 * R3FのStateを取得する(GLRenderer、Scene、Cameraが取得できる)
 */
export function getState(rootScene: Scene): RootState {
  const d3fScene: any = rootScene;
  // 直下がr3fを持っている＝Matterportを利用していない場合なら、そのオブジェクトを返す
  if (d3fScene.__r3f) {
    return d3fScene.__r3f.root.getState() as RootState;
  }
  // Matterportを利用すると子要素がr3fの情報を持つため、子要素から返す
  const states: RootState[] = d3fScene.children
    .filter((child: any) => child.__r3f && child.__r3f.root)
    .map((child: any) => child.__r3f.root.getState() as RootState);
  if (states.length >= 1) {
    return states[0];
  }
  throw new Error("Undefined R3F RootState");
}

/**
 * シーンの初期化パラメータ
 */
export interface SceneParameterType {
  // コンポーザID: 未指定の場合は乱数で発行する
  sceneComposerId?: string;
}

/**
 * ユーティリティ: タグの上書きをする
 * useSceneControllerのoverrideTagsだけを実行して、SceneControllerを返す
 *
 * @param factory OverrideTagsParameterを作成する関数
 */
export function useOverrideTags(
  parameter: OverrideTagsParameter,
  sceneParameter?: SceneParameterType
): SceneController {
  return useSceneController((composerId, context) => {
    return new SceneController(composerId, context, {
      overrideTags: parameter,
    });
  }, sceneParameter ?? {});
}

/** シーンコントローラーを作成する関数 */
type SceneControllerFactory = (
  composerId: string,
  context: ReplaceContext
) => SceneController;

/**
 * シーンコントローラを利用する
 *
 * @param factory SceneControllerを作成する関数
 */
export function useSceneController(
  factory: SceneControllerFactory,
  parameter: SceneParameterType
): SceneController {
  const memoDependencies = [];
  if (parameter?.sceneComposerId) {
    // パラメータにSceneComposerIdがあるのなら、更新を監視する
    memoDependencies.push(parameter.sceneComposerId);
  }
  // 任意のコンポーザーID: SceneComposerに対して固定値を指定する
  const composerId = useMemo(
    () => parameter?.sceneComposerId ?? generateUUID(),
    memoDependencies
  );

  /** 状態の管理フラグ */
  let [initializedFlag, setInitializedFlag] = useState(
    SceneControllerState.Initialize
  );

  // TwinMaker（クラウド側）の画面構成情報を参照する(※nodeMap＝S3にあるJsonデータのこと)
  const nodeMap = useStore(composerId)((state) => state.document.nodeMap);
  // Jsonのタグ情報に紐づいた3Dオブジェクトを参照する
  const getObject3DBySceneNodeRef = useStore(composerId)(
    (state) => state.getObject3DBySceneNodeRef
  );
  // データ参照変数を取る
  const { dataInput, dataBindingTemplate, getSceneRuleMapById } = useStore(
    composerId
  )((state) => state);
  /** コントローラを作成する */
  const controller = useMemo(
    () => factory(composerId, new ReplaceContext(getObject3DBySceneNodeRef)),
    [composerId, getObject3DBySceneNodeRef]
  );

  /** MatterportViewerを有効にするのなら、処理の一部を変更する */
  const { enableMatterportViewer } = useMatterportViewer();

  useEffect(() => {
    /** 500msごとに状態を監視する */
    const timer = setInterval(() => {
      // もしMatterportViewerの読み込みフラグが立っているのなら
      if (enableMatterportViewer) {
        // MatterportViewerのタグを検証する
        if (!document.querySelector("matterport-viewer")) {
          return;
        }
      }
      /** 500msごとに状態を更新する */
      setInitializedFlag(
        controller.exec(initializedFlag, nodeMap, getObject3DBySceneNodeRef)
      );
      controller.execData(
        dataInput,
        dataBindingTemplate,
        getSceneRuleMapById as any
      );
    }, 500);
    // useEffectのデストラクタ
    return () => {
      clearInterval(timer);
    };
  }, [
    nodeMap,
    getObject3DBySceneNodeRef,
    initializedFlag,
    controller,
    dataInput,
    dataBindingTemplate,
    enableMatterportViewer,
    getSceneRuleMapById,
  ]);

  return controller;
}
