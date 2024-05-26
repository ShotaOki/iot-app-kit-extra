import { UserConfigExport, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { basename } from "path";
import dynamicImport from "vite-plugin-dynamic-import";

export default defineConfig((mode) => {
  // デプロイする対象のパスを設定する
  const VITE_PROJECT_DEPLOYMENT_ROOT = "/";
  // Viteのビルド設定
  const config: UserConfigExport = {
    build: {
      outDir: "build",
    },
    base: VITE_PROJECT_DEPLOYMENT_ROOT,
    assetsInclude: ["**/*.hdr"],
    plugins: [
      /*
       * This plugin is required to resolve the charts-core module as they are dynamically imported
       * when the library is loaded.
       * See the dynamic loading code here: https://github.com/ionic-team/stencil/blob/main/src/client/client-load-module.ts#L32
       * Unfortunately, we are using an older version of the stencil library which doesn't use the syntax vite supports to
       * detect the dynamic imports automatically, so we need to use this plugin to explicitly tell vite to include the
       * charts-core module otherwise their code will not be included in the build.
       */
      dynamicImport({
        filter(id) {
          // `node_modules` is exclude by default, so we need to include it explicitly
          // https://github.com/vite-plugin/vite-plugin-dynamic-import/blob/v1.3.0/src/index.ts#L133-L135
          if (id.includes("/node_modules/@iot-app-kit/charts-core")) {
            console.log("dynamically import entry point", id);
            return true;
          }
        },
        onFiles(files) {
          console.log("dynamically import files", files);
        },
      }),
      react(),
    ],
    server: {
      port: 3000,
      host: true,
    },
    resolve: {
      alias: [
        {
          find: "path",
          replacement: "rollup-plugin-node-polyfills/polyfills/path",
        },
        {
          find: "events",
          replacement: "rollup-plugin-node-polyfills/polyfills/events",
        },
        {
          find: /^@iot-app-kit/,
          replacement: path.join(__dirname, "node_modules/@iot-app-kit"),
        },
        {
          find: /^three\//,
          replacement: path.join(__dirname, "node_modules/three/"),
        },
        {
          find: /^three$/,
          replacement: path.join(__dirname, "node_modules/three"),
        },
      ],
    },
    preview: {
      port: 4000,
    },
  };
  // developmentビルドの時、esbuild向けのHDRのローダーを作成する
  // productionビルドの時は、assetsIncludeでhdrが参照される
  if (mode.mode === "development") {
    config["optimizeDeps"] = {
      esbuildOptions: {
        plugins: [
          {
            name: "hdr-dev-loader-plugins",
            setup(build) {
              build.onLoad({ filter: /\.hdr$/ }, async (args) => {
                return {
                  // import file from "any.hdr"はファイルパスを参照するため、
                  // text形式で外部ファイルのパスとしてロードする
                  loader: "text",
                  // localhostのpublicディレクトリにあるhdrを参照する
                  contents: `http://localhost:${config.server.port}/${basename(
                    args.path
                  )}`,
                };
              });
            },
          },
        ],
      },
    };
  }
  return config;
});
