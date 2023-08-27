---
title: Quick Start
author: Shota Oki
date: 2023-08-20
category: Jekyll
layout: post
---

## クイックスタート

すぐにセットアップを完了して、コーディングを開始、Web サイトとしてデプロイします

**TypeScript を使う場合**

※認証情報、AWS の設定は不要です

1. このリポジトリの`examples/typescript-samples`をローカルにコピーします

2. セットアップ用のコマンドを実行します

```bash
npm run download

npm install
```

3. React を実行して、サーバーを立てます

```bash
npm run start
```

4. ブラウザで`http://localhost:3000`にアクセスすると、TwinMaker が動きます  
    `App.tsx`と`single-content.json`を編集して、好きなコンテンツを作ります  
   `single-content.json`は TwinMaker のシーンファイルです。末尾が iad の S3 バケットからコピーすることができます。

5. `npm run build`で SPA の Web サイトを作成して、サーバー（S3 など）にデプロイすることもできます
