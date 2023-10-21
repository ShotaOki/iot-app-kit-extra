// Production以外の環境ではrequireできないため、先にrequireしてキャッシュしておく
process.env.NODE_ENV = "production";
require("workbox-webpack-plugin");

// 環境をdevelopmentで固定する
process.env = new Proxy(process.env, {
  get: (_, parameter) => {
    // ビルド環境をdevelopmentに固定する
    if (parameter === "BABEL_ENV" || parameter === "NODE_ENV") {
      return "development";
    }
    // eslint-disable-next-line no-undef
    return Reflect.get(...arguments);
  },
  set: () => true,
});

// react app rewiredのビルドを実行する
require(`./node_modules/react-app-rewired/scripts/build`);
