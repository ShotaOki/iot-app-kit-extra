import { DownloadUtility } from "../common/DownloadUtility.js";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

export interface DownloadResourceParameter {
  name: string;
}

interface TemplateFormat {
  url: string;
  path: string;
  directory: string;
  message: string[];
}

export const RESOURCE_LIST = [
  "example-twinmaker", // TwinMakerプロジェクトのサンプルデータ
  "font-japanese", // 日本語フォント
];

export class DownloadResource {
  static check(props: DownloadResourceParameter) {
    console.log("Start DownloadResource");
    console.log("");
    if (!RESOURCE_LIST.includes(props.name)) {
      console.error(`${props.name} is not exist name`);
      console.log(`Allowed names are ::`);
      for (let name of RESOURCE_LIST) {
        console.log(`    "${name}"`);
      }
      return false;
    }
    return true;
  }
  static download(props: DownloadResourceParameter, prefix?: string) {
    // テンプレートをパースする
    const templates: TemplateFormat[] = JSON.parse(
      readFileSync(
        resolve(
          DownloadUtility.getCurrentFileDirectory(import.meta.url),
          `${props.name}.json`
        ),
        { encoding: "utf8" }
      )
    ) as TemplateFormat[];
    // ファイルをダウンロードするパスを定義
    for (let template of templates) {
      console.log("=====================");
      const pathName = resolve(
        process.cwd(),
        prefix !== undefined ? `${prefix}/public` : "public",
        template.directory,
        template.path
      );
      // ディレクトリを作成する
      if (!existsSync(dirname(pathName))) {
        mkdirSync(dirname(pathName), { recursive: true });
      }
      // ファイルをダウンロードする
      DownloadUtility.download(template.url, pathName);
      for (let message of template.message) {
        console.log(message);
      }
      console.log("=====================");
      console.log("");
    }
  }

  static help() {
    console.log("[Parameters REQUIRED]");
    console.log("${Name}");
    console.log("    Choose resource name in");
    for (let name of RESOURCE_LIST) {
      console.log("        " + name);
    }
  }
}
