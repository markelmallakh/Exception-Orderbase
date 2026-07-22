/* =================================================================
   GRADIENT BLINDS — vanilla ES-module port of React Bits
   <GradientBlinds/> (WebGL via ogl). The site has no build step, so
   ogl comes from the same CDN as circular-gallery.js.

   Usage: place an empty layer inside a positioned dark card:
     <div data-gradient-blinds class="absolute inset-0" aria-hidden="true"></div>
   and load this file once per page:
     <script type="module" src="gradient-blinds.js"></script>

   Optional data attributes:
     data-gb-colors="#8CBAB5,#DB336C"   up to 8 hex stops
     data-gb-angle="0"                  gradient rotation (deg)
     data-gb-blinds="16"                target blind count
   Defaults are the Exception brand pairing (dark turquoise → pink)
   on the deep-green #0F3B36 band, mix-blend lighten so the dark
   base keeps text contrast high.

   Spotlight follows the cursor over the PARENT card (the layer sits
   under the content, so events are bound to the parent). Reduced
   motion renders one static frame. rAF pauses off-screen. DPR ≤ 2.
   ================================================================= */
import { Renderer, Program, Mesh, Triangle } from "https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm";

const MAX_COLORS = 8;

const hexToRGB = (hex) => {
  const c = hex.trim().replace("#", "").padEnd(6, "0");
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
};

const prepStops = (stops) => {
  const base = (stops && stops.length ? stops : ["#8CBAB5", "#DB336C"]).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]);
  const count = Math.max(2, base.length);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  return { arr: base.map(hexToRGB), count };
};

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;
uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;
varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}
vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}
vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);
  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void main() {
  vec2 fragCoord = vUv * iResolution.xy;
  vec2 uv0 = fragCoord / iResolution.xy;

  float aspect = iResolution.x / iResolution.y;
  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;

  vec2 uvMod = uv;
  if (uDistort > 0.0) {
    float a = uvMod.y * 6.0;
    float b = uvMod.x * 6.0;
    float w = 0.01 * uDistort;
    uvMod.x += sin(a) * w;
    uvMod.y += cos(b) * w;
  }
  float t = uvMod.x;
  if (uMirror > 0.5) {
    t = 1.0 - abs(1.0 - 2.0 * fract(t));
  }
  vec3 base = getGradientColor(t);

  vec2 offset = vec2(iMouse.x / iResolution.x, iMouse.y / iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;
  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;
  vec3 ran = vec3(stripe);

  vec3 col = cir + base - ran;
  col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

  gl_FragColor = vec4(col, 1.0);
}
`;

function boot(container) {
  const reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const colors = (container.getAttribute("data-gb-colors") || "#8CBAB5,#DB336C")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const angle = parseFloat(container.getAttribute("data-gb-angle")) || 0;
  const blindCount = parseInt(container.getAttribute("data-gb-blinds"), 10) || 16;
  const blindMinWidth = 60;
  const mouseDampening = 0.15;

  let renderer;
  try {
    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      antialias: true,
    });
  } catch (e) {
    return; // no WebGL — the dark card stays as-is
  }
  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.style.mixBlendMode = container.style.mixBlendMode || "lighten";
  container.appendChild(canvas);

  const { arr: colorArr, count: colorCount } = prepStops(colors);
  const uniforms = {
    iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
    iMouse: { value: [0, 0] },
    iTime: { value: 0 },
    uAngle: { value: (angle * Math.PI) / 180 },
    uNoise: { value: 0.16 },
    uBlindCount: { value: Math.max(1, blindCount) },
    uSpotlightRadius: { value: 0.55 },
    uSpotlightSoftness: { value: 1 },
    uSpotlightOpacity: { value: 0.7 },
    uMirror: { value: 0 },
    uDistort: { value: 0 },
    uShineFlip: { value: 0 },
    uColor0: { value: colorArr[0] },
    uColor1: { value: colorArr[1] },
    uColor2: { value: colorArr[2] },
    uColor3: { value: colorArr[3] },
    uColor4: { value: colorArr[4] },
    uColor5: { value: colorArr[5] },
    uColor6: { value: colorArr[6] },
    uColor7: { value: colorArr[7] },
    uColorCount: { value: colorCount },
  };

  const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  let mouseTarget = [0, 0];
  let first = true;
  const resize = () => {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height);
    uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    const maxByMinWidth = Math.max(1, Math.floor(rect.width / blindMinWidth));
    uniforms.uBlindCount.value = Math.max(1, Math.min(blindCount, maxByMinWidth));
    if (first) {
      first = false;
      const cx = gl.drawingBufferWidth / 2;
      const cy = gl.drawingBufferHeight / 2;
      uniforms.iMouse.value = [cx, cy];
      mouseTarget = [cx, cy];
    }
  };
  resize();
  new ResizeObserver(resize).observe(container);

  if (reduce) {
    // one static frame, centred spotlight, no loop / pointer tracking
    renderer.render({ scene: mesh });
    return;
  }

  /* The layer sits UNDER the card's content, so pointer events land on
     the parent card — track the cursor there. */
  const host = container.parentElement || container;
  host.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scale = renderer.dpr || 1;
    mouseTarget = [
      (e.clientX - rect.left) * scale,
      (rect.height - (e.clientY - rect.top)) * scale,
    ];
  });

  let raf = 0;
  let lastTime = 0;
  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    uniforms.iTime.value = t * 0.001;
    if (!lastTime) lastTime = t;
    const dt = (t - lastTime) / 1000;
    lastTime = t;
    let factor = 1 - Math.exp(-dt / mouseDampening);
    if (factor > 1) factor = 1;
    const cur = uniforms.iMouse.value;
    cur[0] += (mouseTarget[0] - cur[0]) * factor;
    cur[1] += (mouseTarget[1] - cur[1]) * factor;
    renderer.render({ scene: mesh });
  };

  /* Pause the loop entirely while the card is off-screen. */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (!raf) {
          lastTime = 0;
          raf = requestAnimationFrame(loop);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
  });
  io.observe(container);
}

document.querySelectorAll("[data-gradient-blinds]").forEach(boot);
