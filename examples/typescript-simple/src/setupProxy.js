const { createProxyMiddleware } = require("http-proxy-middleware");
const ServiceProxy = require("@iak-extra/local-server-proxy");

module.exports = function (app) {
  // proxyFetchを使ったリクエストを、別のドメインに転送する
  ServiceProxy(app, createProxyMiddleware);
};
