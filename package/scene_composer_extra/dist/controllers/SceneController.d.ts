import { Object3D, Event } from "three/src/Three";
import { ISceneNodeInternal } from "@iot-app-kit/scene-composer/dist/src/store";
import { ISceneFieldInterface } from "../types/ISceneField";
import { IDataBindingTemplate, IDataInput, IRuleBasedMap } from "@iot-app-kit/scene-composer";
export declare enum SceneControllerState {
    Initialize = 0,
    Active = 1
}
export declare class SceneController {
    private _composerId;
    private _interface;
    private _objects;
    private _mouse;
    private _raycaster;
    private _selectState;
    constructor(composeId: string, sceneInterface: ISceneFieldInterface);
    private searchRootScene;
    /**
     * シーンの状態を更新する
     * @param current
     * @param rootScene
     */
    private onUpdateScene;
    /**
     * コンポーザーIDを参照する
     */
    get composerId(): string;
    /**
     * 実行する(0.5秒に1回実行する)
     * Reactの変数は再生成で破棄されるため、必要に応じてRedux管理できるよう、コアの状態管理変数はインスタンス外に出しておく
     *
     * @param state 現在のSceneコントローラーの状態を管理する変数
     * @param nodeMap TwinMakerのノード状態(S3ファイルから取得した画面構成情報)
     * @param getObject3DBySceneNodeRef 関数: ノード情報からjsオブジェクトを参照する関数
     * @returns state : 更新後のstateを返却する
     */
    exec(state: SceneControllerState, nodeMap: Record<string, ISceneNodeInternal>, getObject3DBySceneNodeRef: (ref: string | undefined) => Object3D<Event> | undefined): SceneControllerState;
    /**
     * データの更新を実行する(0.5秒に1回実行する)
     *
     * @param dataInput TwinMakerが管理するクラウド側データソース
     * @param dataBindingTemplate TwinMakerの設定パラメータ、データソースの紐づけ変数
     * @param getSceneRuleMapById 関数: ルールをTwinMakerから取得する関数
     */
    execData(dataInput: IDataInput | undefined, dataBindingTemplate: IDataBindingTemplate | undefined, getSceneRuleMapById: (id?: string | undefined) => Readonly<IRuleBasedMap | undefined>): void;
}
