import { Unzip, AsyncUnzipInflate, FlateError } from "fflate";
import { DownloadUtility } from "../common/DownloadUtility.js";
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";

/** 入力パラメータ */
export interface CreateReactAppParameter {
  template: string; // テンプレート名
  appName: string; // アプリ名
}

/** テンプレートの一覧 */
export const TEMPLATE_NAME_LIST = [
  "typescript-simple", // ReactAppのテンプレート: AWS権限なし、TwinMakerだけを構築する
];

/** 機能: アプリを作成する */
export class CreateReactApp {
  /**
   * 入力パラメータのチェック
   */
  static check(props: CreateReactAppParameter) {
    console.log("Start CreateReactApp");
    console.log("");
    if (!TEMPLATE_NAME_LIST.includes(props.template)) {
      console.error(`${props.template} is not exist template`);
      console.log(`Allowed templates are ::`);
      for (let name of TEMPLATE_NAME_LIST) {
        console.log(`    "${name}"`);
      }
      return false;
    }
    if (
      !/^[a-zA-Z0-9_-]+$/.test(props.appName) ||
      props.appName.length > 16 ||
      props.appName.length == 0
    ) {
      console.error(`${props.appName} is not valid name`);
      console.log("app name must satisfied [a-zA-Z0-9_-]");
      console.log("app name max length is 16 characters");
      return false;
    }
    return true;
  }
  /**
   * TwinMakerのアプリを作成する
   * @param props : アプリの情報
   */
  static create(props: CreateReactAppParameter) {
    // react-projectのテンプレート情報を参照する
    const downloadTemplate = JSON.parse(
      readFileSync(
        resolve(
          DownloadUtility.getCurrentFileDirectory(import.meta.url),
          "template-simple.json"
        ),
        { encoding: "utf8" }
      )
    );
    // テンプレートからURLを取得する
    const url = downloadTemplate[props.template]["url"];
    // URLのファイルをダウンロードする
    DownloadUtility.downloadResponse(url).then((item: any) => {
      // ZIPファイルのデータ
      const receivedItem: Uint8Array = item;
      // 展開用のインスタンス
      const unzipper = new Unzip();
      unzipper.register(AsyncUnzipInflate);
      // 展開時のそれぞれのファイルに対する処理を登録する
      unzipper.onfile = (file) => {
        const writeDirectory = resolve(
          process.cwd(),
          props.appName,
          ...file.name.split("/").slice(1)
        );
        if (file.originalSize) {
          // ディレクトリを作成する
          if (!existsSync(dirname(writeDirectory))) {
            mkdirSync(dirname(writeDirectory), { recursive: true });
          }
          // ファイルを出力する
          const writeTarget = createWriteStream(writeDirectory, "utf8");
          file.ondata = (
            err: FlateError | null,
            data: Uint8Array,
            final: boolean
          ) => {
            // 出力中にエラーがあればログに出力する
            if (err) {
              console.error("Failed to save");
              console.error(err);
              writeTarget.end();
              return;
            }
            // ファイルに出力する
            writeTarget.write(data);
            if (final) writeTarget.end();
          };
          file.start();
        }
      };
      // ZIPを展開する
      unzipper.push(receivedItem);
    });
  }

  static help() {
    console.log("[Required Parameters]");
    console.log("    ${app Name}");
    console.log("        Application Name");
    console.log("[Parameters]");
    console.log("    --template, -t");
    console.log("    Choose resource name in");
    for (let name of TEMPLATE_NAME_LIST) {
      console.log("        " + name);
    }
  }
}
