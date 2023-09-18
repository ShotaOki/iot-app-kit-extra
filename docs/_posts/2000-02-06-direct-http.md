---
title: HTTPリクエストの送信
author: Shota Oki
date: 2023-08-20
category: Jekyll
layout: post
---

## HTTP リクエストの送信

### CORS に対応したサービスへのリクエスト

通常の Web アプリと同様に、fetch を使ってリクエストを投げることができます

```jsx
// fetchでHTTPリクエストを送信する
fetch("https://anyurl/path").then((response) => {
  response.text((data) => {
    console.log(data);
  });
});
```

### CORS に対応していないサービスへのリクエスト

CORS に対応していないサービスに fetch を投げるには、`proxyFetch` を利用します

手順 1. 必要なライブラリをインストールします

```bash
npm install @iak-extra/local-server-proxy --legacy-peer-deps
```

手順 2. 次の内容で、`src/setupProxy.js` のファイルを作成します

```jsx
const { createProxyMiddleware } = require("http-proxy-middleware");
const ServiceProxy = require("@iak-extra/local-server-proxy");

module.exports = function (app) {
  // proxyFetchを通したリクエストを、サーバ側から転送する
  ServiceProxy(app, createProxyMiddleware);
};
```

手順 3. fetch を proxyFetch に置き換えます

```jsx
// proxyFetchをインポートする
import { proxyFetch } from "@iak-extra/scene-composer-extra";

// fetchと同じ使用感で利用できます。引数、戻り値はfetchと同じです
proxyFetch("https://anyurl/path").then((response) => {
  response.text((data) => {
    console.log(data);
  });
});
```
