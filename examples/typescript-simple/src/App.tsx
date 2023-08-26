import "./App.css";
import { SceneViewer } from "@iot-app-kit/scene-composer";
import {
  useOverrideTags,
  DirectSceneLoader,
  ButtonStyle,
} from "@iak-extra/scene-composer-extra";

function App() {
  const sceneLoader = new DirectSceneLoader("/single-content.json");

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
        .onClickEvent(() => {
          console.log("clicked: 閉じる");
        }),
    // TwinMakerのタグをボタンに置き換える
    初音ミク: (replaceTag) =>
      replaceTag.toMMD
        ?.create({
          angle: 0,
          scale: 0.08,
          pmxPath: "./example/miku_v2.pmd",
          useMotionList: {
            dance: "./example/wavefile_v2.vmd",
          },
        })
        .onStateChangeEvent((mesh, model, state) => {
          return ["dance"];
        }),
    // TwinMakerのタグをボタンに置き換える
    壁の時計: (replaceTag) =>
      replaceTag.toText
        ?.create({
          angle: 0,
          content: "Time",
        })
        .onAnimating((text) => {
          (text as any).set({
            content: new Date().toISOString().split(".")[0],
          });
        }),
    /*
    部屋: (replaceTag) =>
      replaceTag.toGLTF?.create({
        angle: 0,
        modelPath: "/studio_apartment_vray_baked_textures_included.glb",
      }),
      */
  });
  return (
    <SceneViewer
      sceneComposerId={controller.composerId}
      sceneLoader={sceneLoader}
      activeCamera="Camera1"
    />
  );
}

export default App;
