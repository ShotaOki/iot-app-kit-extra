import { UserConfigExport, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { basename } from "path";

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
    plugins: [react()],
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
          find: /^@matterport\/webcomponent/,
          replacement: path.join(
            __dirname,
            "node_modules/@matterport/webcomponent"
          ),
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
