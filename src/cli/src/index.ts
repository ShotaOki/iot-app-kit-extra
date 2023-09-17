import {
  CreateReactApp,
  CreateReactAppParameter,
  TEMPLATE_NAME_LIST,
} from "./create_react_app/CreateReactApp.js";
import {
  DownloadResource,
  DownloadResourceParameter,
  RESOURCE_LIST,
} from "./download_resource/DownloadResource.js";

export const CREATE_REACT_APP_RESOURCE_LIST = TEMPLATE_NAME_LIST;
export const DOWNLOAD_RESOURCE_LIST = RESOURCE_LIST;

/**
 * アプリを作成する
 */
export function createReactApp(props: CreateReactAppParameter) {
  // 入力が不正なら処理を中断する
  if (!CreateReactApp.check(props)) {
    return;
  }

  // アプリを作成する
  CreateReactApp.create(props);

  // 標準テンプレートだった場合
  if (props.template == "typescript-simple") {
    // アプリの必要なリソースをダウンロードする
    DownloadResource.download({ name: "example-twinmaker" }, props.appName);
  }
}

/**
 * リソースをダウンロードする
 */
export function download(props: DownloadResourceParameter) {
  // 入力が不正なら処理を中断する
  if (!DownloadResource.check(props)) {
    return;
  }

  // リソースをダウンロードする
  DownloadResource.download(props);
}

export function help() {
  console.log("[Method]");
  console.log("@iak-extra/cli create ${AppName}");
  console.log("    Create React App With TwinMaker");
  console.log("@iak-extra/cli download ${Name}");
  console.log("    Download Static Resource");
}

/**
 * ヘルプを出力: アプリを作成する
 */
export function helpCreateReactApp() {
  CreateReactApp.help();
}

/**
 * ヘルプを出力: リソースをダウンロード
 */
export function helpDownload() {
  DownloadResource.help();
}
