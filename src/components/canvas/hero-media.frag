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

  vec2 ci = floor(fc / uCell);
  vec2 cl = mod(fc, uCell);

  if (mod(ci.x, 2.0) > 0.5) discard;

  float ex = texture(uEnergy, vec2((ci.y + 0.5) / 64.0, 0.5)).r;

  float tk   = mix(uStrip, uCell, ex);
  float lo   = uCell * 0.5 - tk * 0.5;
  float hi   = lo + tk;
  float soft = mix(0.3, 1.5, ex);

  float mask =
    smoothstep(lo - soft, lo + soft, cl.y) *
    (1.0 - smoothstep(hi - soft, hi + soft, cl.y));

  if (mask < 0.005) discard;

  vec2 tsA = vec2(textureSize(uTexA, 0));
  vec2 tsB = vec2(textureSize(uTexB, 0));
  vec4 col = mix(
    texture(uTexA, cover(vUv, tsA)),
    texture(uTexB, cover(vUv, tsB)),
    uFade
  );

  float a = mix(0.3, 1.0, ex) * mask;
  fragColor = vec4(col.rgb * a, a);
}
