/* Book of the Dead World: the look. Procedural textures and physically based materials, the dusk sky and the star arch,
   instanced flames and embers, bloom, shadows, the route drawn on the ground and the camera's walk along it.
   Presentation only: nothing here adds a feature to the model; what is drawn is still decided by world.js and the ledger. */
import * as THREE from 'three';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';

// ---------- value noise on a canvas ----------
const hash = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
const smooth = t => t * t * (3 - 2 * t);
function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = smooth(x - xi), fy = smooth(y - yi); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
function fbm(x, y, s, oct = 5, lac = 2, gain = 0.5) { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { v += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= gain; f *= lac; } return v / n; }
/* draw a tileable texture: fn(u, v) -> [r, g, b] in 0..1, u and v in 0..1; tileable because the noise is sampled on a torus */
function canvasTex(size, fn, { repeat = 1, colorSpace = THREE.SRGBColorSpace } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size; const ctx = c.getContext('2d'), img = ctx.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const [r, g, b] = fn(x / size, y / size); const i = (y * size + x) * 4; d[i] = r * 255; d[i + 1] = g * 255; d[i + 2] = b * 255; d[i + 3] = 255; }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.colorSpace = colorSpace; t.anisotropy = 4; return t;
}
// periodic coordinates so the tile wraps: noise sampled on a circle for each axis
const per = (u, v, scale, s) => { const a = u * Math.PI * 2, b = v * Math.PI * 2; return fbm((Math.cos(a) + 1) * scale + 7.3, (Math.sin(a) + 1) * scale + 2.1 + (Math.cos(b) + 1) * scale * 0.7, s) * 0.5 + fbm((Math.cos(b) + 1) * scale + 11.9, (Math.sin(b) + 1) * scale + 4.4, s + 3) * 0.5; };

export function makeTextures() {
  const T = {};
  // sandstone: warm tan with faint strata and grain
  T.sand = canvasTex(512, (u, v) => { const n = per(u, v, 3, 1), g = per(u, v, 14, 2); const strata = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 6 + n * 4); const k = 0.78 + (n - 0.5) * 0.22 + (g - 0.5) * 0.1 + (strata - 0.5) * 0.06; return [0.76 * k, 0.63 * k, 0.45 * k]; });
  T.sandBump = canvasTex(512, (u, v) => { const n = per(u, v, 3, 1), g = per(u, v, 14, 2); const strata = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 6 + n * 4); const k = 0.5 + (n - 0.5) * 0.5 + (g - 0.5) * 0.6 + (strata - 0.5) * 0.3; return [k, k, k]; }, { colorSpace: THREE.NoColorSpace });
  T.sandFlat = canvasTex(512, (u, v) => { const n = per(u, v, 3, 61), g = per(u, v, 16, 62), r = per(u, v, 40, 63); const k = 0.74 + (n - 0.5) * 0.2 + (g - 0.5) * 0.12 + (r - 0.5) * 0.08; return [0.72 * k, 0.62 * k, 0.46 * k]; });
  // cliff rock: darker, stronger strata, cracks
  T.rock = canvasTex(512, (u, v) => { const n = per(u, v, 4, 5), r = Math.abs(per(u, v, 9, 6) - 0.5) * 2; const strata = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 9 + n * 6); const k = 0.62 + (n - 0.5) * 0.3 - r * 0.18 + (strata - 0.5) * 0.12; return [0.50 * k, 0.42 * k, 0.33 * k]; });
  T.rockBump = canvasTex(512, (u, v) => { const n = per(u, v, 4, 5), r = Math.abs(per(u, v, 9, 6) - 0.5) * 2; const strata = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 9 + n * 6); const k = 0.5 + (n - 0.5) * 0.6 - r * 0.5 + (strata - 0.5) * 0.4; return [k, k, k]; }, { colorSpace: THREE.NoColorSpace });
  // the floor of the hidden land: dark, bare, faintly mottled
  T.duat = canvasTex(512, (u, v) => { const n = per(u, v, 3, 9), g = per(u, v, 20, 10); const k = 0.55 + (n - 0.5) * 0.5 + (g - 0.5) * 0.35; return [0.17 * k, 0.14 * k, 0.11 * k]; });
  T.duatBump = canvasTex(512, (u, v) => { const g = per(u, v, 20, 10), n = per(u, v, 3, 9); const k = 0.5 + (g - 0.5) * 0.8 + (n - 0.5) * 0.3; return [k, k, k]; }, { colorSpace: THREE.NoColorSpace });
  // patina on bronze: a mottled roughness
  T.patina = canvasTex(256, (u, v) => { const n = per(u, v, 5, 21); const k = 0.35 + n * 0.5; return [k, k, k]; }, { colorSpace: THREE.NoColorSpace });
  // water ripples as a normal map, animated by scrolling
  T.ripple = canvasTex(256, (u, v) => { const e = 1 / 256, h = (a, b) => per(a, b, 6, 31) * 0.6 + per(a, b, 15, 32) * 0.4; const dx = (h(u + e, v) - h(u - e, v)) * 6, dy = (h(u, v + e) - h(u, v - e)) * 6; const n = new THREE.Vector3(-dx, -dy, 1).normalize(); return [n.x * 0.5 + 0.5, n.y * 0.5 + 0.5, n.z * 0.5 + 0.5]; }, { colorSpace: THREE.NoColorSpace });
  // embers under the Lake of Fire: dark crust with bright cracks
  T.lava = canvasTex(512, (u, v) => { const r = Math.abs(per(u, v, 5, 41) - 0.5) * 2, n = per(u, v, 2, 42); const crack = Math.pow(1 - Math.min(1, r * 2.2), 3); const k = crack * (0.6 + n * 0.4); return [0.95 * k + 0.08, 0.45 * k + 0.02, 0.1 * k]; });
  // the field: cropped earth, green and gold
  T.field = canvasTex(512, (u, v) => { const n = per(u, v, 4, 51), g = per(u, v, 18, 52); const k = 0.7 + (n - 0.5) * 0.4 + (g - 0.5) * 0.25; return [0.36 * k, 0.40 * k, 0.17 * k]; });
  // a soft round star
  const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d'); const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.8)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64);
  T.star = new THREE.CanvasTexture(c);
  return T;
}

