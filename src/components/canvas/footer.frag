#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uDpr;
uniform float uCell;
uniform float uStrip;
uniform vec3  uColor;

uniform sampler2D uEnergy;
uniform sampler2D uSymbol;

void main() {
  vec2 fc = gl_FragCoord.xy / uDpr;
  fc.y = uRes.y - fc.y;

  float cellCount = round(uRes.x / uCell);
  float cellSize  = uRes.x / cellCount;

  if (mod(cellCount, 2.0) < 0.5) {
    fc.x -= cellSize * 0.5;
  }

  vec2 ci = floor(fc / cellSize);
  vec2 cl = mod(fc, cellSize);

  float ex = texture(uEnergy, vec2((ci.y + 0.5) / 64.0, 0.5)).r;

  if (mod(ci.x, 2.0) > 0.5) discard;

  float symbolPadding = 0.17;

  vec2 uvPadMin = vec2(symbolPadding, mix(symbolPadding, 0.5 - 0.01, ex));
  vec2 uvPadMax = vec2(1.0 - symbolPadding, mix(1.0 - symbolPadding, 0.5 + 0.01, ex));
  float sdfSample = (texture(uSymbol, mix(uvPadMin, uvPadMax, cl / cellSize)).r * 2.0 - 1.0);
  float sdfAa     = fwidth(sdfSample) * 1.2;
  float sdfTarget = -ex;
  float sdfFactor = smoothstep(sdfTarget - sdfAa, sdfTarget + sdfAa, sdfSample)
    * mix(0.5, 1.0, ex);

  fragColor = vec4(uColor * sdfFactor, sdfFactor);
}
