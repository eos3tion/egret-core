precision lowp float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform sampler2D tex0;

void main(void) {
    gl_FragColor = texture2D(tex0, vTextureCoord) * vColor;
}