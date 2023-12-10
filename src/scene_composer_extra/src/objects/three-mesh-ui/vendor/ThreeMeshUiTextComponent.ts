import { GLSL1, ShaderMaterial } from "three";
import { TextOptions, Text } from "three-mesh-ui";

const TEXTURE_SIZE = "{TEXTURE_SIZE}";
const DEFAULT_TEXTURE_SIZE = 512;

/**
 * ThreeMeshUi.Textのオプションを拡張する
 *
 * https://github.com/felixmariotto/three-mesh-ui/blob/master/src/components/core/MaterialManager.js
 * をベースに、GLSL1に対応する
 */
export type ThreeMeshUITextOptions = TextOptions & {
  textureSize?: number; // デフォルトは512ピクセル
};

export class ThreeMeshUIText extends Text {
  /** 文字テクスチャの大きさ */
  private _textureSize: number;

  constructor(options: ThreeMeshUITextOptions) {
    super(options);
    this._textureSize =
      options.textureSize ?? ThreeMeshUIText.defaultFontTextureSize();
  }

  /**
   * デフォルトの文字テキストの大きさ
   * @returns 512
   */
  static defaultFontTextureSize() {
    return DEFAULT_TEXTURE_SIZE;
  }

  /**
   * MatterportのシェーダがGLSL1になっているため、GLSL1で動くシェーダに変更する
   *
   * @returns ShaderMaterial
   */
  _makeTextMaterial() {
    return new ShaderMaterial({
      //@ts-ignore
      uniforms: this.textUniforms,
      transparent: true,
      clipping: true,
      vertexShader: textVertex,
      fragmentShader: textFragment.replaceAll(
        TEXTURE_SIZE,
        `${this._textureSize}`
      ),
      glslVersion: GLSL1,
      extensions: {
        derivatives: true,
      },
    });
  }
}

const textVertex = `
varying vec2 vUv;

#include <clipping_planes_pars_vertex>

void main() {

	vUv = uv;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	gl_Position.z -= 0.00001;

	#include <clipping_planes_vertex>

}
`;

//

const textFragment = `

uniform sampler2D u_texture;
uniform vec3 u_color;
uniform float u_opacity;
uniform float u_pxRange;
uniform bool u_useRGSS;

varying vec2 vUv;

#include <clipping_planes_pars_fragment>

// functions from the original msdf repo:
// https://github.com/Chlumsky/msdfgen#using-a-multi-channel-distance-field

float median(float r, float g, float b) {
	return max(min(r, g), min(max(r, g), b));
}

float screenPxRange() {
	vec2 unitRange = vec2(u_pxRange)/vec2(${TEXTURE_SIZE}, ${TEXTURE_SIZE});
	vec2 screenTexSize = vec2(1.0)/fwidth(vUv);
	return max(0.5*dot(unitRange, screenTexSize), 1.0);
}

float tap(vec2 offsetUV) {
	vec4 msd = texture2D( u_texture, offsetUV );
	float sd = median(msd[0], msd[1], msd[2]);
	float screenPxDistance = screenPxRange() * (sd - 0.5);
	float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);
	return alpha;
}

void main() {

	float alpha;

	if ( u_useRGSS ) {

		// shader-based supersampling based on https://bgolus.medium.com/sharper-mipmapping-using-shader-based-supersampling-ed7aadb47bec
		// per pixel partial derivatives
		vec2 dx = dFdx(vUv);
		vec2 dy = dFdy(vUv);

		// rotated grid uv offsets
		vec2 uvOffsets = vec2(0.125, 0.375);
		vec2 offsetUV = vec2(0.0, 0.0);

		// supersampled using 2x2 rotated grid
		alpha = 0.0;
		offsetUV.xy = vUv + uvOffsets.x * dx + uvOffsets.y * dy;
		alpha += tap(offsetUV);
		offsetUV.xy = vUv - uvOffsets.x * dx - uvOffsets.y * dy;
		alpha += tap(offsetUV);
		offsetUV.xy = vUv + uvOffsets.y * dx - uvOffsets.x * dy;
		alpha += tap(offsetUV);
		offsetUV.xy = vUv - uvOffsets.y * dx + uvOffsets.x * dy;
		alpha += tap(offsetUV);
		alpha *= 0.25;

	} else {

		alpha = tap( vUv );

	}


	// apply the opacity
	alpha *= u_opacity;

	// this is useful to avoid z-fighting when quads overlap because of kerning
	if ( alpha < 0.02) discard;


	gl_FragColor = vec4( u_color, alpha );

	#include <clipping_planes_fragment>

}
`;