// ---------- materials, by the names world.js uses ----------
export function makeMaterials(P, T, env) {
  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0.0, envMap: env, envMapIntensity: 0.45 }, o));
  const metal = (color, rough, extra = {}) => std(Object.assign({ color, metalness: 0.85, roughness: rough, roughnessMap: T.patina, envMapIntensity: 0.9 }, extra));
  return {
    rock: std({ map: T.rock, bumpMap: T.rockBump, bumpScale: 1.6, roughness: 0.96 }),
    ground: std({ map: T.duat, bumpMap: T.duatBump, bumpScale: 0.5, roughness: 1 }),
    stone: std({ map: T.sand, bumpMap: T.sandBump, bumpScale: 0.8, roughness: 0.92 }),
    slab: std({ map: T.sandFlat, color: 0xcdbb98, transparent: true, opacity: 0.72, depthWrite: false, roughness: 0.95 }),
    bronze: metal(0x8a6830, 0.48), bronzeDark: metal(0x5a4422, 0.58),
    gold: metal(0xd9b25a, 0.3, { emissive: 0xd0a44c, emissiveIntensity: 0.1, roughnessMap: null, envMapIntensity: 1.2 }),
    goldSoft: metal(0x9a7a3a, 0.42),
    figure: std({ color: 0x7a6342, roughness: 0.52, metalness: 0.45, envMapIntensity: 0.7 }), figureDark: std({ color: 0x4a3a24, roughness: 0.56, metalness: 0.45, envMapIntensity: 0.6 }),
    wall: std({ color: P.bronzeDark, transparent: true, opacity: 0.32, depthWrite: false }),
    water: new THREE.MeshStandardMaterial({ color: 0x0a2328, roughness: 0.1, metalness: 0.15, normalMap: T.ripple, normalScale: new THREE.Vector2(0.55, 0.55), transparent: true, opacity: 0.92, envMap: env, envMapIntensity: 1.3 }),
    waterLit: new THREE.MeshStandardMaterial({ color: 0x163f48, emissive: 0x072028, emissiveIntensity: 0.7, roughness: 0.12, metalness: 0.1, normalMap: T.ripple, normalScale: new THREE.Vector2(0.5, 0.5), transparent: true, opacity: 0.95, envMap: env, envMapIntensity: 1.2 }),
    green: std({ color: 0x2f5a2f, roughness: 0.85 }), grain: std({ color: 0xc0a040, roughness: 0.75 }), field: std({ map: T.field, roughness: 0.95 }),
    flame: new THREE.MeshBasicMaterial({ color: P.flameHot }),
    ember: new THREE.MeshStandardMaterial({ color: 0x2a1408, emissive: 0xff5a10, emissiveIntensity: 1.4, emissiveMap: T.lava, map: T.lava, roughness: 0.9 }),
    white: std({ color: 0xe8e6e1, roughness: 0.7, emissive: 0x333333, emissiveIntensity: 0.15 }), dark: std({ color: 0x0a0a0c }),
    metal: metal(0x8a8d94, 0.4), witness: std({ color: P.witness, transparent: true, opacity: 0.35, depthWrite: false }),
    tintGreen: std({ color: P.tintGreen, transparent: true, opacity: 0.6, depthWrite: false }), tintYellow: std({ color: P.tintYellow, transparent: true, opacity: 0.6, depthWrite: false }),
    outline: new THREE.LineBasicMaterial({ color: P.witness, transparent: true, opacity: 0.55 }),
    ghost: new THREE.MeshBasicMaterial({ color: P.witness, transparent: true, opacity: 0.16, depthWrite: false })
  };
}

