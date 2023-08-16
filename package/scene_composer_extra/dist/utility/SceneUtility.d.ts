import { Object3D, Event, WebGLRenderer, Scene } from "three/src/Three";
import { RootState } from "@react-three/fiber";
import { SceneController } from "../controllers/SceneController";
import { ReplaceTag } from "../controllers/TagController";
/** ルートシーンを取得する */
export declare function findRootScene(target: Object3D<Event> | undefined): Object3D<Event> | undefined;
/**
 * R3FのStateを取得する(GLRenderer、Scene、Cameraが取得できる)
 */
export declare function getState(rootScene: Scene): RootState;
/**
 * TwinMakerのシーン描画(色の描画)をMMDに合わせて調整する
 */
export declare function setupSceneForMMD(gl: WebGLRenderer): void;
/** シーンコントローラーを作成する関数 */
type SceneControllerFactory = (composerId: string, replaceTag: ReplaceTag) => SceneController;
/**
 * シーンコントローラを利用する
 *
 * @param factory SceneControllerを作成する関数
 */
export declare function useSceneController(factory: SceneControllerFactory): SceneController;
export {};
