import {
  Object3D,
  Event,
  PCFSoftShadowMap,
  LinearEncoding,
  LinearToneMapping,
  WebGLRenderer,
  Scene,
} from "three/src/Three";
import { RootState } from "@react-three/fiber";
import { useStore } from "@iot-app-kit/scene-composer/dist/src/store";
import {
  SceneController,
  SceneControllerState,
} from "../controllers/SceneController";
import { useState, useEffect, useMemo } from "react";
import { ReplaceTag } from "../controllers/TagController";
import { generateUUID } from "three/src/math/MathUtils";

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
  return d3fScene.__r3f.root.getState() as RootState;
}

/**
 * TwinMakerのシーン描画(色の描画)をMMDに合わせて調整する
 */
export function setupSceneForMMD(gl: WebGLRenderer) {
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = PCFSoftShadowMap;
  // LinearEncodingにすると色彩が強くなる
  gl.outputEncoding = LinearEncoding;
  gl.toneMapping = LinearToneMapping;
}

/** シーンコントローラーを作成する関数 */
type SceneControllerFactory = (
  composerId: string,
  replaceTag: ReplaceTag
) => SceneController;

/**
 * シーンコントローラを利用する
 *
 * @param factory SceneControllerを作成する関数
 */
export function useSceneController(
  factory: SceneControllerFactory
): SceneController {
  // 任意のコンポーザーID: SceneComposerに対して固定値を指定する
  const composerId = useMemo(() => generateUUID(), []);

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
    () => factory(composerId, new ReplaceTag(getObject3DBySceneNodeRef)),
    [composerId, getObject3DBySceneNodeRef]
  );

  useEffect(() => {
    /** 500msごとに状態を監視する */
    const timer = setInterval(() => {
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
    getSceneRuleMapById,
  ]);

  return controller;
}
