namespace egret.web {
	/** 
	 * @private 
	 */
	export const EgretShaderLib = {
		blur_frag:
			`precision mediump float;
uniform vec2 blur;
uniform sampler2D tex0;
varying vec2 vTextureCoord;
uniform vec2 uTextureSize;
void main()
{
	const int sampleRadius = 5;
	const int samples = sampleRadius * 2 + 1;
	vec2 blurUv = blur / uTextureSize;
	vec4 color = vec4(0, 0, 0, 0);
	vec2 uv = vec2(0.0, 0.0);
	blurUv /= float(sampleRadius);

	for (int i = -sampleRadius; i <= sampleRadius; i++) {
		uv.x = vTextureCoord.x + float(i) * blurUv.x;
		uv.y = vTextureCoord.y + float(i) * blurUv.y;
		color += texture2D(tex0, uv);
	}

	color /= float(samples);
	gl_FragColor = color;
}`,
		colorTransform_frag:
			`precision mediump float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform mat4 matrix;
uniform vec4 colorAdd;
uniform sampler2D tex0;

void main(void) {
    vec4 texColor = texture2D(tex0, vTextureCoord);
    if(texColor.a > 0.) {
        // 抵消预乘的alpha通道
        texColor = vec4(texColor.rgb / texColor.a, texColor.a);
    }
    vec4 locColor = clamp(texColor * matrix + colorAdd, 0., 1.);
    gl_FragColor = vColor * vec4(locColor.rgb * locColor.a, locColor.a);
}`,
		default_vert:
			`attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute float aColor;
attribute float aTexIdx;

uniform vec2 projectionVector;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTexIdx;

const vec2 center = vec2(-1.0, 1.0);

void main(void) {
	gl_Position = vec4( (aVertexPosition / projectionVector) + center , 0.0, 1.0);
	vTextureCoord = aTextureCoord;
	vTexIdx = aTexIdx;
	vColor = vec4(aColor);
}`,
		glow_frag:
			`precision highp float;
varying vec2 vTextureCoord;

uniform sampler2D tex0;

uniform float dist;
uniform float angle;
uniform vec4 color;
uniform float alpha;
uniform float blurX;
uniform float blurY;

uniform float strength;
uniform float inner;
uniform float knockout;
uniform float hideObject;

uniform vec2 uTextureSize;

float random(vec2 scale)
{
	return fract(sin(dot(gl_FragCoord.xy, scale)) * 43758.5453);
}

void main(void) {
	vec2 px = vec2(1.0 / uTextureSize.x, 1.0 / uTextureSize.y);
	// TODO 自动调节采样次数？
	const float linearSamplingTimes = 7.0;
	const float circleSamplingTimes = 12.0;
	vec4 ownColor = texture2D(tex0, vTextureCoord);
	vec4 curColor;
	float totalAlpha = 0.0;
	float maxTotalAlpha = 0.0;
	float curDistanceX = 0.0;
	float curDistanceY = 0.0;
	float offsetX = dist * cos(angle) * px.x;
	float offsetY = dist * sin(angle) * px.y;

	const float PI = 3.14159265358979323846264;
	float cosAngle;
	float sinAngle;
	float offset = PI * 2.0 / circleSamplingTimes * random(vec2(12.9898, 78.233));
	float stepX = blurX * px.x / linearSamplingTimes;
	float stepY = blurY * px.y / linearSamplingTimes;
	for (float a = 0.0; a <= PI * 2.0; a += PI * 2.0 / circleSamplingTimes) {
		cosAngle = cos(a + offset);
		sinAngle = sin(a + offset);
		for (float i = 1.0; i <= linearSamplingTimes; i++) {
			curDistanceX = i * stepX * cosAngle;
			curDistanceY = i * stepY * sinAngle;
			if (vTextureCoord.x + curDistanceX - offsetX >= 0.0 && vTextureCoord.y + curDistanceY + offsetY <= 1.0){
				curColor = texture2D(tex0, vec2(vTextureCoord.x + curDistanceX - offsetX, vTextureCoord.y + curDistanceY + offsetY));
				totalAlpha += (linearSamplingTimes - i) * curColor.a;
			}
			maxTotalAlpha += (linearSamplingTimes - i);
		}
	}

	ownColor.a = max(ownColor.a, 0.0001);
	ownColor.rgb = ownColor.rgb / ownColor.a;

	float outerGlowAlpha = (totalAlpha / maxTotalAlpha) * strength * alpha * (1. - inner) * max(min(hideObject, knockout), 1. - ownColor.a);
	float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * strength * alpha * inner * ownColor.a;

	ownColor.a = max(ownColor.a * knockout * (1. - hideObject), 0.0001);
	vec3 mix1 = mix(ownColor.rgb, color.rgb, innerGlowAlpha / (innerGlowAlpha + ownColor.a));
	vec3 mix2 = mix(mix1, color.rgb, outerGlowAlpha / (innerGlowAlpha + ownColor.a + outerGlowAlpha));
	float resultAlpha = min(ownColor.a + outerGlowAlpha + innerGlowAlpha, 1.);
	gl_FragColor = vec4(mix2 * resultAlpha, resultAlpha);
}`,
		primitive_frag:
			`precision lowp float;
varying vec2 vTextureCoord;
varying vec4 vColor;

void main(void) {
	gl_FragColor = vColor;
}`,
		texture_frag:
			`precision lowp float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform sampler2D tex0;

void main(void) {
	gl_FragColor = texture2D(tex0, vTextureCoord) * vColor;
}`
	}
}