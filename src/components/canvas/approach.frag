#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2  uRes;
uniform vec2  uPA;
uniform float uRA;
uniform vec2  uPB;
uniform float uRB;
uniform float uK;

uniform vec3  uColor;

float smin(float a, float b, float k) {
  float h = clamp(.5 + .5 * (b - a) / k, 0., 1.);
  return mix(b, a, h) - k * h * (1. - h);
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = gl_FragCoord.xy / uRes - .5;
  uv.x *= asp;

  float dA = length(uv - uPA) - uRA;
  float dB = length(uv - uPB) - uRB;
  float d = uK > 0.001 ? smin(dA, dB, uK) : min(dA, dB);

  float rim  = smoothstep(0., -0.025, d);
  float core = smoothstep(0., -0.10,  d);
  vec3 col = uColor
           + vec3(0.06, 0.06, 0.07) * core
           - vec3(0.08, 0.09, 0.10) * rim * 0.3;

  float aa    = fwidth(d) * 1.2;
  float alpha = 1. - smoothstep(-aa, aa, d);
  fragColor = vec4(col, alpha);
}
