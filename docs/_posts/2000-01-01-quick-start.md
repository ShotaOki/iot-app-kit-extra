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

**前提条件**

- SceneComposerを導入したReactアプリが既に存在する


**依存ライブラリをインストールします**

```bash
npm install @iak-extra/scene-composer-extra --legacy-peer-deps
```

**もし正常に動作しない場合、以下の点の確認が必要です**

- three.js と関係するライブラリのバージョンを、scene-composer に合わせます

---

## クラウドと接続する

AWSアカウントを持っていれば、TwinMakerのシーンをAWSアカウント上で管理することができます

**前提条件**

- AWSアカウントを持っている

**接続する方法**

`DirectSceneLoader`は、AWSのアカウントを通さず、publicフォルダの設定だけで動かすための設定です。

**元のソース**

```jsx
const sceneLoader = new DirectSceneLoader("publicディレクトリにあるファイル名")
```

AWSアカウントと連携する場合は、sceneLoaderの取得処理を以下のように書き変えます。

**書き変えた後のソース**

```jsx
  // TwinMakerのシーンを読み込む
  const twinmaker = initialize("TwinMakerのワークスペース名", {
    awsCredentials: {
      accessKeyId: "AWSの認証情報（ACCESS_KEY_ID）",
      secretAccessKey: "AWSの認証情報（シークレットアクセスキー）",
    },
    awsRegion: "リージョン名",
  });
  // 画面情報を読み込む
  const sceneLoader = twinmaker.s3SceneLoader(
    "TwinMakerのシーン名"
  );
```

注意：認証情報をソースに書いたままデプロイしないでください  
※AmplifyのCognitoを使って、ログインユーザーから認証情報を取るなど、ソース外部から認証情報を取るようにしてください

## IoTデータと連携する

AWSが蓄積したリアルタイムなIoTデータと連携して、現実世界をバーチャル世界で可視化する「デジタルツイン」を作ることができます

**前提条件**

- AWSアカウントを持っている

**接続する方法**

以下の設定を書き足すと、リアルタイムなIoT情報と連携できるようになります

```jsx
  // Viewportを定義する
  const viewport = useMemo(() => {
    return {
      // 10m = 過去10分以内の状態を参照する
      duration: "10m",
    };
  }, []);
  // データソースを読み込む
  const queries: any[] = useMemo(
    () => [
      twinmaker.query.timeSeriesData({
        entityId: "AWS TwinMakerのエンティティID",
        componentName: "AWS TwinMakerのコンポーネント名",
        properties: [
          { propertyName: "コンポーネントのプロパティ名" },
        ],
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

// 中略
      <SceneViewer
      // 中略
        queries={queries} // SceneViewerにクエリを追加
        viewport={viewport} // SceneViewerにviewportを追加
      />
```

---
