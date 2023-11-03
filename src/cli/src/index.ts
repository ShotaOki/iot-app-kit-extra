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

  console.log(">> 1. Download template");

  // アプリを作成する
  const installOption = CreateReactApp.create(props);

  // 標準テンプレートだった場合
  console.log(">> 2. Download example resources");

  // アプリの必要なリソースをダウンロードする
  DownloadResource.download({ name: "example-twinmaker" }, props.appName);

  console.log(">> 3. Execute NPM install command");

  // Npm Installを実行する
  CreateReactApp.install(props, installOption);

  console.log("");
  console.log(`Completed! Created ${props.appName}`);
  console.log("Inside that directory, you can run sevral commands: ");
  console.log("");
  console.log("======================");
  console.log("npm start");
  console.log("    Starts the development server.");
  console.log("npm run build");
  console.log("    Bundles the app into static files for production.");
  console.log("======================");
  console.log("");
  console.log(`We suggest that you begin by typing:`);
  console.log("");
  console.log(`cd ${props.appName}`);
  console.log("npm start");
  console.log("");
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
