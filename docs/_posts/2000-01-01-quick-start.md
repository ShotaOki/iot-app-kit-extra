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

1. IoT App Kit のテンプレートをダウンロード、zip ファイルを展開します

```bash
# テンプレートをダウンロードします
curl https://raw.githubusercontent.com/ShotaOki/iot-app-kit-extra/main/templates/typescript-simple.zip -o typescript-simple.zip
```

2. 展開したテンプレートの中で、セットアップ用のコマンドを実行します

```bash
# 展開後、package.jsonのあるディレクトリに移動します
cd typescript-simple

# アセットファイルをダウンロードします
npm run download

# 依存ライブラリをインストールします
npm install --legacy-peer-deps
```

3. React を実行して、サーバーを立てます

```bash
# サーバをlocalhost:3000で立ち上げます
npm run start
```

4. ブラウザで`http://localhost:3000`にアクセスすると、TwinMaker が動きます  
    `App.tsx`と`single-content.json`を編集して、好きなコンテンツを作ります  
   `single-content.json`は TwinMaker のシーンファイルです。末尾が iad の S3 バケットからコピーすることができます。

5. `npm run build`で SPA の Web サイトを作成して、サーバー（S3 など）にデプロイすることもできます
