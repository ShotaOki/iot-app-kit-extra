import {
  ExternalLibraryConfig,
  KnownSceneProperty,
} from "@iot-app-kit/scene-composer";
import {
  useSceneDocument,
  useViewOptionState,
  accessStore,
} from "@iot-app-kit/scene-composer/dist/src/store";
import { SceneLoader } from "@iot-app-kit/source-iottwinmaker/dist/es/types";
import { useEffect } from "react";

/**
 * シーンローダーの拡張クラス
 *
 * publicにあるTwinMakerのファイルを直接参照する
 */
export class DirectSceneLoader implements SceneLoader {
  public getSceneUri: () => Promise<string | null>;
  public getSceneObject: (uri: string) => Promise<ArrayBuffer> | null;
  public applyExtraConfig: (
    sceneComposerId: string
  ) => ExternalLibraryConfig | undefined;
  /**
   * コンストラクタ
   * @param fileUrl public以下に配置したTwinMakerの構造を指したjsonファイルのパス
   */
  constructor(fileUrl: string, extraParameter?: ExternalLibraryConfig) {
    /**
     * シーンURLを取得する（ダミー）
     */
    this.getSceneUri = async () => {
      return "empty";
    };
    /**
     * シーンオブジェクトを取得する
     */
    this.getSceneObject = async (uri: string) => {
      const res = await fetch(fileUrl);
      return res.arrayBuffer();
    };

    /**
     * Matterportの読み込み開始フラグに必要な情報を更新する
     *
     * @param sceneComposerId シーンコンポーザーのID
     * @param modelId MatterportのモデルID
     */
    const updateMatterportConfigs = (
      sceneComposerId: string,
      modelId: string
    ) => {
      if (sceneComposerId.length >= 1) {
        // MatterportViewerのコネクション名を設定する関数
        const { setConnectionNameForMatterportViewer } =
          useViewOptionState(sceneComposerId);
        // グローバルに設定されたModelIDを参照する
        const { getSceneProperty } = useSceneDocument(sceneComposerId);
        const matterportModelId = getSceneProperty(
          KnownSceneProperty.MatterportModelId
        );
        // ストアを参照する
        const currentStore = accessStore(sceneComposerId);
        useEffect(() => {
          // Matterportのコネクション名を設定する
          // コネクション名が設定されるとextraLibraryのMatterportの接続情報が読み込まれる
          setConnectionNameForMatterportViewer(modelId);
          // グローバルにModelIDを設定する
          currentStore
            .getState()
            .setSceneProperty(KnownSceneProperty.MatterportModelId, modelId);
        }, [
          matterportModelId,
          currentStore,
          setConnectionNameForMatterportViewer,
        ]);
      }
    };

    /**
     * SceneComposerの引数を作成する
     * @return Matterportの接続情報
     */
    this.applyExtraConfig = (sceneComposerId: string) => {
      if (
        extraParameter &&
        extraParameter.matterport &&
        extraParameter.matterport.modelId
      ) {
        // Matterportの読み込み開始フラグを立てる
        updateMatterportConfigs(
          sceneComposerId,
          extraParameter.matterport.modelId
        );
      }
      // Matterportの接続情報を返却する
      return extraParameter;
    };
  }
}
