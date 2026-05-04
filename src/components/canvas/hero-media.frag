#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uDpr;
uniform float uCell;
uniform float uStrip;
uniform float uFade;

uniform sampler2D uEnergy;

uniform sampler2D uTexA;
uniform sampler2D uTexB;

uniform sampler2D uSymbol;

vec2 cover(vec2 uv, vec2 ts) {
  float ca = uRes.x / uRes.y;
  float ta = ts.x / ts.y;
  if (ca > ta) {
    float s = ta / ca;
    uv.y = uv.y * s + (1.0 - s) * 0.5;
  } else {
    float s = ca / ta;
    uv.x = uv.x * s + (1.0 - s) * 0.5;
  }
  return clamp(uv, 0.0, 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy / uDpr;
  fc.y = uRes.y - fc.y;

  float cellCount = round(uRes.x / uCell);
  float cellSize = uRes.x / cellCount;

  if (mod(cellCount, 2.0) < 0.5) {
    fc.x -= cellSize * 0.5;
  }

  // fc.x += sin(0.25 * fc.y / cellSize) * cellSize;

  vec2 ci = floor(fc / cellSize);
  vec2 cl = mod(fc, cellSize);

  float ex = texture(uEnergy, vec2((ci.y + 0.5) / 64.0, 0.5)).r;

  if (mod(ci.x, 2.0) > 0.5) discard;
  // if (mod(ci.y, 2.0) > 0.5) discard;

  float symbolPadding = 0.17;

  float sdfSample = (texture(uSymbol, mix(vec2(symbolPadding), vec2(1.0 - symbolPadding), cl / cellSize)).r * 2.0 - 1.0);
  float sdfAa = fwidth(sdfSample) * 1.2;
  float sdfTarget = -ex;
  float sdfFactor = smoothstep(sdfTarget - sdfAa, sdfTarget + sdfAa, sdfSample)
    * mix(0.5, 1.0, ex);

  vec2 tsA = vec2(textureSize(uTexA, 0));
  vec2 tsB = vec2(textureSize(uTexB, 0));
  vec4 col = mix(
    texture(uTexA, cover(vUv, tsA)),
    texture(uTexB, cover(vUv, tsB)),
    uFade
  );

  fragColor = vec4(col.rgb * sdfFactor, sdfFactor);
}
