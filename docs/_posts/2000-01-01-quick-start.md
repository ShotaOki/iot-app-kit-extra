---
title: クイックスタート
author: Shota Oki
date: 2023-08-20
category: Jekyll
layout: post
---

## 新規アプリを作成する

すぐにセットアップを完了して、Webアプリのコーディングを開始します

**前提条件**

- Node.js がインストール済みであることが必要です
- AWS のアカウントや認証情報はあると便利ですが、無くても大丈夫です

**新規の Web アプリを作成する**

1. コマンドプロンプトで、以下のコマンドを実行します。

```bash
npx @iak-extra/cli create ${作りたいアプリの名前}
```

手順はこれだけです。あとはコマンドの完了を数分待ちます。  
`npm start`を実行すると、開発用サーバで Web アプリが動作します。

**アプリのレイアウトをカスタマイズする**

1. AWS のアカウントがあるのなら、マネジメントコンソールを開いて、TwinMaker のシーンを編集します。

2. 好きな場所にタグ（青い丸）を配置していきます。タグには名前を付けます  
   ![レイアウト]({{site.baseurl}}/images/create-project-1-put-tags.png)

3. 配置が終わったら、TwinMaker が自動生成した S3 のバケットを確認します  
   ※2 の手順で編集したシーンと同じ名前の JSON ファイルがあります
```bash
# バケット名
s3://twinmaker-workspace-${ワークスペース名}-${アカウントID}-iad
```

4. JSON ファイルを、Web アプリの`/public/single-content.json`と置き換えます  
> AWSのアカウントがないのなら、single-content.json にある座標を直接編集します

**タグ（青い丸）を目的のオブジェクトに置き換える**

1. useOverrideTagsを実行して、タグを置き換えます  
```jsx
  const controller = useOverrideTags({
    // タグにつけた名前
    "tag-name-mmd": (replaceTag) =>
      replaceTag.toMMD // 置き換えたいもの
        ?.create({
         /** ものの設定 */
        })
  });
```

**ビルドする**

1. ビルドコマンドを実行すると、Webアプリが作成されます。S3等に配置します。  
```bash
npm run build
```

---

## 既存のアプリに追加する

既存のReactアプリがあるのなら、以下のコマンドでscene-composer-extraを追加します。

**依存ライブラリをインストールします**

```bash
npm install @iak-extra/scene-composer-extra --legacy-peer-deps
```

**もし正常に動作しない場合、以下の点の確認が必要です**

- three.js と関係するライブラリのバージョンを、scene-composer に合わせます


---