// ---------- the sky: dusk over Manu, stars, the arch of Nut ----------
export function makeSky(scene, renderer, T, skyRadius) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(skyRadius * 8, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { uWest: { value: new THREE.Vector3(-1, 0, 0.2).normalize() } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vDir; uniform vec3 uWest; void main(){ float y = clamp(vDir.y, -1.0, 1.0); vec3 zenith = vec3(0.010, 0.016, 0.036), horizon = vec3(0.075, 0.07, 0.095); vec3 col = mix(zenith, horizon, pow(1.0 - max(y, 0.0), 6.0));
      float w = max(0.0, dot(normalize(vec3(vDir.x, 0.0, vDir.z)), normalize(vec3(uWest.x, 0.0, uWest.z)))); float band = pow(1.0 - min(1.0, abs(y) * 2.4), 3.0);
      col += vec3(0.95, 0.42, 0.12) * pow(w, 6.0) * band * 1.1 + vec3(0.55, 0.22, 0.2) * pow(w, 2.0) * pow(1.0 - min(1.0, abs(y) * 1.5), 2.0) * 0.3;
      if (y < 0.0) col = mix(col, vec3(0.02, 0.015, 0.012), min(1.0, -y * 6.0)); gl_FragColor = vec4(col, 1.0); }` }));
  sky.userData.keep = true; sky.frustumCulled = false; scene.add(sky);
  // environment for reflections and a little ambient: the sky itself
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(sky, 0.02).texture; pm.dispose();
  // stars, with a dense band for the body of Nut arching west to east
  const N = 2600, B = 3200, pos = new Float32Array((N + B) * 3), size = new Float32Array(N + B), col = new Float32Array((N + B) * 3); let k = 0;
  const put = (p, s, c) => { pos[k * 3] = p.x; pos[k * 3 + 1] = p.y; pos[k * 3 + 2] = p.z; size[k] = s; col[k * 3] = c[0]; col[k * 3 + 1] = c[1]; col[k * 3 + 2] = c[2]; k++; };
  const rand = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
  for (let i = 0; i < N; i++) { const th = rand() * Math.PI * 2, ph = Math.acos(1 - rand()); const r = skyRadius * (0.92 + rand() * 0.1), y = Math.cos(ph) * r; if (y < 120) { i--; continue; } const m = rand(); const tint = rand(); put(new THREE.Vector3(Math.sin(ph) * Math.cos(th) * r, y - 200, Math.sin(ph) * Math.sin(th) * r), 1.1 + Math.pow(m, 9) * 6, tint < 0.1 ? [1, 0.8, 0.65] : tint < 0.2 ? [0.75, 0.85, 1] : [1, 0.97, 0.9]); }
  for (let i = 0; i < B; i++) { const a = rand() * Math.PI; const g = (rand() + rand() + rand() - 1.5) * 0.11; const r = skyRadius * 0.9; const v = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r - 200, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), g).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.08); if (v.y < 60) continue; put(v, 0.7 + rand() * 1.5, [0.5, 0.5, 0.6]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, k * 3), 3)); geo.setAttribute('aSize', new THREE.BufferAttribute(size.slice(0, k), 1)); geo.setAttribute('color', new THREE.BufferAttribute(col.slice(0, k * 3), 3));
  const mat = new THREE.ShaderMaterial({ uniforms: { uTex: { value: T.star }, uTime: { value: 0 }, uScale: { value: 1 } }, vertexShader: `attribute float aSize; varying float vA; varying vec3 vC; uniform float uTime, uScale; void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); float tw = 0.75 + 0.25*sin(uTime*1.7 + position.x*0.013 + position.z*0.011); vA = tw; gl_PointSize = aSize * uScale * tw; gl_Position = projectionMatrix * mv; }`, fragmentShader: `uniform sampler2D uTex; varying float vA; varying vec3 vC; void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * vA); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, fog: false });
  const stars = new THREE.Points(geo, mat); stars.userData.keep = true; stars.frustumCulled = false; scene.add(stars);
  return { sky, env, stars, tick: (t, pr) => { mat.uniforms.uTime.value = t; mat.uniforms.uScale.value = pr; } };
}

