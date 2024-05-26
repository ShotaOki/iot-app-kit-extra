import "./App.css";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import {
  useOverrideTags,
  DirectSceneLoader,
  ButtonStyle,
  proxyFetch,
} from "@iak-extra/scene-composer-extra";
import { useMemo } from "react";
import { applyMode, Mode } from "@cloudscape-design/global-styles";

applyMode(Mode.Dark);

function App() {
  /** ローカルからシーンを読み込みます */
  const sceneLoader = useMemo(
    () => new DirectSceneLoader("/single-content.json"),
    []
  );

  /** TwinMakerのタグを上書きする */
  const controller = useOverrideTags({
    // TwinMakerのタグをボタンに置き換える
    壁のボタン: (replaceTag) =>
      replaceTag.toButton
        ?.create({
          angle: 90,
          content: "Close",
          width: 0.7,
          height: 0.24,
          stateStyle: ButtonStyle.Standard,
        })
        .onClick(() => {
          // ボタンの押下を受け取ります
          console.log("clicked: 閉じる");
          // proxyFetchはfetch互換のAPIです。npm run start時だけ動作します
          // proxyFetchは、どのドメインからもCORSの制限を受けません
          proxyFetch("https://www.w3.org/").then((r) => {
            r.text().then((t) => {
              console.log(t);
            });
          });
        }),
    // TwinMakerのタグをボタンに置き換える
    初音ミク: (replaceTag) =>
      replaceTag.toMMD
        ?.create({
          angle: 0,
          scale: 0.08,
          pmxPath: "/example/miku_v2.pmd",
          useMotionList: {
            dance: "/example/wavefile_V2.vmd",
          },
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .onStateChangeEvent((mesh, model, state) => {
          // 初期化の完了時、またはタグの色がiotデータで変わった時に、通知を受けます
          // useMotionListで指定したモーション名を返すと、MMDのモーションを再生します
          return ["dance"];
        }),
    // TwinMakerのタグをボタンに置き換える
    壁の時計: (replaceTag) =>
      replaceTag.toText
        ?.create({
          angle: 0,
          content: "Time",
        })
        .onTick((text) => {
          // 毎フレーム実行を受けます
          // setで表示内容を変更します
          text.set({
            content: new Date().toISOString().split(".")[0],
          });
        }),
    部屋: (replaceTag) =>
      replaceTag.toGLTF?.create({
        angle: 0,
        modelPath: "/example/studio_apartment_vray_baked_textures_included.glb",
      }),
  });
  // シーンの再生成を抑えるために、Memo化します
  // ※イベント（例：onWidgetClick）がないのなら、Memo化しなくても問題ありません
  const scene = useMemo(
    () => (
      <SceneViewer
        sceneComposerId={controller.composerId}
        sceneLoader={sceneLoader}
        activeCamera="Camera1"
      />
    ),
    [controller.composerId, sceneLoader]
  );
  return <>{scene}</>;
}

export default App;
