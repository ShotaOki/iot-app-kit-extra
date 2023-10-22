import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig((mode) => {
  const config = {
    build: {
      outDir: "build",
    },
    assetsInclude: ["**/*.hdr"],
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
    },
    resolve: {
      alias: {
        path: "rollup-plugin-node-polyfills/polyfills/path",
      },
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
            name: "hdr-development-loader-plugins",
            setup(build) {
              build.onLoad({ filter: /\.hdr$/ }, async (args) => {
                return {
                  // import file from "any.hdr"はファイルパスを参照するため、
                  // text形式で外部ファイルのパスとしてロードする
                  loader: "text",
                  // localhostのpublicディレクトリにあるhdrを参照する
                  contents: `http://localhost:${config.server.port}/${
                    args.split("/")[-1]
                  }`,
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
