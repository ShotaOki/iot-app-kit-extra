import { SceneLoader } from "@iot-app-kit/source-iottwinmaker/dist/es/types";

/**
 * シーンローダーの拡張クラス
 *
 * publicにあるTwinMakerのファイルを直接参照する
 */
export class DirectSceneLoader implements SceneLoader {
  public getSceneUri: () => Promise<string | null>;
  public getSceneObject: (uri: string) => Promise<ArrayBuffer> | null;
  /**
   * コンストラクタ
   * @param fileUrl public以下に配置したTwinMakerの構造を指したjsonファイルのパス
   */
  constructor(fileUrl: string) {
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
  }
}
