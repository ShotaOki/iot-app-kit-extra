import {
  ExtraObjectWrapper,
  type ModelParameterBase,
} from "../ExtraObjectWrapper";
import {
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Object3D,
} from "three/src/Three";
import ThreeMeshUI from "three-mesh-ui";
import { AnimationParameter } from "../../types/DataType";

const LOADING_ROTATE_SPEED = 0.06;

export interface MeshUiLoadingParameter extends ModelParameterBase {
  size?: number;
  lineWidth?: number;
}
export class MeshUiLoadingWrapper extends ExtraObjectWrapper {
  _progressMesh?: Object3D;
  _progressBase?: Object3D;

  /**
   * 初期化する
   *
   * @param parameter モデルのパラメータ
   * @returns
   */
  create(parameter: MeshUiLoadingParameter) {
    const loadingSize = parameter.size ?? 0.4;
    const backgroundColor = new Color(0x222222);

    /** コンテナを作成する */
    const container = new ThreeMeshUI.Block({
      justifyContent: "center",
      contentDirection: "row-reverse",
      padding: 0.02,
      borderRadius: 0.08,
      width: loadingSize,
      height: loadingSize,
      backgroundColor: backgroundColor,
      backgroundOpacity: 1.0,
    });

    /** 位置を元のタグの位置に合わせる */
    this.applyAttitude(container, parameter);
    /** 画面に配置する */
    this.add(container);

    /** ローディング表示のパラメータ */
    const circleRadius = loadingSize / 3;
    const circleLineWidth = parameter.lineWidth ?? 0.02;
    const gradientResolution = 60; // グラデーションの細かさ
    const gradientEnd = new Color(0xffffff); // グラデーションの終了色
    const geometry = new PlaneGeometry(1.0, 1.0, gradientResolution, 1);

    /** ローディング中の円を表示する */
    let colorAttributes = [];
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const uvY = geometry.attributes.uv.getY(i);
      const uvX = geometry.attributes.uv.getX(i);
      // グラデーションカラーを取得
      const color = backgroundColor.clone().lerp(gradientEnd, uvX);
      colorAttributes.push(color.r, color.g, color.b);
      // 長方形を円に変換する
      // 長方形の下側を円の内側、上側を円の外側とする
      const radius = circleRadius + circleLineWidth * uvY;
      geometry.attributes.position.setXY(
        i,
        Math.cos(Math.PI * 2 * (1.0 - uvX)) * radius,
        Math.sin(Math.PI * 2 * (1.0 - uvX)) * radius
      );
    }
    geometry.setAttribute(
      "color",
      new Float32BufferAttribute(colorAttributes, 3)
    );
    const material = new MeshBasicMaterial({ vertexColors: true });
    const mesh = new Mesh(geometry, material);
    mesh.position.setZ(0.0001);
    container.add(mesh);

    this._progressBase = container;
    this._progressMesh = mesh;

    return this;
  }

  /** アニメーションループ */
  executeAnimationLoop(parameter: AnimationParameter) {
    if (this._progressMesh && this._progressBase) {
      this._progressBase.quaternion.copy(parameter.cameraAngle);
      this._progressMesh.rotateZ(-LOADING_ROTATE_SPEED);
    }
  }
}