// ---------- flames and embers: one instanced mesh each ----------
export function makeFlames(scene, list) {
  // list: [{ x, y, z, r, h }] in world units; the quad stands on (x, y, z), r is the half width, h the height
  const n = list.length, geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0));
  const off = new Float32Array(n * 3), sz = new Float32Array(n * 2), seed = new Float32Array(n);
  list.forEach((f, i) => { off[i * 3] = f.x; off[i * 3 + 1] = f.y; off[i * 3 + 2] = f.z; sz[i * 2] = f.r * 2.2; sz[i * 2 + 1] = f.h * 1.5; seed[i] = (i * 0.618) % 1; });
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 3)); geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(sz, 2)); geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1)); geo.instanceCount = n;
  const noise = `float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); } float fbm(vec2 p){ return 0.5*vn(p) + 0.25*vn(p*2.03) + 0.125*vn(p*4.1) + 0.0625*vn(p*8.3); }`;
  const mat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: `attribute vec3 aOff; attribute vec2 aSize; attribute float aSeed; varying vec2 vUv; varying float vSeed; uniform float uTime; void main(){ vUv = uv; vSeed = aSeed; vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); float sway = sin(uTime*7.0 + aSeed*31.0) * 0.12 * uv.y; vec3 p = aOff + right * ((uv.x - 0.5 + sway) * aSize.x) + vec3(0.0, uv.y * aSize.y, 0.0); gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
    fragmentShader: noise + ` uniform float uTime; varying vec2 vUv; varying float vSeed; void main(){ float t = uTime*1.6 + vSeed*17.0; vec2 q = vec2(vUv.x*2.2 + vSeed*9.0, vUv.y*2.6 - t); float n = fbm(q) * 0.9 + fbm(q*2.7 + 3.1) * 0.35; float w = 0.42 * (1.0 - vUv.y) + 0.04; float d = abs(vUv.x - 0.5) / w; float body = 1.0 - smoothstep(0.35, 1.0, d + (n - 0.5) * 0.9); float tip = 1.0 - smoothstep(0.55, 1.0, vUv.y + (n - 0.5) * 0.5); float a = body * tip * (0.75 + 0.25 * n); float core = smoothstep(0.55, 0.0, d + vUv.y * 0.9); vec3 col = mix(vec3(1.0, 0.32, 0.05), vec3(1.0, 0.78, 0.25), smoothstep(0.1, 0.6, 1.0 - vUv.y)); col = mix(col, vec3(1.0, 0.97, 0.8), core); gl_FragColor = vec4(col * 1.7, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.userData.keep = true; scene.add(mesh);
  // embers: three sparks per flame, rising and fading
  const m = n * 3, ep = new Float32Array(m * 3), es = new Float32Array(m * 2);
  list.forEach((f, i) => { for (let j = 0; j < 3; j++) { const k = i * 3 + j; ep[k * 3] = f.x; ep[k * 3 + 1] = f.y + f.h * 0.6; ep[k * 3 + 2] = f.z; es[k * 2] = (k * 0.7548) % 1; es[k * 2 + 1] = f.h; } });
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3)); eg.setAttribute('aSeed', new THREE.BufferAttribute(es, 2));
  const em = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uScale: { value: 1 } }, vertexShader: `attribute vec2 aSeed; uniform float uTime, uScale; varying float vA; void main(){ float life = fract(uTime * (0.18 + aSeed.x * 0.22) + aSeed.x * 7.0); float h = aSeed.y; vec3 p = position + vec3(sin(uTime*1.3 + aSeed.x*40.0) * h * 0.25 * life, life * h * 2.2, cos(uTime*1.1 + aSeed.x*23.0) * h * 0.25 * life); vA = (1.0 - life) * (0.6 + 0.4 * sin(uTime*9.0 + aSeed.x*50.0)); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (2.0 + h * 0.6) * uScale * (0.4 + 0.6 * (1.0 - life)) * 300.0 / max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }`, fragmentShader: `varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float d = 1.0 - smoothstep(0.1, 0.5, length(c)); gl_FragColor = vec4(vec3(1.0, 0.55, 0.15) * 1.5, d * vA); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const embers = new THREE.Points(eg, em); embers.frustumCulled = false; embers.userData.keep = true; scene.add(embers);
  return { mesh, embers, tick: (t, pr) => { mat.uniforms.uTime.value = t; em.uniforms.uTime.value = t; em.uniforms.uScale.value = pr; } };
}

// ---------- bloom and output ----------
export function makeComposer(renderer, scene, camera) {
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.42, 0.6, 0.82); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return { composer, bloom, setSize: (w, h) => { composer.setSize(w, h); bloom.setSize(w / 2, h / 2); } };
}

// ---------- the route drawn on the ground ----------
export function drawRoute(scene, legs, color) {
  const pts = [];
  for (const leg of legs) { if (!leg.draw) continue; for (const p of leg.curve.getSpacedPoints(Math.max(8, Math.round(leg.length / 12)))) pts.push(p.clone().add(new THREE.Vector3(0, leg.lift || 0.8, 0))); }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 6, gapSize: 5, transparent: true, opacity: 0.45, fog: true })); line.computeLineDistances(); line.userData.keep = true; scene.add(line); return line;
}

// ---------- the walk: camera moves along the leg's curve, then settles into the room's framing ----------
export function makeLeg(from, waypoints, to, opts) {
  const pts = [from.clone(), ...waypoints.map(p => new THREE.Vector3(...p)), to.clone()];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5); const length = curve.getLength();
  return Object.assign({ curve, length, draw: true }, opts);
}
const _t = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
export function walkPose(leg, u, prevDist, dist, endPos, endTarget, floorY) {
  // target slides along the curve; the eye follows behind and above at a height that grows with the room's scale, then blends into the final framing
  const target = leg.curve.getPointAt(u); const tan = leg.curve.getTangentAt(u); _t.copy(tan); _t.y = 0; if (_t.lengthSq() < 1e-6) _t.set(1, 0, 0); _t.normalize();
  const d = prevDist + (dist - prevDist) * u; const back = Math.max(12, d * 0.8), up = Math.max(8, d * 0.45);
  _b.copy(target).addScaledVector(_t, -back).addScaledVector(_up, up);
  const fy = floorY(_b); if (_b.y < fy) _b.y = fy;
  const k = u < 0.62 ? 0 : (u - 0.62) / 0.38, s = k * k * (3 - 2 * k);
  const eye = _b.lerp(endPos, s), look = target.lerp(endTarget, s);
  return { eye, look };
}
