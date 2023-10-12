# IoT App Kit Extra

<a href="./README.md">>> README - English</a>

このライブラリは、AWS IoT App Kit の SceneComposer を拡張します。

![](./images/tag-image.png)

<div style="text-align:center; font-weight:bold">↓ タグをMMDモデルに置き換えます ↓</div>

![](./images/mmd-image.gif)

- TwinMaker のタグオブジェクトを、TwinMaker で本来表示しないオブジェクト（MMD、ボタン、テキストなど）に置き換えます
- TwinMaker のタグの色変化をトリガーにして、MMD のモーションの変更、テキストの内容変更を行います

IoT App Kit に強く依存します。

https://github.com/awslabs/iot-app-kit

デモのサンプル URL はこちらです

https://shotaoki.github.io/iot-app-kit-extra-document/?content=demo

## ドキュメント

https://shotaoki.github.io/iot-app-kit-extra/

## コンセプト

TwinMaker が実装しない範囲のことを簡単に実現する

## 必要条件

IoT App Kit に準じる

#### 言語、環境

- Node.js
- React 18.0 Later
- Typescript
- VSCode

## 使い方

### クイックスタート（新規作成）

CLI を使って、IoT Extra と TwinMaker を使った Web アプリを簡単に作成できます

```bash
npx @iak-extra/cli create ${Application Name}
```

### インストール（既存のアプリに追加）

もし既存の Web アプリに IoT Extra を追加する必要があるのなら、NPM でインストールすることができます

```bash
npm install @iak-extra/scene-composer-extra
```

### タグを用意する

TwinMaker にあらかじめタグを作成しておきます。

タグ名は好きな名前をつけます。たとえば"any-text-tag-name"の名前を付けます。

![](./images/named-tag.png)

### 利用する

useOverrideTags の関数を書くだけで、"any-text-tag-name"の名前を付けたタグが、ThreeMeshUi のテキストオブジェクトに置き換わります。

```typescript
import { initialize } from "@iot-app-kit/source-iottwinmaker";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import { useOverrideTags } from "@iak-extra/scene-composer-extra";

function App() {
  // TwinMakerのシーンを読み込む
  const twinmaker = initialize(/** 認証情報 */);
  const sceneLoader = twinmaker.s3SceneLoader(/** シーン情報 */);

  /** TwinMakerをカスタマイズするコントローラー */
  const controller = useOverrideTags({
    // TwinMakerのタグをテキストに置き換える
    "any-text-tag-name": (replaceTag) =>
      replaceTag.toText?.create({
        content: "TextContents",
      }),
  });

  return (
    <div className="App">
      <SceneViewer
        sceneComposerId={controller.composerId}
        sceneLoader={sceneLoader}
      />
    </div>
  );
}

export default App;
```

同様に、以下のように書くと、タグが MMD に置き換わります。

```typescript
"any-mmd-tag-name": (replaceTag) => {
    replaceTag.toMMD?.create({
        // MMDの初期化情報
    })
}
```

以下のように書くと、タグがボタンに置き換わります

```typescript
"any-button-tag-name": (replaceTag) => {
    replaceTag.toButton?.create({
        // ボタンの初期化情報
    })
    .onClickEvent(() => {
      console.log("clicked !!");
    }),
}
```

他にも、グラフ、表、HTML のウェブサイト等、様々なものへの置き換えが可能です。

## 開発

以下のコマンドを実行することで、ライブラリをインストールします。

```bash
# src/scene_composer_extraで実施する
npm install
```

以下のコマンドで、ライブラリをビルドします。

```bash
# src/scene_composer_extraで実施する
npm run build

# 結果はpackage/scene_composer_extra/distに出力される
```

以下のコマンドで、開発用プロジェクトにライブラリを取り込みます。

```bash
npm install ${ルートディレクトリ}/package/scene_composer_extra
```

以下のコマンドで、NPM にプッシュします。

```bash
# package/scene_composer_extraで実施する
npm publish ./
```

## ライセンス情報

このソースコードのライセンスは MIT です。

リソースに含まれるフォント、イラスト、MMD モデルのライセンスは、著作権者のものであり、そのライセンスに従います。
