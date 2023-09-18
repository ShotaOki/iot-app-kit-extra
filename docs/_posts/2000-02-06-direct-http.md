---
title: localhostで動くアプリ
author: Shota Oki
date: 2023-08-20
category: Jekyll
layout: post
---

## HTTP リクエストの送信

基本的なHTTPリクエストは通常の Web アプリと同様です、fetch を使ってリクエストを投げることができます

```jsx
// fetchでHTTPリクエストを送信する
fetch("https://anyurl/path").then((response) => {
  response.text((data) => {
    console.log(data);
  });
});
```

HEMS（住宅の操作）のデジタルツインなど、住宅の中から機器に対して直接接続したい場合があると思います   
宅内サーバからのリクエストは想定していても、ブラウザからの直接のリクエストを想定していません。そういった機器にHTTPリクエストを投げる方法があります

### CORS に対応していないサービスへのリクエスト

CORS に対応していないサービスに fetch を投げるには、`proxyFetch` を利用します

手順 1. 必要なライブラリをインストールします

```bash
npm install @iak-extra/local-server-proxy --legacy-peer-deps
```

手順 2. 次の内容でWebアプリにファイルを作成します。ファイルパスは`src/setupProxy.js`です

```jsx
// src/setupProxy.js
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
