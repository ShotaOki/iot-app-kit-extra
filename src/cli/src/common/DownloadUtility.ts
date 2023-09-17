import { request, get } from "https";
import { createWriteStream } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

export class DownloadUtility {
  /**
   * ファイルをダウンロードする
   * @param uri リソースのURL
   * @param path ダウンロード先のパス
   * @returns Promise
   */
  static download(uri: string, path: string) {
    return new Promise((resolve, reject) => {
      // ダウンロード処理を非同期で実行する
      request(uri, (response) => {
        response
          .pipe(createWriteStream(path))
          .on("close", resolve)
          .on("error", reject);
      }).end();
    });
  }

  static downloadResponse(uri: string) {
    return new Promise((resolve, reject) => {
      // ダウンロード処理を非同期で実行する
      get(uri, (res) => {
        let body: Uint8Array[] = [];
        res.on("data", (chunk) => {
          body.push(Uint8Array.from(chunk));
        });
        res.on("end", (_: any) => {
          resolve(Buffer.concat(body));
        });
      }).on("error", (e) => {
        console.log(e.message);
        reject(e.message);
      });
    });
  }

  static downloadWithStream(uri: string, stream: NodeJS.WritableStream) {
    return new Promise((resolve, reject) => {
      // ダウンロード処理を非同期で実行する
      request(uri, (response) => {
        response.pipe(stream).on("close", resolve).on("error", reject);
      }).end();
    });
  }

  static downloadResource(rootDirectory: string, downloadList: any[]) {
    return Promise.all(
      downloadList.map((parameter) =>
        DownloadUtility.download(
          parameter.url,
          `${rootDirectory}/${parameter.path}`
        )
      )
    );
  }

  static getCurrentFileDirectory(metaUrl: any) {
    const filename = fileURLToPath(metaUrl);
    return dirname(filename);
  }
}
