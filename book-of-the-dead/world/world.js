/* Book of the Dead World: the scene. three.js r160, vendored. Unit: royal cubit.
   Geometry is built from ledger.js (what the text says) and world-data.js (where we put it).
   Nothing here is a claim about ancient geography; see ../world/ledger.html. */
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './vendor/CSS2DRenderer.js';

const W = window.BOD_WORLD, L = window.BOD_LEDGER, TX = window.ANI_TEXT || {}, BU = window.ANI_BUDGE || {}, G = window.ANI_GEOM;
const P = W.palette, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
const placeById = Object.fromEntries(L.places.map(p => [p.id, p]));
const blockById = {}; Object.keys(TX).forEach(n => TX[n].blocks.forEach(b => { blockById[b.id] = Object.assign({ n: +n }, b); }));

// ---------- renderer, scene, camera ----------
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
const scene = new THREE.Scene();
scene.background = new THREE.Color(P.bg);
scene.fog = new THREE.FogExp2(P.bg, 0.00011);
const camera = new THREE.PerspectiveCamera(42, 1, 1, 40000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.98; controls.minDistance = 8; controls.maxDistance = 9000;
const labelRenderer = new CSS2DRenderer({ element: $('labels') });

// ---------- materials ----------
const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, flatShading: true, roughness: 0.9, metalness: 0.08 }, extra));
const M = {
  rock: std(P.rock), ground: std(P.ground, { roughness: 1 }), slab: std(P.slab, { transparent: true, opacity: 0.42, depthWrite: false }),
  bronze: std(P.bronze), bronzeDark: std(P.bronzeDark), gold: std(P.gold, { emissive: P.gold, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.5 }),
  goldSoft: std(P.goldSoft), figure: std(P.figure, { emissive: P.figureDark, emissiveIntensity: 0.25 }), figureDark: std(P.figureDark),
  wall: std(P.bronzeDark, { transparent: true, opacity: 0.32, depthWrite: false }),
  water: std(P.water, { emissive: P.water, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 }),
  green: std(P.green, { emissive: 0x1c3a1c, emissiveIntensity: 0.3 }), grain: std(P.grain),
  flame: new THREE.MeshBasicMaterial({ color: P.flameHot }), ember: new THREE.MeshBasicMaterial({ color: P.flame }),
  white: std(0xe8e6e1, { emissive: 0x777777, emissiveIntensity: 0.2 }), dark: std(0x0a0a0c),
  metal: std(P.metal, { metalness: 0.6, roughness: 0.4 }), witness: std(P.witness, { transparent: true, opacity: 0.35, depthWrite: false }),
  tintGreen: std(P.tintGreen, { transparent: true, opacity: 0.6, depthWrite: false }), tintYellow: std(P.tintYellow, { transparent: true, opacity: 0.6, depthWrite: false }),
  outline: new THREE.LineBasicMaterial({ color: P.witness, transparent: true, opacity: 0.9 })
};

// ---------- small geometry helpers ----------
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y + h / 2, z); return m; };
const cyl = (rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 10) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y + h / 2, z); return m; };
const sph = (r, mat, x = 0, y = 0, z = 0, seg = 8) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat); m.position.set(x, y, z); return m; };
const cone = (r, h, mat, x = 0, y = 0, z = 0, seg = 8) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat); m.position.set(x, y + h / 2, z); return m; };
const grp = (x = 0, y = 0, z = 0, ry = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; return g; };
const flame = (r, h, x, y, z) => { const c = cone(r, h, M.flame, x, y, z, 6); c.userData.keep = true; c.userData.flame = true; return c; };
const light = (x, y, z, color = P.flame, intensity = 3000, dist = 260) => { const l = new THREE.PointLight(color, intensity, dist, 2); l.position.set(x, y, z); l.userData.keep = true; return l; };

/* A silhouette figure keyed to the text's head and implement. h is the height in cubits (3.5 = a person). */
function figure({ head = 'man', pose = 'stand', h = 3.5, item = null, mat = M.figure, ry = 0, x = 0, y = 0, z = 0 } = {}) {
  const g = grp(x, y, z, ry), s = h / 3.5;
  const torsoH = pose === 'stand' ? 1.3 : pose === 'sit' ? 1.25 : 1.2;
  let torsoY, headY;
  if (pose === 'stand') { g.add(box(0.28 * s, 1.5 * s, 0.3 * s, mat, -0.17 * s, 0, 0), box(0.28 * s, 1.5 * s, 0.3 * s, mat, 0.17 * s, 0, 0)); torsoY = 1.5 * s; }
  else if (pose === 'sit') { g.add(box(0.95 * s, 0.9 * s, 0.9 * s, M.bronzeDark, 0, 0, 0)); g.add(box(0.7 * s, 0.3 * s, 0.9 * s, mat, 0, 0.9 * s, 0.5 * s)); torsoY = 0.9 * s; }
  else { g.add(box(0.7 * s, 0.35 * s, 1.1 * s, mat, 0, 0, 0.1 * s)); torsoY = 0.35 * s; }
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36 * s, torsoH * s, 3, 6), mat); torso.position.set(0, torsoY + (torsoH / 2 + 0.36) * s, 0); g.add(torso);
  headY = torsoY + (torsoH + 0.36 * 2 + 0.3) * s;
  const r = 0.3 * s;
  const H = grp(0, headY, 0); g.add(H);
  switch (head) {
    case 'hawk': case 'bird': H.add(sph(r, mat), cone(0.12 * s, 0.35 * s, mat, 0, -0.1 * s, 0.38 * s).rotateX(Math.PI / 2)); break;
    case 'ibis': H.add(sph(r * 0.9, mat), cyl(0.05 * s, 0.03 * s, 0.6 * s, mat, 0, -0.5 * s, 0.4 * s).rotateX(Math.PI / 3)); break;
    case 'jackal': case 'dog': H.add(sph(r, mat), box(0.22 * s, 0.22 * s, 0.5 * s, mat, 0, -0.16 * s, 0.4 * s), cone(0.08 * s, 0.35 * s, mat, -0.14 * s, 0.15 * s, 0, 4), cone(0.08 * s, 0.35 * s, mat, 0.14 * s, 0.15 * s, 0, 4)); break;
    case 'lion': H.add(sph(r, mat), new THREE.Mesh(new THREE.TorusGeometry(0.36 * s, 0.09 * s, 6, 12), mat)); break;
    case 'serpent': case 'snake': H.add(cone(0.22 * s, 0.6 * s, mat, 0, -0.3 * s, 0.1 * s, 6).rotateX(Math.PI * 0.42)); break;
    case 'crocodile': H.add(box(0.26 * s, 0.2 * s, 0.9 * s, mat, 0, -0.1 * s, 0.3 * s)); break;
    case 'hare': H.add(sph(r, mat), box(0.1 * s, 0.7 * s, 0.14 * s, mat, -0.12 * s, 0.2 * s, 0), box(0.1 * s, 0.7 * s, 0.14 * s, mat, 0.12 * s, 0.2 * s, 0)); break;
    case 'cow': case 'bull': H.add(sph(r, mat), cyl(0.04 * s, 0.07 * s, 0.6 * s, mat, -0.3 * s, 0.05 * s, 0).rotateZ(0.6), cyl(0.04 * s, 0.07 * s, 0.6 * s, mat, 0.3 * s, 0.05 * s, 0).rotateZ(-0.6)); break;
    case 'ram': H.add(sph(r, mat), new THREE.Mesh(new THREE.TorusGeometry(0.22 * s, 0.06 * s, 6, 12, Math.PI * 1.5), mat).translateX(-0.3 * s), new THREE.Mesh(new THREE.TorusGeometry(0.22 * s, 0.06 * s, 6, 12, Math.PI * 1.5), mat).translateX(0.3 * s)); break;
    case 'hippo': H.add(box(0.6 * s, 0.5 * s, 0.8 * s, mat, 0, -0.1 * s, 0.1 * s)); break;
    case 'ape': H.add(sph(r * 1.1, mat), box(0.3 * s, 0.22 * s, 0.25 * s, mat, 0, -0.2 * s, 0.25 * s)); break;
    case 'cat': H.add(sph(r * 0.9, mat), cone(0.08 * s, 0.25 * s, mat, -0.14 * s, 0.15 * s, 0, 4), cone(0.08 * s, 0.25 * s, mat, 0.14 * s, 0.15 * s, 0, 4)); break;
    case 'mummy': break;
    default: H.add(sph(r, mat));
  }
  if (head === 'disk' || item === 'disk') H.add(sph(0.26 * s, M.gold, 0, 0.5 * s, 0));
  if (item === 'whitecrown' || item === 'atef') { H.add(cone(0.26 * s, 0.9 * s, M.white, 0, 0.2 * s, 0)); if (item === 'atef') H.add(box(0.06 * s, 0.9 * s, 0.3 * s, M.white, -0.3 * s, 0.2 * s, 0), box(0.06 * s, 0.9 * s, 0.3 * s, M.white, 0.3 * s, 0.2 * s, 0)); }
  if (item === 'doublecrown') H.add(cone(0.26 * s, 0.8 * s, M.white, 0, 0.2 * s, 0), box(0.5 * s, 0.25 * s, 0.5 * s, M.bronze, 0, 0.1 * s, 0));
  const hand = torsoY + (torsoH + 0.3) * s;
  if (item === 'knife') g.add(box(0.1 * s, 0.9 * s, 0.22 * s, M.white, 0.5 * s, hand - 0.4 * s, 0.25 * s).rotateZ(-0.5));
  if (item === 'corn') g.add(cyl(0.04 * s, 0.04 * s, 1.1 * s, M.gold, 0.5 * s, hand - 0.5 * s, 0.25 * s));
  if (item === 'besom') { g.add(cyl(0.05 * s, 0.05 * s, 1.6 * s, M.bronzeDark, 0.55 * s, hand - 1.2 * s, 0.25 * s), cone(0.22 * s, 0.5 * s, M.goldSoft, 0.55 * s, hand - 1.6 * s, 0.25 * s)); }
  if (item === 'sceptre' || item === 'staff') g.add(cyl(0.05 * s, 0.05 * s, 2.2 * s, M.bronzeDark, 0.5 * s, 0.1 * s, 0.25 * s));
  if (item === 'flail') g.add(cyl(0.05 * s, 0.05 * s, 1.1 * s, M.gold, -0.4 * s, hand - 0.3 * s, 0.25 * s).rotateZ(0.6));
  if (item === 'ankh') g.add(new THREE.Mesh(new THREE.TorusGeometry(0.16 * s, 0.04 * s, 6, 10), M.gold).translateX(0.5 * s).translateY(hand - 0.3 * s), cyl(0.04 * s, 0.04 * s, 0.5 * s, M.gold, 0.5 * s, hand - 0.85 * s, 0));
  if (item === 'sistrum') g.add(cyl(0.04 * s, 0.04 * s, 0.9 * s, M.gold, 0.5 * s, hand - 0.3 * s, 0.25 * s));
  if (item === 'palette') g.add(box(0.5 * s, 0.1 * s, 0.25 * s, M.bronzeDark, 0.5 * s, hand - 0.2 * s, 0.25 * s));
  if (item === 'raised') { g.add(box(0.14 * s, 1.0 * s, 0.14 * s, mat, -0.55 * s, hand - 0.1 * s, 0.1 * s), box(0.14 * s, 1.0 * s, 0.14 * s, mat, 0.55 * s, hand - 0.1 * s, 0.1 * s)); }
  if (head === 'mummy') { g.clear(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.4 * s, 2.3 * s, 3, 8), mat); m.position.y = (2.3 / 2 + 0.4) * s; g.add(m); }
  g.userData.h = h;
  return g;
}
const animal = (len, hgt, mat, x, y, z, ry = 0, head = 'cow') => { const g = grp(x, y, z, ry); g.add(box(len, hgt * 0.55, hgt * 0.5, mat, 0, hgt * 0.4, 0)); for (const [lx, lz] of [[-len * 0.35, -hgt * 0.18], [-len * 0.35, hgt * 0.18], [len * 0.35, -hgt * 0.18], [len * 0.35, hgt * 0.18]]) g.add(box(hgt * 0.12, hgt * 0.42, hgt * 0.12, mat, lx, 0, lz)); const hd = box(hgt * 0.32, hgt * 0.3, hgt * 0.26, mat, len * 0.58, hgt * 0.7, 0); g.add(hd); if (head === 'cow' || head === 'bull') g.add(cyl(0.03, 0.05, hgt * 0.45, mat, len * 0.58, hgt * 0.95, -hgt * 0.14).rotateX(-0.5), cyl(0.03, 0.05, hgt * 0.45, mat, len * 0.58, hgt * 0.95, hgt * 0.14).rotateX(0.5)); if (head === 'lion') g.add(new THREE.Mesh(new THREE.TorusGeometry(hgt * 0.22, hgt * 0.06, 6, 10), mat).translateX(len * 0.58).translateY(hgt * 0.85)); return g; };
const table = (x, y, z, mat = M.bronzeDark) => { const g = grp(x, y, z); g.add(cyl(0.12, 0.18, 1.1, mat), box(0.9, 0.08, 0.9, mat, 0, 1.1, 0), box(0.5, 0.25, 0.5, M.goldSoft, 0, 1.18, 0)); return g; };
const shrine = (w, h, d, mat, x, y, z, ry = 0) => { const g = grp(x, y, z, ry); g.add(box(0.25, h, d, mat, -w / 2 + 0.125, 0, 0), box(0.25, h, d, mat, w / 2 - 0.125, 0, 0), box(w, 0.3, d, mat, 0, h, 0), box(w, h, 0.25, mat, 0, 0, -d / 2 + 0.125)); return g; };
const stair = (steps, rise, run, width, mat, x, y, z, ry = 0) => { const g = grp(x, y, z, ry); for (let i = 0; i < steps; i++) g.add(box(run, rise, width, mat, i * run + run / 2, i * rise, 0)); return g; };
const boat = (len, mat, x, y, z, ry = 0, serpent = false) => { const g = grp(x, y, z, ry); g.add(box(len * 0.7, len * 0.12, len * 0.22, mat, 0, 0, 0)); for (const sgn of [-1, 1]) { const end = cyl(len * 0.05, len * 0.08, len * 0.4, mat, sgn * len * 0.4, -len * 0.02, 0, 6); end.rotation.z = sgn * -1.15; g.add(end); if (serpent) g.add(sph(len * 0.06, mat, sgn * len * 0.52, len * 0.3, 0)); } return g; };

/* Merge every mesh in a group by material into one mesh per material (fewer draw calls). Lights, flames and labels stay as they are. */
function merged(group, place) {
  group.updateMatrixWorld(true);
  const byMat = new Map(), keep = [];
  group.traverse(o => {
    if (o.isLight || o.isCSS2DObject) { keep.push(o); return; }
    if (!o.isMesh) return;
    if (o.userData.keep) { keep.push(o); return; }
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
    const k = o.material.uuid; if (!byMat.has(k)) byMat.set(k, { mat: o.material, parts: [] });
    byMat.get(k).parts.push(g.attributes.position.array);
  });
  const out = new THREE.Group(); out.userData.place = place;
  for (const { mat, parts } of byMat.values()) {
    const n = parts.reduce((s, a) => s + a.length, 0), pos = new Float32Array(n); let off = 0;
    for (const a of parts) { pos.set(a, off); off += a.length; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.place = place; out.add(mesh);
  }
  for (const o of keep) { const wp = new THREE.Vector3(); o.getWorldPosition(wp); const ws = new THREE.Vector3(); o.getWorldScale(ws); const wq = new THREE.Quaternion(); o.getWorldQuaternion(wq); o.removeFromParent(); o.position.copy(wp); o.quaternion.copy(wq); o.scale.copy(ws); o.userData.place = place; out.add(o); }
  return out;
}

// ---------- labels ----------
const featureLabels = [];
function label(text, x, y, z, cls = 'fl', place = null, sub = '') {
  const el = document.createElement('div'); el.className = cls; el.innerHTML = sub ? `<b>${text}</b><small>${sub}</small>` : text;
  const o = new CSS2DObject(el); o.position.set(x, y, z); o.userData.keep = true; if (place) { el.dataset.place = place; featureLabels.push(o); } return o;
}

// ---------- the world ----------
const world = new THREE.Group(); scene.add(world);
const S = W.surfaceY, D = W.duatY, R = W.riverY, HZ = W.depth / 2;

function buildTerrain() {
  const g = new THREE.Group();
  // cliffs: west and east ranges, jagged in profile, with a notch at the west where the sun goes down
  for (const side of [-1, 1]) {
    for (let z = -HZ; z < HZ; z += 100) {
      const notch = side < 0 && Math.abs(z + 50) < 60, recess = side < 0 && z + 50 > -110 && z + 50 < -10;
      const h = notch ? 18 : W.cliffHeight * (0.8 + 0.4 * Math.abs(Math.sin(z * 0.013 + side)));
      const x0 = side < 0 ? (recess ? -2522 : -2500) : 2500;
      const b = box(900 - (recess ? 22 : 0), h, 100, M.rock, side < 0 ? x0 - (900 - (recess ? 22 : 0)) / 2 : x0 + 450, S, z + 50); g.add(b);
    }
    // cavern end walls below the surface
    g.add(box(60, S - D, W.depth, M.rock, side < 0 ? -2530 : 2530, D, 0));
  }
  // the land of the living: a translucent slab so the Duat shows beneath (a section drawing)
  const slab = box(5000, 6, W.depth, M.slab, 0, S - 6, 0); slab.userData.keep = true; slab.name = 'slab'; g.add(slab);
  const grid = new THREE.GridHelper(5000, 50, P.goldSoft, P.goldSoft); grid.position.y = S + 0.05; grid.scale.z = W.depth / 5000; grid.material.transparent = true; grid.material.opacity = 0.18; grid.userData.keep = true; g.add(grid);
  // the Duat floor, with a gap for the night river trench along the south side
  g.add(box(5000, 2, 490 + HZ, M.ground, 0, D - 2, (490 - HZ) / 2));
  g.add(box(5000, 2, HZ - 550, M.ground, 0, D - 2, (550 + HZ) / 2));
  g.add(box(5000, D - R, 2, M.rock, 0, R, 490), box(5000, D - R, 2, M.rock, 0, R, 550));
  g.add(box(5000, 2, 56, M.water, 0, R - 2, 520));
  // the Nile is not drawn: the papyrus describes no river of the living
  return merged(g, 'duat');
}

function buildThebes() {
  const g = new THREE.Group(), z = -60, y = S;
  // causeway from the procession to the tomb door
  g.add(box(4060, 0.2, 3, M.goldSoft, -470, y, z));
  // the boat-shrine on its sledge, drawn by oxen, heading west
  const sled = grp(1500, y, z); sled.add(box(7, 0.5, 2.2, M.bronzeDark, 0, 0, 0)); sled.add(boat(6.5, M.bronze, 0, 0.9, 0)); sled.add(box(2.6, 2.2, 1.8, M.gold, 0, 1.4, 0)); g.add(sled);
  g.add(figure({ head: 'man', pose: 'kneel', x: 1503, y, z: z + 1.8, ry: -Math.PI / 2 }));             // Tutu
  g.add(animal(2.4, 1.6, M.figureDark, 1493, y, z - 0.7, Math.PI, 'cow'), animal(2.4, 1.6, M.figureDark, 1493, y, z + 0.7, Math.PI, 'cow'));
  g.add(figure({ head: 'man', x: 1489, y, z, item: 'staff', ry: -Math.PI / 2 }));                       // the Sem priest
  for (let i = 0; i < 8; i++) g.add(figure({ head: 'man', x: 1507 + i * 2, y, z: z + (i % 2 ? 1 : -1), item: 'raised', ry: -Math.PI / 2 }));
  const ark = grp(1527, y, z); ark.add(box(4, 0.5, 1.8, M.bronzeDark), box(3, 1.6, 1.4, M.bronze, 0, 0.5, 0), animal(1.4, 0.8, M.figureDark, 0, 2.1, 0, 0, 'jackal')); g.add(ark);
  g.add(figure({ head: 'man', x: 1523.5, y, z: z + 1.6, ry: -Math.PI / 2 }), figure({ head: 'man', x: 1523.5, y, z: z - 1.6, ry: -Math.PI / 2 }));
  for (let i = 0; i < 3; i++) { const f = figure({ head: 'man', x: 1532 + i * 2.5, y, z, ry: -Math.PI / 2 }); f.add(box(0.15, 0.15, 3, M.bronzeDark, 0, 3.1, 0), box(0.6, 0.5, 0.6, M.bronzeDark, 0, 2.5, -1.3), box(0.6, 0.5, 0.6, M.bronzeDark, 0, 2.5, 1.3)); g.add(f); }
  g.add(animal(2.4, 1.6, M.figureDark, 1542, y, z, Math.PI, 'cow'), animal(1.3, 0.9, M.figureDark, 1544, y, z + 1.4, Math.PI, 'cow'));
  g.add(box(0.8, 0.8, 0.8, M.bronze, 1547, y, z - 1), box(0.8, 0.8, 0.8, M.bronze, 1547, y, z + 1), figure({ head: 'man', x: 1550, y, z, ry: -Math.PI / 2 }));
  g.add(label('The funeral procession', 1520, y + 7, z, 'fl', 'thebes', 'Spell 1, sheets 5 and 6'));
  g.add(label('The town of the living: not described, not drawn', 1500, y + 3, z + 260, 'fl gap', 'thebes'));
  return merged(g, 'thebes');
}

function buildWest() {
  const g = new THREE.Group(), x = -2500;
  // Hathor's cow stepping out of the funeral mountain above the tomb door
  const cow = animal(5, 3.2, M.figure, x - 1.5, S + 12, -60, 0, 'cow'); cow.add(sph(0.7, M.gold, 2.9, 3.6, 0), box(0.5, 0.9, 0.2, M.gold, 2.6, 2.2, 0)); g.add(cow);
  g.add(box(6, 12, 6, M.rock, x - 2, S, -60));
  // Hathor as a hippopotamus with disk and horns, before tables of offerings
  g.add(figure({ head: 'hippo', h: 4.2, item: 'ankh', x: x + 12, y: S, z: -42, ry: Math.PI / 2 }), table(x + 15, S, -40), table(x + 15, S, -44));
  // the shrine of Seker-Osiris
  const sh = shrine(3.2, 4.4, 2.6, M.bronze, x + 11, S, -20, Math.PI / 2); sh.add(figure({ head: 'mummy', h: 3.2, item: 'whitecrown', x: 0, y: 0, z: 0 })); g.add(sh);
  for (let i = 0; i < 14; i++) g.add(cone(0.4, 1.4 + (i % 3) * 0.5, M.green, x + 6 + (i % 4) * 2.2, S, -95 + i * 6.5, 5), sph(0.25, M.gold, x + 6 + (i % 4) * 2.2, S + 1.7 + (i % 3) * 0.5, -95 + i * 6.5, 5));
  g.add(label('Manu, the western horizon', x, S + 70, 0, 'fl', 'west', 'the notch where Ra sets'));
  g.add(label('Hathor, the cow of the funeral mountain', x + 4, S + 19, -60, 'fl', 'west', 'Spell 186, sheet 37'));
  g.add(label('Seker-Osiris in his shrine', x + 11, S + 7, -20, 'fl', 'west'));
  return merged(g, 'west');
}

function buildTomb() {
  const g = new THREE.Group(), cx = -2508, cz = -60, y = S;              // chamber 12 by 8, 6 high, just inside the cliff face
  g.add(box(12, 0.4, 8, M.ground, cx, y - 0.4, cz));
  g.add(box(12, 6, 0.5, M.wall, cx, y, cz - 4), box(12, 6, 0.5, M.wall, cx, y, cz + 4), box(0.5, 6, 8, M.wall, cx - 6, y, cz));
  g.add(box(0.5, 6, 2.6, M.wall, cx + 6, y, cz - 2.7), box(0.5, 6, 2.6, M.wall, cx + 6, y, cz + 2.7), box(0.5, 1.2, 2.8, M.wall, cx + 6, y + 4.8, cz)); // east door
  // the bier under a canopy, Anubis beside it
  for (const [dx, dz] of [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]]) g.add(cyl(0.12, 0.12, 4.2, M.gold, cx + dx, y, cz + dz));
  g.add(box(5, 0.2, 3.2, M.goldSoft, cx, y + 4.2, cz), box(4.2, 0.4, 1.4, M.bronze, cx, y + 1.1, cz));
  for (const [dx, dz] of [[-1.8, -0.5], [1.8, -0.5], [-1.8, 0.5], [1.8, 0.5]]) g.add(box(0.25, 1.1, 0.25, M.bronze, cx + dx, y, cz + dz));
  const mummy = figure({ head: 'mummy', h: 3.4, mat: M.white }); mummy.rotation.z = -Math.PI / 2; mummy.position.set(cx - 1.55, y + 1.9, cz); g.add(mummy);
  g.add(figure({ head: 'jackal', x: cx, y, z: cz + 1.9, ry: Math.PI, item: 'raised' }));
  // Isis at the foot (east), Nephthys at the head (west), each with a flame behind her; the Tet above, the jackal below
  g.add(figure({ head: 'man', pose: 'kneel', x: cx + 3.6, y, z: cz, ry: -Math.PI / 2 }), figure({ head: 'man', pose: 'kneel', x: cx - 3.6, y, z: cz, ry: Math.PI / 2 }));
  g.add(cyl(0.4, 0.5, 0.8, M.bronzeDark, cx + 5.2, y, cz), flame(0.35, 1.2, cx + 5.2, y + 0.8, cz), cyl(0.4, 0.5, 0.8, M.bronzeDark, cx - 5.2, y, cz), flame(0.35, 1.2, cx - 5.2, y + 0.8, cz));
  g.add(light(cx, y + 3, cz, P.flame, 600, 60));
  const tet = grp(cx, y, cz - 3.4); tet.add(cyl(0.3, 0.35, 2.2, M.gold)); for (let i = 0; i < 4; i++) tet.add(box(1.2, 0.18, 0.8, M.gold, 0, 2.2 + i * 0.35, 0)); g.add(tet);
  g.add(box(2.2, 0.8, 1.2, M.bronzeDark, cx, y, cz + 3.2), animal(1.4, 0.8, M.figureDark, cx, y + 0.8, cz + 3.2, 0, 'jackal'));
  // the four children of Horus at the corners
  for (const [dx, dz, h] of [[-5, -3, 'man'], [5, -3, 'ape'], [-5, 3, 'jackal'], [5, 3, 'hawk']]) g.add(figure({ head: h, h: 3, x: cx + dx, y, z: cz + dz, ry: Math.atan2(-dx, -dz) }));
  // the two birds on pylons, the Perfected Soul, the shabti
  for (const sgn of [-1, 1]) { g.add(box(0.9, 1.6, 0.9, M.bronze, cx + sgn * 4.6, y, cz - 2.2)); const bird = figure({ head: 'man', h: 1.2, x: cx + sgn * 4.6, y: y + 1.6, z: cz - 2.2, ry: sgn > 0 ? Math.PI / 2 : -Math.PI / 2 }); bird.add(box(0.5, 0.2, 1.4, M.figure, 0, 0.9, 0)); g.add(bird); }
  g.add(figure({ head: 'man', h: 3, x: cx + 4.6, y, z: cz + 2.4, ry: -Math.PI / 2 }), figure({ head: 'mummy', h: 1.6, x: cx - 4.6, y, z: cz + 2.4 }));
  // outside the door: the Opening of the Mouth on the statue of Ani
  g.add(figure({ head: 'man', pose: 'sit', x: cx + 9.5, y, z: cz - 3, ry: -Math.PI / 2, mat: M.figureDark }), figure({ head: 'man', x: cx + 12.5, y, z: cz - 3, ry: Math.PI / 2, item: 'sceptre' }), box(1.4, 0.9, 0.9, M.bronze, cx + 11, y, cz - 5.5));
  g.add(figure({ head: 'mummy', h: 3.4, mat: M.white, x: cx + 8.5, y, z: cz + 2 }), figure({ head: 'jackal', x: cx + 9.6, y, z: cz + 2, ry: Math.PI / 2, item: 'raised' }));
  g.add(label('The burial chamber', cx, y + 8, cz, 'fl', 'tomb', 'Spell 151: the plan in fifteen compartments, sheets 33 and 34'));
  g.add(label('Nephthys and her flame', cx - 4.5, y + 3, cz, 'fl', 'tomb'), label('Isis and her flame', cx + 4.5, y + 3, cz, 'fl', 'tomb'), label('The door of the tomb: the Opening of the Mouth', cx + 11, y + 6, cz, 'fl', 'tomb', 'sheet 6, sheet 15'));
  return merged(g, 'tomb');
}

function buildRosetau() {
  const g = new THREE.Group();
  // the northern door of the chamber, then a stair that falls east to the Duat floor
  g.add(box(2.6, 0.6, 0.6, M.goldSoft, -2508, S + 4.8, -64.3));
  g.add(box(10, 0.4, 6, M.ground, -2505, S - 0.4, -70));
  g.add(stair(70, -2, 2, 6, M.bronzeDark, -2500, S - 2, -70));
  // the gate at the foot of the stair, and the two lions where the way turns east
  const gate = grp(-2355, D, -70); gate.add(box(1.2, 9, 1.2, M.bronze, 0, 0, -3.6), box(1.2, 9, 1.2, M.bronze, 0, 0, 3.6), box(1.6, 1.4, 8.4, M.bronze, 0, 9, 0)); g.add(gate);
  g.add(animal(4, 2.4, M.figure, -2340, D, -86, Math.PI / 2, 'lion'), animal(4, 2.4, M.figure, -2340, D, -54, -Math.PI / 2, 'lion'));
  g.add(label('Rosetau, the northern door of the tomb', -2460, S - 30, -70, 'fl', 'rosetau', 'Spell 17 gloss; Spells 1 and 147'));
  g.add(label('Yesterday and Tomorrow, the two lions', -2340, D + 7, -70, 'fl', 'rosetau', 'Spell 17, sheet 7'));
  return merged(g, 'rosetau');
}

function buildPools() {
  const g = new THREE.Group();
  for (const [x, name] of [[-2300, 'Pool of Natron'], [-2260, 'Pool of Nitre or Salt']]) { g.add(box(24, 0.6, 24, M.bronzeDark, x, D, -150), box(22, 0.5, 22, M.water, x, D + 0.4, -150)); g.add(label(name, x, D + 5, -150, 'fl', 'duat', 'Spell 17, sheet 8')); }
  g.add(figure({ head: 'man', h: 5, x: -2280, y: D, z: -168, item: 'raised' }));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 0.6, 24), M.green).translateX(-2200).translateY(D + 0.3).translateZ(-215));
  g.add(label('The Green Lake', -2200, D + 5, -215, 'fl', 'duat'));
  // the seh hall where Ani and Tutu play draughts
  const seh = grp(-2300, D, 60); for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) seh.add(cyl(0.3, 0.3, 4, M.bronze, dx, 0, dz)); seh.add(box(8, 0.4, 8, M.goldSoft, 0, 4, 0), box(1.6, 0.8, 1, M.bronzeDark, 0, 0, 0), figure({ head: 'man', pose: 'sit', h: 3, x: -1.6, y: 0, z: 0, ry: Math.PI / 2 }), figure({ head: 'man', pose: 'sit', h: 3, x: 1.6, y: 0, z: 0, ry: -Math.PI / 2 })); g.add(seh);
  g.add(label('The seh hall: draughts', -2300, D + 7, 60, 'fl', 'duat', 'Spell 17, sheet 7'));
  g.add(label('Amenta, the Duat: "it hath not water, it hath not air; it is deep unfathomable, it is black as the blackest night"', -1000, D + 60, -500, 'fl big', 'duat', 'Spell 175, sheet 29'));
  return merged(g, 'duat');
}

function buildSycamore() {
  const g = new THREE.Group(), x = -2250, z = 20;
  g.add(box(22, 0.6, 22, M.bronzeDark, x, D, z), box(20, 0.5, 20, M.water, x, D + 0.4, z));
  const tree = grp(x - 12, D, z); tree.add(cyl(0.6, 0.9, 7, M.bronzeDark), sph(5, M.green, 0, 9.5, 0, 7), sph(3.5, M.green, 3.5, 8, 1.5, 6), sph(3.2, M.green, -3, 8.5, -2, 6)); tree.add(figure({ head: 'man', h: 3, x: 1.5, y: 6.2, z: 2.5, ry: Math.PI / 2, item: 'raised' })); g.add(tree);
  g.add(figure({ head: 'man', pose: 'kneel', x: x - 8.5, y: D, z: z + 2, ry: Math.PI / 2 }));
  for (let i = 0; i < 6; i++) { const px = x - 11 + i * 4.6, pz = z + 12.5; g.add(cyl(0.3, 0.45, 6 + (i % 2), M.bronzeDark, px, D, pz)); for (let k = 0; k < 5; k++) g.add(cone(0.35, 3, M.green, px, D + 5.6 + (i % 2), pz, 4).rotateZ(1.2 + k * 1.25)); }
  g.add(label('The sycamore of Nut', x - 12, D + 17, z, 'fl', 'sycamore', 'Spell 59, sheet 16'));
  return merged(g, 'sycamore');
}

const ARITS = [
  { keeper: 'Sekhet-hra-asht-aru', watcher: 'Meti-heh', herald: 'Ha-kheru', heads: ['hare', 'serpent', 'crocodile'], items: ['corn', 'knife', 'knife'] },
  { keeper: 'Un-hat', watcher: 'Seqet-hra', herald: 'Uset', heads: ['lion', 'man', 'dog'], items: ['knife', 'knife', 'knife'] },
  { keeper: 'Qeq-hauau-ent-pehui', watcher: 'Se-res-hra', herald: 'Aaa', heads: ['jackal', 'dog', 'serpent'], items: ['corn', 'knife', 'knife'] },
  { keeper: 'Khesef-hra-asht-kheru', watcher: 'Seres-tepu', herald: 'Khesef-At', heads: ['man', 'hawk', 'lion'], items: ['corn', 'knife', 'knife'] },
  { keeper: 'Ankh-f-em-fent', watcher: 'Shabu', herald: 'Teb-hra-keha-kheft', heads: ['hawk', 'man', 'snake'], items: ['knife', 'knife', 'knife'] },
  { keeper: 'Atek-au-kehaq-kheru', watcher: 'An-hri', herald: 'Ates-hra', heads: ['jackal', 'dog', 'dog'], items: ['corn', 'knife', 'knife'] },
  { keeper: 'Sekhem-Matenu-sen', watcher: 'Aa-maa-kheru', herald: 'Khesef-khemi', heads: ['hare', 'lion', 'man'], items: ['knife', 'knife', 'corn'] }
];
function buildArits() {
  const g = new THREE.Group();
  g.add(box(480, 40, 30, M.rock, -1710, D, -95), box(480, 40, 30, M.rock, -1710, D, 95));
  ARITS.forEach((a, i) => {
    const x = -1880 + i * 60;
    const gate = grp(x, D, 0); gate.add(box(2, 14, 2, M.bronze, 0, 0, -6), box(2, 14, 2, M.bronze, 0, 0, 6), box(2.6, 2, 14.6, M.bronze, 0, 14, 0));
    if (i === 0) for (let k = -2; k <= 2; k++) gate.add(box(0.5, 1.6, 0.5, M.gold, 0, 16, k * 2.6));
    a.heads.forEach((h, k) => gate.add(figure({ head: h, pose: 'sit', h: 4.5, item: a.items[k], x: -5, y: 0, z: (k - 1) * 9, ry: -Math.PI / 2 })));
    g.add(gate);
    g.add(label(`Arit ${i + 1}`, x, D + 20, 0, 'fl', 'arits', `${a.keeper} · ${a.watcher} · ${a.herald}`));
  });
  for (let i = 0; i < 12; i++) g.add(box(2.4, 0.9, 1, M.ember, -1888 + i * 2.5, D, 12), light(-1874, D + 2, 12, P.flame, 400, 40));
  g.add(label('The Seven Arits in the great valley', -1700, D + 48, 0, 'fl big', 'arits', 'Spell 147, sheets 11 and 12'));
  g.add(label('The wall of burning coals', -1874, D + 4, 14, 'fl', 'arits', 'Spell 147, first Arit'));
  return merged(g, 'arits');
}

const PYLONS = [
  { keeper: 'Neruit', text: 'the lady of terrors, with lofty walls', head: 'bird', item: 'disk', top: 'khakeru', h: 36 },
  { keeper: 'Mes-Ptah', text: 'the lady of heaven, the mistress of the world, who devoureth with fire', head: 'lion', top: 'serpent' },
  { keeper: 'Sebaq', text: 'the lady of the altar', head: 'man', top: 'utchats' },
  { keeper: 'Nekau', text: 'she who prevaileth with knives', head: 'cow', top: 'uraei' },
  { keeper: 'Hentet-Arqiu', text: 'the flame, the lady of breath', head: 'hippo', top: 'flames' },
  { keeper: 'Semati', text: 'man knoweth neither her breadth nor her height', head: 'man', item: 'besom', top: 'serpent', h: 420 },
  { keeper: 'Sakti-f', text: 'the robe which doth clothe the feeble one', head: 'ram', item: 'besom', top: 'khakeru' },
  { keeper: 'Khu-tchet-f', text: 'the blazing fire, the flame whereof cannot be quenched', head: 'hawk', item: 'doublecrown', top: 'hawks', fire: true },
  { keeper: 'Ari-su-tchesef', text: 'her girth is three hundred and fifty measures', head: 'lion', item: 'besom', top: 'uraei', round: true },
  { keeper: 'Sekhen-ur', text: 'she who is loud of voice', head: 'ram', item: 'atef', top: 'serpents' }
];
function buildPylons() {
  const g = new THREE.Group();
  PYLONS.forEach((p, j) => {
    const x = -1260 + j * 80, h = p.h || 24, py = grp(x, D, 0);
    if (p.round) {
      const r = 350 / (2 * Math.PI), t0 = Math.asin(7.5 / r);
      for (const start of [Math.PI / 2 + t0, Math.PI * 1.5 + t0]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 30, 64, 1, false, start, Math.PI - 2 * t0), M.green); m.position.y = 15; py.add(m); }
      py.add(label('The ninth pylon, round: 350 measures about', 0, 34, 0, 'fl', 'pylons', 'read as cubits of circumference; the unit is not in the text'));
    } else {
      for (const sgn of [-1, 1]) { const tower = new THREE.Mesh(new THREE.CylinderGeometry(5, 6.5, h, 4), M.bronze); tower.rotation.y = Math.PI / 4; tower.position.set(0, h / 2, sgn * 14); py.add(tower); if (p.fire) { py.add(flame(2.2, 6, 0, h, sgn * 14)); } }
      py.add(box(10, 3, 14, M.bronze, 0, 12, 0));
      if (p.fire) py.add(light(0, h + 4, 0, P.flame, 6000, 220));
    }
    // the guardian in a shrine before the pylon
    const sh = shrine(5, 6.5, 5, M.bronzeDark, -12, 0, 0, -Math.PI / 2);
    sh.add(figure({ head: p.head, pose: 'sit', h: 4.5, item: p.item || null, x: 0, y: 0, z: 0, mat: M.figure }));
    const top = 6.8;
    if (p.top === 'khakeru') for (let k = -2; k <= 2; k++) sh.add(cone(0.35, 1.2, M.gold, k * 1, top, 0, 4));
    if (p.top === 'serpent') sh.add(new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.2, 6, 12, Math.PI), M.gold).translateY(top + 0.2));
    if (p.top === 'serpents') for (const s of [-1.3, 1.3]) sh.add(new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.18, 6, 12, Math.PI), M.gold).translateY(top + 0.2).translateX(s));
    if (p.top === 'utchats') for (const s of [-1.4, 1.4]) sh.add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 6, 12), M.gold).translateY(top + 0.7).translateX(s).rotateX(Math.PI / 2)), sh.add(sph(0.4, M.gold, 0, top + 0.7, 0));
    if (p.top === 'uraei') for (let k = -2; k <= 2; k++) sh.add(cone(0.3, 1.2, M.gold, k * 1, top, 0, 5), sph(0.22, M.gold, k * 1, top + 1.4, 0));
    if (p.top === 'flames') for (let k = -2; k <= 2; k++) sh.add(flame(0.35, 1.3, k * 1, top, 0));
    if (p.top === 'hawks') { for (const s of [-1.4, 1.4]) sh.add(figure({ head: 'man', h: 1.2, x: s, y: top, z: 0 })); for (const s of [-0.5, 0.5]) sh.add(cyl(0.05, 0.05, 0.9, M.gold, s, top, 0)); }
    py.add(sh);
    py.add(label(`Pylon ${j + 1}: ${p.text}`, 0, Math.min(h, 60) + 6, 0, 'fl', 'pylons', `doorkeeper ${p.keeper}`));
    g.add(py);
  });
  g.add(label('The Ten Pylons of the House of Osiris', -900, D + 90, 0, 'fl big', 'pylons', 'Spell 146, sheets 11 and 12'));
  return merged(g, 'pylons');
}

function buildCouncils() {
  const g = new THREE.Group();
  const names = ['Heliopolis', 'Busiris', 'Letopolis', 'Pe and Dep', 'the two banks', 'Abydos', 'the judges of the dead', 'Naref', 'Rosetau', 'the great gods'];
  names.forEach((n, k) => {
    const x = -330 + Math.floor(k / 2) * 54 + 12, z = k % 2 ? 18 : -18, ry = k % 2 ? Math.PI : 0;
    g.add(box(24, 1.2, 2, M.bronzeDark, x, D, z));
    for (let i = 0; i < 4; i++) g.add(figure({ head: i === 2 ? 'ibis' : i === 3 ? 'jackal' : 'man', pose: 'sit', h: 3.6, item: 'sceptre', x: x - 9 + i * 6, y: D + 1.2, z, ry }));
    g.add(label(`The council of ${n}`, x, D + 7, z, 'fl', 'cities', 'Spell 18'));
  });
  for (const sgn of [-1, 1]) { g.add(box(4, 9, 3, M.bronze, -350, D, sgn * 30)); if (sgn < 0) for (let k = -1; k <= 1; k++) g.add(box(0.3, 2.2, 0.9, M.gold, -350 + k * 1.2, D + 9, sgn * 30)); else g.add(animal(2.2, 1.2, M.figureDark, -350, D + 9, sgn * 30, 0, 'jackal')); }
  g.add(figure({ head: 'man', x: -345, y: D, z: 0, item: 'staff', ry: Math.PI / 2 }), figure({ head: 'man', x: -348.5, y: D, z: 0, item: 'raised', ry: Math.PI / 2 }), figure({ head: 'man', x: -352, y: D, z: 0, item: 'sistrum', ry: Math.PI / 2 }));
  g.add(label('The councils of the holy cities', -180, D + 24, 0, 'fl big', 'cities', 'tribunals in named cities; seated here on the approach, by editorial choice'));
  return merged(g, 'cities');
}

function buildHall() {
  const g = new THREE.Group(), x0 = 45, x1 = 195, hw = 15, H = 20;
  g.add(box(150, 1, 30, M.ground, 120, D, 0));
  g.add(box(150, H, 1, M.wall, 120, D + 1, -hw), box(150, H, 1, M.wall, 120, D + 1, hw));
  for (const x of [x0, x1]) { g.add(box(1, H, 11, M.wall, x, D + 1, -9.5), box(1, H, 11, M.wall, x, D + 1, 9.5), box(1, H - 10, 8, M.wall, x, D + 11, 0)); g.add(box(1.4, 10, 1, M.gold, x, D + 1, -4.5), box(1.4, 10, 1, M.gold, x, D + 1, 4.5), box(1.4, 1, 10, M.gold, x, D + 10, 0)); }
  // the roofline: uraei and feathers; the seated deity at the centre over the eye of Horus and a pool
  for (let x = x0 + 3; x < x1; x += 3) for (const z of [-hw, hw]) { if (Math.round(x / 3) % 2) g.add(cone(0.7, 1.8, M.gold, x, D + H + 1, z, 5)); else g.add(box(0.35, 2.4, 1.0, M.goldSoft, x, D + H + 1, z)); }
  g.add(box(2, 1, 30, M.goldSoft, 120, D + H + 1, 0), figure({ head: 'man', pose: 'sit', h: 4, item: 'raised', x: 120, y: D + H + 2, z: 0, ry: Math.PI / 2 }));
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.3, 6, 14), M.gold).translateX(120).translateY(D + H + 2.2).translateZ(-6).rotateX(Math.PI / 2), box(3, 0.4, 3, M.water, 120, D + H + 2, 6));
  // the forty-two assessors in one row down the middle
  for (let i = 0; i < 42; i++) g.add(figure({ head: i % 7 === 3 ? 'jackal' : i % 5 === 2 ? 'hawk' : i % 11 === 6 ? 'serpent' : 'man', pose: 'sit', h: 3.2, item: 'knife', x: 56 + i * 3, y: D + 1, z: 0, ry: Math.PI }));
  // the weighing of the heart at the entrance end
  const wx = 52, wz = -8;
  g.add(cyl(0.3, 0.4, 8, M.gold, wx, D + 1, wz), box(9, 0.3, 0.3, M.gold, wx, D + 8.6, wz));
  for (const s of [-1, 1]) { g.add(cyl(0.02, 0.02, 3, M.gold, wx, D + 5.6, wz + s * 4.3), cyl(0.9, 0.9, 0.2, M.gold, wx, D + 5.4, wz + s * 4.3)); }
  g.add(sph(0.35, M.ember, wx, D + 5.8, wz - 4.3), box(0.1, 1.2, 0.5, M.white, wx, D + 5.6, wz + 4.3));
  g.add(figure({ head: 'ape', pose: 'sit', h: 1.2, x: wx, y: D + 8.9, z: wz }));
  g.add(figure({ head: 'jackal', x: wx + 2.2, y: D + 1, z: wz, ry: -Math.PI / 2, item: 'raised' }), figure({ head: 'ibis', x: wx + 5, y: D + 1, z: wz, ry: -Math.PI / 2, item: 'palette' }));
  const ammit = animal(3.2, 2, M.figureDark, wx + 9, D + 1, wz, Math.PI, 'lion'); ammit.add(box(0.5, 0.4, 1.6, M.figureDark, 1.9, 1.5, 0)); g.add(ammit);
  g.add(figure({ head: 'man', x: 48, y: D + 1, z: 6, ry: Math.PI / 2, item: 'raised' }), figure({ head: 'man', x: 47, y: D + 1, z: 8.5, ry: Math.PI / 2, item: 'sistrum' }));
  g.add(figure({ head: 'man', h: 2.4, x: wx - 2.5, y: D + 1, z: wz - 1.5, ry: Math.PI / 2 }), figure({ head: 'man', h: 2.4, x: wx - 2.5, y: D + 1, z: wz + 1.5, ry: Math.PI / 2 }), box(0.3, 2.4, 0.3, M.gold, wx - 4, D + 1, wz));
  g.add(box(14, 3, 2, M.bronzeDark, 56, D + 1, -13)); for (let i = 0; i < 12; i++) g.add(figure({ head: 'man', pose: 'sit', h: 2.4, item: 'sceptre', x: 49.5 + i * 1.15, y: D + 4, z: -13, ry: 0 }));
  // the far end: the two Maats, Osiris with Ani adoring, the balance with Ammit, Thoth painting the feather
  g.add(figure({ head: 'man', pose: 'sit', h: 3, item: 'sceptre', x: 182, y: D + 1, z: -11, ry: Math.PI / 2 }), figure({ head: 'man', pose: 'sit', h: 3, item: 'sceptre', x: 185, y: D + 1, z: -11, ry: Math.PI / 2 }));
  g.add(figure({ head: 'man', pose: 'sit', h: 4, item: 'atef', x: 191, y: D + 1, z: -10, ry: -Math.PI / 2 }), figure({ head: 'man', x: 187.5, y: D + 1, z: -10, ry: Math.PI / 2, item: 'raised' }));
  g.add(cyl(0.2, 0.3, 4, M.gold, 185, D + 1, 10), box(4, 0.2, 0.2, M.gold, 185, D + 5.1, 10), animal(2.2, 1.4, M.figureDark, 188.5, D + 1, 10, Math.PI, 'lion'));
  g.add(box(1.2, 1.6, 1.2, M.bronze, 191.5, D + 1, 10), figure({ head: 'ibis', pose: 'sit', h: 2.4, item: 'palette', x: 191.5, y: D + 2.6, z: 10, ry: -Math.PI / 2 }), box(0.15, 2, 0.7, M.white, 193.2, D + 1, 10));
  g.add(label('The Hall of Two Truths', 120, D + H + 14, 0, 'fl big', 'hall', 'Spell 125, sheets 29 to 32; the weighing on sheet 3'));
  g.add(label('The left door: Neb-pehti-thesu-menment', x0, D + 26, 0, 'fl', 'hall', 'Spell 125\'s door, placed at this end by editorial choice; the text does not say which. Anubis asks its name: "Driven away of Shu"; upper leaf "Lord of right and truth, standing upon his two feet"; lower leaf "Lord of might and power, dispenser of cattle"'));
  g.add(label('The right door: Neb-Maat-heri-tep-retui-f', x1, D + 26, 0, 'fl', 'hall'));
  g.add(label('The forty-two assessors', 118, D + 6, 0, 'fl', 'hall', 'the Negative Confession, sheets 31 and 32'), label('The weighing of the heart', wx, D + 12, wz, 'fl', 'hall', 'sheet 3'));
  return merged(g, 'hall');
}

function buildThrone() {
  const g = new THREE.Group(), cx = 222, hw = 20;
  g.add(box(44, 1, 40, M.ground, cx, D, 0), box(1, 8, 8, M.wall, 199, D + 1, 0));
  g.add(box(44, 16, 1, M.wall, cx, D + 1, -hw), box(44, 16, 1, M.wall, cx, D + 1, hw), box(1, 16, 40, M.wall, cx + 22, D + 1, 0));
  g.add(box(10, 2, 10, M.bronzeDark, cx + 10, D + 1, 0));
  const sh = shrine(7, 8, 7, M.bronze, cx + 10, D + 3, 0, -Math.PI / 2); sh.add(cone(0.6, 1.4, M.gold, 0, 8.3, 0), sph(0.55, M.gold, 0, 9.9, 0)); for (let k = -2; k <= 2; k++) sh.add(cone(0.3, 1, M.gold, k * 1.3, 8.3, 0, 5)); g.add(sh);
  g.add(figure({ head: 'man', pose: 'sit', h: 5, item: 'atef', x: cx + 10, y: D + 3, z: 0, ry: -Math.PI / 2 }));
  g.add(figure({ head: 'man', h: 4, x: cx + 13.5, y: D + 3, z: -1.8, ry: -Math.PI / 2, item: 'raised' }), figure({ head: 'man', h: 4, x: cx + 13.5, y: D + 3, z: 1.8, ry: -Math.PI / 2, item: 'raised' }));
  g.add(cyl(0.12, 0.12, 3, M.green, cx + 4.5, D + 3, 0), cyl(1.2, 0.4, 0.8, M.green, cx + 4.5, D + 6, 0)); for (let i = 0; i < 4; i++) g.add(figure({ head: ['man', 'ape', 'jackal', 'hawk'][i], h: 1.3, x: cx + 4.5 - 0.6 + i * 0.4, y: D + 6.8, z: 0, ry: -Math.PI / 2 }));
  g.add(figure({ head: 'hawk', x: cx - 8, y: D + 1, z: 0, ry: Math.PI / 2, item: 'ankh' }), figure({ head: 'man', x: cx - 11, y: D + 1, z: 0, ry: Math.PI / 2, item: 'raised' }), figure({ head: 'man', pose: 'kneel', x: cx - 2, y: D + 1, z: 0, ry: Math.PI / 2 }), table(cx + 0.5, D + 1, 0));
  g.add(label('The throne of Osiris', cx + 10, D + 16, 0, 'fl', 'throne', 'sheet 4; sheet 30; Spell 124'), label('Horus leads Ani in', cx - 9, D + 6, 0, 'fl', 'throne', 'sheet 4'));
  return merged(g, 'throne');
}

function buildLake() {
  const g = new THREE.Group(), cx = 120, cz = 160;
  g.add(box(44, 1.2, 44, M.bronzeDark, cx, D, cz), box(40, 0.6, 40, M.ember, cx, D + 1, cz));
  for (let i = 0; i < 26; i++) g.add(flame(1.2 + (i % 3) * 0.4, 2.5 + (i % 4), cx - 17 + (i * 7.3) % 36, D + 1.5, cz - 17 + (i * 11.7) % 36));
  g.add(light(cx, D + 10, cz, P.flame, 7000, 220));
  for (const [dx, dz] of [[-21, -21], [21, -21], [-21, 21], [21, 21]]) g.add(figure({ head: 'ape', pose: 'sit', h: 3.4, item: 'raised', x: cx + dx, y: D + 1.2, z: cz + dz, ry: Math.atan2(-dx, -dz) }));
  g.add(label('The Lake of Fire', cx, D + 16, cz, 'fl', 'lake', 'sheet 33; a dog-headed ape at each corner'));
  return merged(g, 'lake');
}

function buildField() {
  const g = new THREE.Group(), y = D;
  g.add(box(1300, 0.6, 760, M.water, 1300, y - 0.4, 0));
  const isl = [-240, -80, 80, 240];
  for (const z of isl) g.add(box(1000, 1.6, 120, M.ground, 1300, y, z));
  // grain, three cubits tall
  const stalk = new THREE.BoxGeometry(0.16, 3, 0.16); stalk.translate(0, 1.5, 0);
  const grain = new THREE.InstancedMesh(stalk, M.grain, 1100); const mtx = new THREE.Matrix4(); let gi = 0;
  const seed = (i) => { const v = Math.sin(i * 12.9898) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < 550; i++) { mtx.makeTranslation(850 + seed(i) * 260, y + 1.6, -130 + seed(i + 7) * 100); grain.setMatrixAt(gi++, mtx); }
  for (let i = 0; i < 550; i++) { mtx.makeTranslation(1050 + seed(i + 99) * 300, y + 1.6, 190 + seed(i + 31) * 100); grain.setMatrixAt(gi++, mtx); }
  grain.userData.keep = true; g.add(grain);
  // island 1: Thoth presents Ani and his ka to the three gods; a boat; a hawk on a pylon pedestal; three ovals
  g.add(figure({ head: 'ibis', h: 7, item: 'palette', x: 900, y: y + 1.6, z: -240, ry: -Math.PI / 2 }), figure({ head: 'man', h: 7, item: 'raised', x: 893, y: y + 1.6, z: -240, ry: -Math.PI / 2 }), figure({ head: 'man', h: 7, item: 'raised', x: 886, y: y + 1.6, z: -240, ry: -Math.PI / 2 }));
  ['hare', 'serpent', 'bull'].forEach((h, k) => g.add(figure({ head: h, pose: 'sit', h: 7, item: 'sceptre', x: 912 + k * 7, y: y + 1.6, z: -240, ry: Math.PI / 2 })));
  g.add(boat(16, M.bronze, 1150, y + 0.2, -340), figure({ head: 'man', h: 5, item: 'raised', x: 1150, y: y + 2, z: -340, ry: -Math.PI / 2 }));
  g.add(box(3, 8, 3, M.bronze, 1400, y + 1.6, -240), figure({ head: 'hawk', h: 3, x: 1400, y: y + 9.6, z: -240 }), table(1395, y + 1.6, -240), figure({ head: 'man', h: 7, item: 'raised', x: 1388, y: y + 1.6, z: -240, ry: -Math.PI / 2 }));
  for (let k = 0; k < 3; k++) { const o = sph(9, M.goldSoft, 1600 + k * 40, y + 1.6, -240, 8); o.scale.set(1.4, 0.35, 1); g.add(o); }
  // island 2: reaping, threshing with oxen, kneeling before two vessels
  g.add(figure({ head: 'man', h: 7, item: 'knife', x: 1130, y: y + 1.6, z: -80, ry: Math.PI / 2 }));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.4, 20), M.bronzeDark).translateX(1400).translateY(y + 1.8).translateZ(-80), animal(5, 3.2, M.figureDark, 1395, y + 1.8, -84, 0.3, 'cow'), animal(5, 3.2, M.figureDark, 1405, y + 1.8, -76, 2.9, 'cow'), figure({ head: 'man', h: 7, item: 'staff', x: 1416, y: y + 1.6, z: -80, ry: -Math.PI / 2 }));
  g.add(figure({ head: 'man', pose: 'kneel', h: 7, x: 1580, y: y + 1.6, z: -80, ry: -Math.PI / 2 }), cyl(1.4, 1, 3, M.ember, 1588, y + 1.6, -83), cyl(1.4, 1, 3, M.gold, 1588, y + 1.6, -77));
  // island 3: ploughing in Sekhet-aanre, beside the river of a thousand cubits
  const plough = grp(1200, y + 1.6, 80); plough.add(animal(5, 3.2, M.figureDark, 7, 0, -2.5, 0, 'cow'), animal(5, 3.2, M.figureDark, 7, 0, 2.5, 0, 'cow'), box(6, 0.4, 0.4, M.bronzeDark, 3, 1.4, 0), box(0.4, 2.5, 0.4, M.bronzeDark, 0, 0, 0)); plough.add(figure({ head: 'man', h: 7, item: 'staff', x: -3, y: 0, z: 0, ry: Math.PI / 2 })); g.add(plough);
  // island 4: the boats with their stairs, the stair on the island, the seat of the shining ones
  for (const bx of [1300, 1500]) { const b = boat(22, M.green, bx, y + 0.4, 340, 0, true); b.add(stair(5, 0.7, 0.7, 3, M.gold, -1.8, 1.4, 0)); for (let k = 0; k < 4; k++) b.add(cyl(0.12, 0.12, 6, M.bronzeDark, -6 + k * 4, -1, 3).rotateX(0.5), cyl(0.12, 0.12, 6, M.bronzeDark, -6 + k * 4, -1, -3).rotateX(-0.5)); g.add(b); }
  g.add(stair(8, 0.8, 1, 6, M.gold, 1650, y + 1.6, 240));
  for (let k = 0; k < 3; k++) g.add(figure({ head: 'man', h: 7, item: 'staff', x: 900 + k * 9, y: y + 1.6, z: 250, ry: Math.PI / 2 }));
  // the city Hetep on the far bank: named, not described
  const hetep = grp(2050, y, -330); for (const [w, d, dx, dz] of [[60, 2, 0, -29], [60, 2, 0, 29], [2, 60, -29, 0], [2, 60, 29, 0]]) hetep.add(box(w, 8, d, M.wall, dx, 0, dz)); g.add(hetep);
  g.add(label('Sekhet-hetepet, the Field of Reeds', 1300, y + 60, 0, 'fl big', 'fields', 'Spell 110, sheets 34 and 35'));
  g.add(label('The river: one thousand cubits long, "not can be told its width"', 1300, y + 6, 160, 'fl', 'fields', 'Spell 110'), label('Sekhet-aanre: ploughing', 1200, y + 12, 80, 'fl', 'fields'));
  g.add(label('The seat of the shining ones: seven cubits', 910, y + 12, 250, 'fl', 'fields'), label('Wheat three cubits', 980, y + 8, -80, 'fl', 'fields'));
  g.add(label('Boats of eight oars with serpent heads and a flight of steps', 1400, y + 10, 340, 'fl', 'fields'), label('Hetep: named, not described', 2050, y + 12, -330, 'fl gap', 'fields'));
  g.add(label('Thoth presents Ani and his ka', 900, y + 12, -240, 'fl', 'fields'));
  return merged(g, 'fields');
}

function buildSkyBank() {
  const g = new THREE.Group(), y = D, x0 = 2050, z0 = -160;
  // the hall of the seven cows and the four rudders
  g.add(box(90, 0.8, 110, M.ground, x0 + 40, y, z0)); for (const [dx, dz] of [[-40, -50], [0, -50], [40, -50], [80, -50], [-40, 50], [0, 50], [40, 50], [80, 50]]) g.add(cyl(0.9, 1.1, 10, M.bronze, x0 + dx, y + 0.8, z0 + dz));
  g.add(box(130, 0.6, 106, M.wall, x0 + 40, y + 10.8, z0));
  g.add(figure({ head: 'hawk', h: 4.5, item: 'disk', x: x0 - 30, y: y + 0.8, z: z0, ry: Math.PI / 2 }), table(x0 - 25, y + 0.8, z0 - 1.5), table(x0 - 25, y + 0.8, z0 + 1.5), figure({ head: 'man', item: 'raised', x: x0 - 20, y: y + 0.8, z: z0, ry: -Math.PI / 2 }));
  for (let i = 0; i < 7; i++) { const c = animal(4, 2.2, M.figure, x0 - 10 + i * 8, y + 0.8, z0 + 10, Math.PI / 2, 'cow'); c.scale.y = 0.75; c.add(sph(0.35, M.gold, 2.4, 1.2, 0)); g.add(c); g.add(table(x0 - 10 + i * 8, y + 0.8, z0 + 16)); }
  g.add(animal(4.5, 2.8, M.figure, x0 + 50, y + 0.8, z0 + 10, Math.PI / 2, 'bull'), table(x0 + 50, y + 0.8, z0 + 16));
  ['north', 'west', 'east', 'south'].forEach((q, i) => { const ry = [Math.PI, -Math.PI / 2, Math.PI / 2, 0][i]; const r = grp(x0 + 10 + i * 12, y + 0.8, z0 - 30, ry); r.add(cyl(0.25, 0.25, 9, M.bronzeDark), box(0.3, 3.5, 1.6, M.gold, 0, 0, 0), box(1.6, 0.3, 0.3, M.bronzeDark, 0, 9, 0)); g.add(r); g.add(label(`Rudder of the ${q}ern heaven`, x0 + 10 + i * 12, y + 12, z0 - 30, 'fl', 'sky')); });
  for (let t = 0; t < 4; t++) for (let k = 0; k < 3; k++) g.add(figure({ head: k === 1 ? 'jackal' : 'man', h: 3, item: 'sceptre', x: x0 + 62 + k * 3, y: y + 0.8, z: z0 - 40 + t * 12, ry: -Math.PI / 2 }));
  // the ladder from the underworld to the body
  const lad = grp(2150, y, 100); lad.rotation.z = -0.12; for (const s of [-1.2, 1.2]) lad.add(box(0.5, 150, 0.5, M.gold, s, 0, 0)); for (let k = 0; k < 30; k++) lad.add(box(2.6, 0.3, 0.3, M.gold, 0, 2 + k * 5, 0)); g.add(lad);
  // the eleven transformations along the bank
  const fx = 2000, fz = 300;
  g.add(cone(2, 3, M.ember, fx, y, fz, 8), figure({ head: 'hawk', h: 1.4, x: fx, y: y + 3, z: fz }));                         // the swallow on its mound
  const hawk = figure({ head: 'hawk', h: 3, item: 'flail', mat: M.gold, x: fx + 14, y, z: fz }); hawk.add(box(7, 0.3, 1.6, M.gold, 0, 2.6, 0)); g.add(hawk);   // the golden hawk, seven cubits across
  g.add(box(2, 4, 2, M.bronze, fx + 28, y, fz), figure({ head: 'hawk', h: 2.2, mat: M.green, item: 'flail', x: fx + 28, y: y + 4, z: fz }));
  const serp = figure({ head: 'serpent', h: 2.6, x: fx + 42, y, z: fz }); g.add(serp);
  g.add(box(2, 4, 2, M.bronze, fx + 56, y, fz), animal(4, 1, M.figureDark, fx + 56, y + 4, fz, 0, 'cow'));
  const ptah = shrine(3, 4.6, 3, M.bronze, fx + 72, y, fz, Math.PI); ptah.add(figure({ head: 'mummy', h: 3.4, x: 0, y: 0, z: 0 })); g.add(ptah, table(fx + 72, y, fz + 3));
  g.add(animal(4, 2.6, M.figure, fx + 88, y, fz, 0, 'cow'), figure({ head: 'hawk', h: 3.2, x: fx + 102, y, z: fz }), figure({ head: 'hawk', h: 3.2, x: fx + 116, y, z: fz }));
  g.add(box(6, 0.4, 6, M.water, fx + 130, y, fz), cyl(0.12, 0.12, 2, M.green, fx + 130, y + 0.4, fz), sph(0.6, M.figure, fx + 130, y + 2.8, fz));
  g.add(figure({ head: 'man', h: 3.4, item: 'disk', x: fx + 144, y, z: fz }));
  g.add(label('The hall of the seven cows', x0 + 40, y + 18, z0, 'fl', 'sky', 'Spell 148, sheets 35 and 36'), label('The ladder to the sky', 2150, y + 150, 100, 'fl', 'sky', 'sheet 22'), label('The transformations', fx + 70, y + 10, fz, 'fl', 'sky', 'Spells 77 to 88, sheets 25 to 28'));
  g.add(label('The sky of Nut: the never-resting stars', 0, 2300, 0, 'fl big', 'sky', 'Spell 15'));
  return merged(g, 'sky');
}

function buildEast() {
  const g = new THREE.Group(), y = D, x = 2460;
  const djed = grp(x, y, 0); djed.add(cyl(2, 2.4, 10, M.gold)); for (let i = 0; i < 4; i++) djed.add(box(7, 0.8, 5, M.gold, 0, 10 + i * 1.3, 0));
  for (const s of [-1, 1]) { const arm = cyl(0.5, 0.5, 9, M.gold, s * 3, 13, 0); arm.rotation.z = s * -0.5; djed.add(arm); }
  const disk = sph(4.2, M.gold, 0, 24, 0, 16); disk.userData.keep = true; djed.add(disk); djed.add(light(0, 26, 0, P.flameHot, 9000, 320)); g.add(djed);
  for (let i = 0; i < 6; i++) g.add(figure({ head: 'ape', pose: 'sit', h: 2.6, item: 'raised', x: x - 14 + i * 5.6, y, z: 12, ry: Math.PI }));
  g.add(box(26, 0.6, 3, M.gold, x, y, -9), figure({ head: 'man', pose: 'kneel', h: 3.2, item: 'raised', x: x - 7, y: y + 0.6, z: -9, ry: Math.PI / 2 }), figure({ head: 'man', pose: 'kneel', h: 3.2, item: 'raised', x: x + 7, y: y + 0.6, z: -9, ry: -Math.PI / 2 }));
  // the two-leaved door in the eastern cliff: the Gate of Sert
  for (const s of [-1, 1]) { const leaf = box(1, 14, 5, M.bronze, 2500, y, s * 3.2); leaf.rotation.y = s * 0.45; g.add(leaf); }
  g.add(boat(10, M.gold, 2484, y + 0.4, 24, 0), figure({ head: 'hawk', pose: 'sit', h: 2.2, item: 'disk', x: 2484, y: y + 1.8, z: 24, ry: -Math.PI / 2 }));
  g.add(label('Bakhu, the eastern horizon', 2500, S + 70, 0, 'fl', 'east', 'where Ra rises and the dead come forth by day'));
  g.add(label('The sun lifted from the djed', x, y + 32, 0, 'fl', 'east', 'sheet 2'), label('The Gate of Sert: the two leaves of the door', 2500, y + 18, 0, 'fl', 'east', 'Spell 17 gloss, sheet 8'));
  return merged(g, 'east');
}

function buildBoat() {
  const g = new THREE.Group(), y = R, z = 520, x = -300;
  const b = boat(7, M.green, x, y + 0.3, z); b.add(box(1.6, 1.8, 1.4, M.gold, 0, 0.4, 0)); b.add(figure({ head: 'hawk', pose: 'sit', h: 1.6, item: 'disk', x: 0, y: 0.4, z: 0, ry: Math.PI / 2 }));
  b.add(figure({ head: 'man', h: 1.2, x: 2.6, y: 0.4, z: 0, ry: Math.PI / 2 }));                        // Horus the child on the bows
  for (let k = 0; k < 3; k++) b.add(figure({ head: k === 1 ? 'ibis' : k === 0 ? 'hawk' : 'man', h: 1.5, item: k === 0 ? 'staff' : null, x: -1.6 - k * 0.6, y: 0.4, z: (k - 1) * 0.5, ry: Math.PI / 2 }));
  for (let k = 0; k < 3; k++) for (const s of [-1, 1]) b.add(sph(0.12, M.gold, -1 + k * 1, 0.6, s * 0.8));
  g.add(b, light(x, y + 5, z, P.flameHot, 1500, 120));
  const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x + 3.5, y + 0.8, z), new THREE.Vector3(x + 22, D + 0.2, z + 36)]), new THREE.LineBasicMaterial({ color: P.goldSoft })); rope.userData.keep = true; g.add(rope);
  for (let k = 0; k < 4; k++) g.add(figure({ head: 'man', x: x + 23 + k * 2.2, y: D, z: z + 37, ry: -Math.PI / 2, item: 'raised' }));
  const pts = []; for (let i = 0; i <= 24; i++) pts.push(new THREE.Vector3(x + 30 + i * 1.6, y + 0.6 + Math.sin(i * 0.8) * 0.8, z + Math.cos(i * 0.8) * 1.2));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.5, 6), M.figureDark));
  g.add(figure({ head: 'cat', pose: 'sit', h: 2.4, item: 'knife', x: x + 40, y: D, z: 486, ry: 0 }));
  g.add(label('The night boat of Ra: seven cubits, painted green', x, y + 8, z, 'fl', 'boat', 'the rubric of Spell 133, sheet 22'), label('Apep, and the Cat of the Sun', x + 40, D + 6, 490, 'fl', 'boat', 'Spell 17, sheet 10'));
  g.add(label('The night river', 0, D + 14, 520, 'fl', 'boat', 'not described in Ani: a trench, by invention'));
  return merged(g, 'boat');
}

function buildSky() {
  const g = new THREE.Group(), n = 2200, pos = new Float32Array(n * 3), rad = W.skyRadius;
  for (let i = 0; i < n; i++) { const u = Math.random(), v = Math.random(); const th = u * Math.PI * 2, ph = Math.acos(1 - v); const r = rad * (0.9 + Math.random() * 0.2); const yy = Math.cos(ph) * r; if (yy < 150) { i--; continue; } pos[i * 3] = Math.sin(ph) * Math.cos(th) * r; pos[i * 3 + 1] = yy - 200; pos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: P.star, size: 7, sizeAttenuation: true, transparent: true, opacity: 0.85, fog: false })); stars.userData.keep = true; g.add(stars);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2700, 3, 6, 120, Math.PI), new THREE.MeshBasicMaterial({ color: P.goldSoft, transparent: true, opacity: 0.5, fog: false })); arch.position.y = -200; arch.userData.keep = true; g.add(arch);
  const day = boat(60, M.gold, 0, 2460, -300); day.add(figure({ head: 'hawk', pose: 'sit', h: 14, item: 'disk', mat: M.gold })); day.userData.keep = true; g.add(day);
  g.add(label('The Atet boat of the morning on the body of Nut', 0, 2500, -300, 'fl', 'sky', 'Spell 15'));
  g.userData.place = 'sky'; return g;
}

/* The fourteen Aats of the Papyrus of Nu (Spell 149) and the fifteen captions of Spell 150: a witness layer, admitted through
   the sourcing workstream (sources/G1-review.md). Placed in a band along the north of the Duat by editorial choice. */
const AATS = [
  { n: 'I', name: 'Aat of Amentet', key: 'wherein a man liveth upon cakes and ale', paint: 'green' },
  { n: 'II', name: 'Sekhet-Aarru', key: 'walls of iron (Budge) or steel (R&N); wheat 5 or 7 cubits, barley 7; Khus of 9 cubits (Budge), 7 then 9 (R&N)', paint: 'green' },
  { n: 'III', name: 'Aat of the Khus', key: 'whereover none can sail; the fire thereof is blazing', paint: 'green' },
  { n: 'IV', name: 'The double mountain', key: '300 measures long; 230 (Budge) or 10 (R&N) wide; the serpent Sati-temui, 70 cubits', paint: 'green' },
  { n: 'V', name: 'Aat of the Khus', key: 'whereover none may pass; thighs seven cubits long', paint: 'green' },
  { n: 'VI', name: 'Ammehet', key: 'holy unto the gods, hidden unto the Khus; a fish within the sign', paint: 'green' },
  { n: 'VII', name: 'The city of Ases', key: 'remote from sight; the serpent Rerek, backbone seven cubits', paint: 'green' },
  { n: 'VIII', name: 'Ha-hetep', key: 'great and mighty one of the canal; the roarings are mighty', paint: 'green' },
  { n: 'IX', name: 'The city Akesi', key: 'hidden from the gods; the opening is of fire; the god in his egg', paint: 'yellow' },
  { n: 'X', name: 'The city of the gods Qahu', key: 'a man with a knife in each hand, a serpent above', paint: 'yellow' },
  { n: 'XI', name: 'The city of Atu', key: 'a jackal-headed god with a knife; the Thigh of the Lake; a ladder to heaven', paint: 'green' },
  { n: 'XII', name: 'Unt, at the head of Re-stau', key: 'a blazing fire; the uraei (four snakes, R&N); stars that never fail', paint: 'green' },
  { n: 'XIII', name: 'Uart ent mu', key: 'thy waters are of fire; the stream is filled with reeds; the hippopotamus Hebetch-re-f', paint: 'green' },
  { n: 'XIV', name: 'Aat of Kher-aba', key: 'which turneth back Hap at Tattu; a range of mountains; the double qerti of Abu', paint: 'yellow' }
];
const CAPTIONS150 = ['Sekhet-Aarru', 'The brow of fire', 'Mountain, exceedingly high', 'Aat of the Khus', 'Ammehet', 'Asset', 'Ha-sert', 'The brow of the gods Qahu', 'Atu', 'Unt', 'The brow of the waters', 'Aat of Kher-aba', 'Stream of the Lake of flame', 'Akesi', 'The beautiful Amentet'];
function buildAats() {
  const g = new THREE.Group(), y = D, z0 = -500, W0 = 240, D0 = 150;
  const serpent = (x, y, z, len, ry = 0, r = 0.9) => { const pts = []; for (let i = 0; i <= 24; i++) pts.push(new THREE.Vector3(-len / 2 + i * len / 24, y + r + Math.sin(i * 0.9) * r * 0.6, z + Math.cos(i * 0.9) * r * 1.6)); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, r, 6), M.figureDark); m.position.x = x; m.rotation.y = ry; return m; };
  const enclosure = (x, w, d, h, tint, oval) => {
    const e = grp(x, y, z0);
    if (oval) { for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, b = (i + 1) / 40 * Math.PI * 2; const p = [w / 2 * Math.cos(a), d / 2 * Math.sin(a)], q = [w / 2 * Math.cos(b), d / 2 * Math.sin(b)]; const seg = box(Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.3, h, 1.2, M.wall, (p[0] + q[0]) / 2, 0, (p[1] + q[1]) / 2); seg.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]); e.add(seg); } const f = new THREE.Mesh(new THREE.CircleGeometry(1, 48), tint); f.scale.set(w / 2, d / 2, 1); f.rotation.x = -Math.PI / 2; f.position.y = 0.3; e.add(f); }
    else { e.add(box(w, h, 1.2, M.wall, 0, 0, -d / 2), box(w, h, 1.2, M.wall, 0, 0, d / 2), box(1.2, h, d, M.wall, -w / 2, 0, 0), box(1.2, h, d, M.wall, w / 2, 0, 0)); const f = new THREE.Mesh(new THREE.PlaneGeometry(w - 2, d - 2), tint); f.rotation.x = -Math.PI / 2; f.position.y = 0.3; e.add(f); }
    return e;
  };
  const flames = (e, n, w, d, s = 1.6) => { for (let i = 0; i < n; i++) e.add(flame(s + (i % 3) * 0.4, 3 + (i % 4) * 1.2, -w / 2 + 6 + (i * 37) % (w - 12), 0.4, -d / 2 + 6 + (i * 53) % (d - 12))); };
  const stand = (e, x, z, h, n, mat) => { const geo = new THREE.BoxGeometry(0.16, h, 0.16); geo.translate(0, h / 2, 0); const im = new THREE.InstancedMesh(geo, mat, n); const m4 = new THREE.Matrix4(); for (let i = 0; i < n; i++) { m4.makeTranslation(x + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 24, 0.4, z + (Math.sin(i * 7.233) * 9631.13 % 1) * 10); im.setMatrixAt(i, m4); } im.userData.keep = true; e.add(im); };
  AATS.forEach((a, i) => {
    const x = -2210 + i * 340, tint = a.paint === 'yellow' ? M.tintYellow : M.tintGreen;
    const big = i === 3, w = big ? 300 : W0, d = big ? 230 : D0;
    const e = enclosure(x, w, d, i === 1 ? 10 : 6, tint, i === 8); g.add(e);
    const E = grp(x, y, z0); g.add(E);
    switch (i) {
      case 0: for (let k = 0; k < 4; k++) E.add(figure({ head: 'man', pose: 'sit', h: 3.6, item: 'sceptre', x: -40 + k * 12, y: 0.4, z: 20, ry: Math.PI }), table(-40 + k * 12, 0.4, 14)); break;
      case 1: {
        e.children.slice(0, 4).forEach(wall => { wall.material = M.metal; });
        E.add(box(2, 10, 1.4, M.bronze, -5, 0.4, 0), box(2, 10, 1.4, M.bronze, 5, 0.4, 0), box(12, 1.6, 1.4, M.bronze, 0, 10.4, 0));          // the door in the middle
        E.add(box(70, 0.5, 30, M.water, 0, 0.3, 55), box(220, 0.5, 14, M.water, 0, 0.3, -60));                                                   // lake south, canal north
        stand(E, -100, -30, 5, 160, M.grain); stand(E, -70, -30, 7, 160, M.grain); stand(E, -40, -30, 7, 160, M.green);                           // wheat 5 (Budge), wheat 7 (R&N), barley 7
        for (let k = 0; k < 2; k++) E.add(figure({ head: 'man', h: 9, item: 'knife', x: 20 + k * 10, y: 0.4, z: -30, ry: -Math.PI / 2 })); E.add(figure({ head: 'hawk', h: 9, item: 'disk', x: 44, y: 0.4, z: -30, ry: Math.PI / 2 }));
        for (const s of [-1, 1]) { E.add(cyl(0.7, 1, 9, M.bronzeDark, 80 + s * 12, 0.4, 20), sph(6, M.green, 80 + s * 12, 12, 20, 7)); } E.add(boat(10, M.gold, 80, 0.6, 20));
        break;
      }
      case 2: flames(E, 22, w, d); for (let k = 0; k < 5; k++) E.add(figure({ head: 'man', h: 4, x: -60 + k * 30, y: 0.4, z: 40 })); break;
      case 3: {
        E.add(cone(95, 70, M.rock, 0, 0.4, 0, 9)); E.add(cone(70, 50, M.rock, 60, 0.4, -40, 7));                                                  // the mountain, doubly high: height invented
        const alt = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(300, 1, 10)), M.outline); alt.position.set(0, 1.2, 0); alt.userData.keep = true; E.add(alt);   // R&N: 300 by 10
        E.add(serpent(0, 44, 10, 70, 0.3, 1.4));
        break;
      }
      case 4: for (let k = 0; k < 3; k++) E.add(figure({ head: 'man', h: 16, item: 'knife', x: -50 + k * 50, y: 0.4, z: 0, ry: Math.PI / 2 })); break;   // legs 1.5/3.5 of 16 = 6.9 cubits: the text's seven-cubit thighs
      case 5: { E.add(box(60, 0.5, 40, M.water, 0, 0.3, 0)); const fish = sph(10, M.figureDark, 0, 2, 0, 8); fish.scale.set(2.2, 0.6, 0.9); E.add(fish, cone(5, 10, M.figureDark, -26, 0.4, 0, 4)); for (let k = 0; k < 3; k++) E.add(figure({ head: k ? 'man' : 'jackal', h: 4, item: 'sceptre', x: 50 + k * 12, y: 0.4, z: -40 })); break; }
      case 6: flames(E, 18, w, d); E.add(serpent(0, 0.4, 20, 7, 0, 0.7)); break;
      case 7: E.add(box(w - 8, 0.5, 26, M.water, 0, 0.3, 0)); for (let k = 0; k < 8; k++) E.add(flame(1, 2 + (k % 3), -100 + k * 28, 0.5, 0)); E.add(figure({ head: 'man', h: 5, item: 'staff', x: 0, y: 0.4, z: 30, ry: Math.PI }), figure({ head: 'hawk', h: 2.4, x: 60, y: 0.4, z: 30 })); break;
      case 8: { for (let k = 0; k < 10; k++) E.add(flame(1.6, 4 + (k % 3), -w / 2 + 2 + k * 2, 0.4, -14 + k * 3)); const egg = sph(9, M.gold, 20, 9, 0, 10); egg.scale.set(0.8, 1.1, 0.8); E.add(egg); E.add(animal(14, 4, M.figureDark, -w / 2 - 8, 0.4, 0, 0, 'cow')); break; }
      case 9: { const f = figure({ head: 'man', h: 5, item: 'knife', x: -20, y: 0.4, z: 0 }); f.add(box(0.14, 1.3, 0.3, M.white, -0.7, 3.2, 0.3).rotateZ(0.5)); E.add(f, serpent(-20, 7, 0, 8, 0, 0.6)); for (let k = 0; k < 4; k++) E.add(figure({ head: 'man', h: 4, item: 'sceptre', x: 30 + k * 14, y: 0.4, z: 30 })); break; }
      case 10: { E.add(figure({ head: 'jackal', h: 5, item: 'knife', x: -70, y: 0.4, z: 0, ry: Math.PI / 2 }), box(40, 0.5, 30, M.water, 20, 0.3, 40)); E.add(box(2, 12, 1.4, M.gold, 60, 0.4, -5), box(2, 12, 1.4, M.gold, 60, 0.4, 5), box(2, 1.4, 12, M.gold, 60, 12.4, 0)); const lad = grp(-20, 0.4, -40); lad.rotation.z = -0.15; for (const s of [-1.2, 1.2]) lad.add(box(0.5, 60, 0.5, M.gold, s, 0, 0)); for (let k = 0; k < 12; k++) lad.add(box(2.6, 0.3, 0.3, M.gold, 0, 2 + k * 5, 0)); E.add(lad); break; }
      case 11: flames(E, 16, w, d); for (let k = 0; k < 4; k++) E.add(cone(1.2, 5, M.gold, -45 + k * 30, 0.4, -40, 6), sph(1, M.gold, -45 + k * 30, 6, -40)); break;
      case 12: { E.add(box(w - 8, 0.5, 40, M.ember, 0, 0.3, 0)); for (let k = 0; k < 10; k++) E.add(flame(1.4, 3 + (k % 3), -100 + k * 22, 0.6, -8 + (k % 2) * 16)); stand(E, -60, 24, 3, 120, M.green); E.add(figure({ head: 'man', h: 5, item: 'staff', x: 80, y: 0.4, z: 40 }), animal(8, 4.5, M.figure, -70, 0.4, 50, 0, 'hippo')); break; }
      case 13: { for (let k = 0; k < 5; k++) E.add(cone(22, 18 + (k % 2) * 10, M.rock, -90 + k * 45, 0.4, -40, 6)); E.add(box(w - 8, 0.5, 14, M.water, 0, 0.3, 30)); for (const s of [-1, 1]) E.add(cyl(5, 5, 3, M.bronzeDark, 95 + s * 12, 0.4, 30, 16)); E.add(serpent(95, 3.4, 30, 20, 0, 0.7));
        [['man', 'staff'], ['jackal', null], ['hawk', 'disk'], ['lion', null], ['man', 'raised'], ['man', 'whitecrown']].forEach(([h, it], k) => E.add(figure({ head: h, h: 4, item: it, x: -100 + k * 18, y: 0.4, z: 55 }))); E.add(animal(6, 3.5, M.figure, 20, 0.4, 55, 0, 'hippo'), animal(8, 2, M.figureDark, 40, 0.4, 55, 0, 'cow')); break; }
    }
    g.add(label(`${a.n}. ${a.name}`, x, y + 36, z0, 'fl', 'aats', `${a.key} · painted ${a.paint}`));
  });
  // Spell 150: fifteen captions in Nu's order, four serpents at the corners
  CAPTIONS150.forEach((c, k) => { const x = -2300 + k * 330; g.add(box(3, 6, 3, M.bronze, x, y, -640)); });
  for (const [sx, sz] of [[-2400, -660], [2400, -660], [-2400, -340], [2400, -340]]) g.add(serpent(sx, y + 0.4, sz, 16, 0, 1.2));
  g.add(label('The fourteen Aats of the Papyrus of Nu: Spell 149, a witness beside Ani', 0, y + 150, z0, 'fl big', 'aats', 'placed in this band by editorial choice'));
  g.add(label('Spell 150: fifteen captions in Nu\'s order, and the four serpents the editors read as the cardinal points', 0, y + 14, -660, 'fl', 'aats', CAPTIONS150.join(' · ')));
  return merged(g, 'aats');
}

[buildTerrain, buildThebes, buildWest, buildTomb, buildRosetau, buildPools, buildSycamore, buildArits, buildPylons, buildCouncils, buildHall, buildThrone, buildLake, buildField, buildSkyBank, buildEast, buildBoat, buildSky, buildAats].forEach(fn => world.add(fn()));

// lights: a dim sky, a low western sun on the land of the living, and a warm glow along the Duat so the model reads
scene.add(new THREE.HemisphereLight(0x5a6080, 0x2a2016, 1.5));
scene.add(new THREE.AmbientLight(0x6a5a44, 0.9));
const sun = new THREE.DirectionalLight(0xffd9a0, 2.2); sun.position.set(-2000, 900, 1400); scene.add(sun);
const fill = new THREE.DirectionalLight(0x8090b0, 0.7); fill.position.set(1500, 600, -1200); scene.add(fill);
for (const x of [-2300, -1700, -900, 120, 1300, 2300]) { const l = new THREE.PointLight(0xd9a860, 60000, 1400, 1.7); l.position.set(x, -60, 120); scene.add(l); }

// place labels
const placeLabels = {};
for (const p of L.places) { const w = W.places[p.id]; const el = document.createElement('button'); el.className = 'pl'; el.textContent = w.label || p.name; el.title = p.name; el.onclick = () => focusPlace(p.id); const o = new CSS2DObject(el); o.position.set(w.at[0], w.at[1] + (w.pill || 20), w.at[2]); scene.add(o); placeLabels[p.id] = o; }

// ---------- camera: overview and fly-to ----------
const overview = { at: new THREE.Vector3(300, -120, 0), from: new THREE.Vector3(600, 2600, 3800) };
let flight = null, current = null, sectionManual = false;
function flyTo(at, dist, dir) {
  const target = new THREE.Vector3(...at);
  const d = (dir || camera.position.clone().sub(controls.target)).normalize(); if (d.y < 0.18) d.y = 0.18; d.normalize();
  const pos = target.clone().add(d.multiplyScalar(dist));
  if (target.y < S - 1 && pos.y < D + 12) pos.y = D + 12;          // never put the eye under the Duat floor
  if (reduced) { camera.position.copy(pos); controls.target.copy(target); controls.update(); return; }
  flight = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), ms: 1400 };
}
function setSection(open) { const slab = world.getObjectByName('slab'); const m = slab.material; m.opacity = open ? 0.42 : 1; m.transparent = open; m.depthWrite = !open; m.needsUpdate = true; const b = $('section'); b.classList.toggle('on', open); b.textContent = open ? 'Section: open' : 'Section: closed'; }
function focusPlace(id, opts = {}) {
  const w = W.places[id]; if (!w) return;
  current = id; flyTo(w.at, w.dist, opts.dir || (w.dir && new THREE.Vector3(...w.dir)));
  if (!sectionManual) setSection(id !== 'thebes');
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === id));
  for (const o of featureLabels) o.element.classList.toggle('show', o.element.dataset.place === id);
  for (const [pid, o] of Object.entries(placeLabels)) o.element.classList.toggle('dim', pid === id);
  showPlace(id);
  if (history.replaceState) history.replaceState(null, '', '?place=' + id);
}
function focusOverview() {
  current = null; flyTo([overview.at.x, overview.at.y, overview.at.z], overview.from.distanceTo(overview.at), overview.from.clone().sub(overview.at));
  if (!sectionManual) setSection(true);
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === 'overview'));
  for (const o of featureLabels) o.element.classList.remove('show');
  for (const o of Object.values(placeLabels)) o.element.classList.remove('dim');
  showOverview();
  if (history.replaceState) history.replaceState(null, '', location.pathname);
}

// ---------- the evidence panel ----------
const panel = $('panel'), KIND = { source: 'Source text', scene: 'Vignette, described', editorial: 'Editorial', invention: 'Invention', gap: 'Gap', witness: 'Witness: Nu', cognate: 'Cognate text' };
const EDITIONS = { 'B1898-II': 'Budge 1898, vol. II, p. ', 'RN1904': 'Renouf and Naville 1904, p. ' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function crop(block) {
  const tile = G && G.tiles.find(t => t.n === block.n), r = block.rects && block.rects[0]; if (!tile || !r) return '';
  const cw = (r[1] - r[0]) * tile.w, ch = (r[3] - r[2]) * G.bandH, Wd = 320, sc = Wd / cw, H = Math.min(200, Math.round(ch * sc));
  // drawn as a background so no host stylesheet can resize it; the sheet is scaled so the cited rectangle fills the card
  return `<a class="crop" href="../#b=${block.id}" target="_blank" rel="noopener" role="img" aria-label="Facsimile detail: ${esc(block.title)}" title="Open this passage in the study" style="height:${H}px;background-image:url('../assets/scans/ani-${String(block.n).padStart(2, '0')}.webp');background-size:${Math.round(tile.w * sc)}px auto;background-position:${-Math.round(r[0] * tile.w * sc)}px ${-Math.round((tile.top + r[2] * G.bandH) * sc)}px"></a>`;
}
function citeHtml(c) {
  if (c.b) { const b = blockById[c.b]; return b ? `<a href="../#b=${c.b}" target="_blank" rel="noopener">Sheet ${b.n} · ${esc(b.title)}</a>` : `<span>block ${esc(c.b)}</span>`; }
  if (c.bp) { const [k, i] = c.bp.split(':'); const e = BU[k]; const para = e && e.paras[+i]; return `<details><summary>Budge 1895, plate${k.includes('-') ? 's' : ''} ${esc(k)} · vignette described</summary><p>${esc(para || '(paragraph not found)')}</p></details>`; }
  if (c.e) { const [ed, pg] = c.e.split(':'); return `<span>${esc(EDITIONS[ed] || ed)}${esc(pg)}</span>`; }
  return '';
}
function showPlace(id) {
  const p = placeById[id]; if (!p) return;
  let html = `<div class="ph"><span class="eyebrow">Place ${p.route} of ${L.places.length} · <a class="lg" href="ledger.html?place=${p.id}" target="_blank" rel="noopener">ledger entry</a></span><h2>${esc(p.name)}</h2><p class="sum">${esc(p.summary)}</p></div><ol class="feats">`;
  for (const f of p.features) {
    let cites = ''; let firstCrop = '';
    for (const c of (f.cite || [])) { cites += `<li>${citeHtml(c)}</li>`; if (!firstCrop && c.b && blockById[c.b]) firstCrop = crop(blockById[c.b]); }
    html += `<li class="feat k-${f.kind}"><div class="fh"><span class="badge">${KIND[f.kind]}</span><span class="what">${esc(f.what)}</span></div>${f.status ? `<div class="st st-${f.status}">${esc(f.status)}${f.alt ? ' · also read: ' + esc(f.alt) : ''}</div>` : ''}${f.dim ? `<div class="dim">${f.dim.value} ${esc(f.dim.unit)}${f.dim.note ? ' · ' + esc(f.dim.note) : ''}</div>` : ''}<div class="model">${esc(f.model)}</div>${firstCrop}${cites ? `<ul class="cites">${cites}</ul>` : ''}${f.src ? `<div class="srcids">Statements ${f.src.map(esc).join(', ')} · <a href="sources/G1-review.md" target="_blank" rel="noopener">admission record</a></div>` : ''}</li>`;
  }
  html += '</ol>';
  panel.innerHTML = html; panel.scrollTop = 0; panel.classList.add('open'); $('panelToggle').textContent = 'Hide evidence'; applyView();
}
function showOverview() {
  const kinds = {}; L.places.forEach(p => p.features.forEach(f => kinds[f.kind] = (kinds[f.kind] || 0) + 1));
  panel.innerHTML = `<div class="ph"><span class="eyebrow">An interpretive model</span><h2>The world of the Papyrus of Ani</h2><p class="sum">Everything drawn here is justified in the ledger by a line of Budge's 1895 text or his description of a vignette, or is labelled as our arrangement, our invention, or a gap. The unit is the royal cubit, because the text's own dimensions are in cubits.</p></div>
  <ol class="feats"><li class="feat k-source"><div class="fh"><span class="badge">Source text</span><span class="what">${kinds.source || 0} features rest on Budge's translation</span></div></li>
  <li class="feat k-scene"><div class="fh"><span class="badge">Vignette, described</span><span class="what">${kinds.scene || 0} on his description of a picture in the roll</span></div></li>
  <li class="feat k-editorial"><div class="fh"><span class="badge">Editorial</span><span class="what">${kinds.editorial || 0} are our arrangement</span></div></li>
  <li class="feat k-invention"><div class="fh"><span class="badge">Invention</span><span class="what">${kinds.invention || 0} are ours, labelled, so the model can be built</span></div></li>
  <li class="feat k-witness"><div class="fh"><span class="badge">Witness: Nu</span><span class="what">${kinds.witness || 0} come from the Papyrus of Nu through the sourcing workstream, each with its status and its other reading</span></div></li>
  <li class="feat k-gap"><div class="fh"><span class="badge">Gap</span><span class="what">${kinds.gap || 0} are gaps the papyrus does not fill; they go to the sourcing workstream</span></div></li></ol>
  <p class="sum">Select a place, or begin the journey. Each feature links to the passage in the study and shows the facsimile detail it rests on.</p>`;
  panel.classList.add('open'); $('panelToggle').textContent = 'Hide evidence'; applyView();
}
// with the evidence panel open, centre the view in the space left of it
function applyView() {
  const w = innerWidth, h = innerHeight, open = panel.classList.contains('open') && w > 760, P = open ? panel.offsetWidth + 28 : 0;
  if (P) { camera.aspect = (w + P) / h; camera.setViewOffset(w + P, h, P, 0, w, h); } else { camera.clearViewOffset(); camera.aspect = w / h; }
  camera.updateProjectionMatrix();
}

// ---------- chips, journey, controls ----------
const chipBar = $('chips');
const mkChip = (id, text, sep) => { const b = document.createElement('button'); b.className = 'chip' + (sep ? ' sep' : ''); b.dataset.id = id; b.textContent = text; chipBar.appendChild(b); return b; };
mkChip('overview', 'Overview').onclick = focusOverview;
L.places.forEach((p, i) => { const c = mkChip(p.id, W.places[p.id].label || p.name, i === 0 || p.id === 'arits' || p.id === 'hall' || p.id === 'fields'); c.title = p.name; c.onclick = () => { journey.off(); focusPlace(p.id); }; });
const evChip = mkChip('evidence', 'Hide evidence', true); evChip.id = 'panelToggle';
// the panel sits below however many rows the chips take
function layoutPanel() { panel.style.top = (chipBar.offsetTop + chipBar.offsetHeight + 10) + 'px'; }
new ResizeObserver(layoutPanel).observe(chipBar); layoutPanel();
const journey = { i: -1, on: false, off() { this.on = false; this.i = -1; $('journey').classList.remove('on'); $('jbtn').textContent = 'Begin the journey'; },
  start() { this.on = true; this.i = 0; $('journey').classList.add('on'); $('jbtn').textContent = 'End the journey'; this.go(); },
  go() { const id = W.route[this.i]; focusPlace(id); $('jpos').textContent = `${this.i + 1} of ${W.route.length}`; },
  next() { if (!this.on) return this.start(); this.i = (this.i + 1) % W.route.length; this.go(); }, prev() { if (!this.on) return this.start(); this.i = (this.i - 1 + W.route.length) % W.route.length; this.go(); } };
$('jbtn').onclick = () => journey.on ? (journey.off(), focusOverview()) : journey.start();
$('jnext').onclick = () => journey.next(); $('jprev').onclick = () => journey.prev();
$('panelToggle').onclick = () => { const open = panel.classList.toggle('open'); $('panelToggle').textContent = open ? 'Hide evidence' : 'Show evidence'; applyView(); };
$('section').onclick = () => { sectionManual = true; setSection(world.getObjectByName('slab').material.opacity > 0.6); };
$('labelsBtn').onclick = e => { const hidden = $('labels').classList.toggle('hidden'); e.currentTarget.classList.toggle('on', !hidden); e.currentTarget.textContent = hidden ? 'Labels off' : 'Labels on'; };
$('fs').onclick = () => { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(() => {}); };
if (window.self !== window.top) $('fs').style.display = 'none';
addEventListener('keydown', e => { if (e.target.closest('input,textarea')) return; if (e.key === 'ArrowRight') journey.next(); if (e.key === 'ArrowLeft') journey.prev(); if (e.key === 'Escape') { journey.off(); focusOverview(); } });

// click on the model: fly to the place it belongs to
const ray = new THREE.Raycaster(); let downAt = null;
canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return; downAt = null;
  const m = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(m, camera);
  const hits = ray.intersectObjects(world.children, true); for (const h of hits) { let o = h.object; while (o && !o.userData.place) o = o.parent; if (o && o.userData.place && o.userData.place !== 'duat') { journey.off(); focusPlace(o.userData.place); return; } }
});

// ---------- loop ----------
const flames = []; world.traverse(o => { if (o.userData.flame) flames.push(o); });
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); labelRenderer.setSize(w, h); applyView(); }
addEventListener('resize', resize); resize();
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
let last = 0;
function tick(t) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.1, (t - last) / 1000 || 0.016); last = t;
  if (flight) { const k = Math.min(1, (t - flight.start) / flight.ms), e = ease(k); camera.position.lerpVectors(flight.p0, flight.p1, e); controls.target.lerpVectors(flight.t0, flight.t1, e); if (k >= 1) flight = null; }
  controls.update();
  if (!reduced) for (let i = 0; i < flames.length; i++) { const f = flames[i]; f.scale.y = 0.85 + 0.3 * Math.sin(t * 0.012 + i * 1.7); }
  const dist = camera.position.distanceTo(controls.target); camera.near = Math.max(0.5, dist * 0.004); camera.updateProjectionMatrix();
  renderer.render(scene, camera); labelRenderer.render(scene, camera);
}
// start
camera.position.copy(overview.from); controls.target.copy(overview.at); controls.update();
const q = new URLSearchParams(location.search).get('place');
if (q && W.places[q]) { const w = W.places[q]; const d = new THREE.Vector3(...(w.dir || [0.35, 0.55, 1])).normalize(); camera.position.set(w.at[0] + d.x * w.dist, Math.max(w.at[1] + d.y * w.dist, w.at[1] < S - 1 ? D + 12 : -1e9), w.at[2] + d.z * w.dist); controls.target.set(...w.at); controls.update(); focusPlace(q); flight = null; }
else showOverview();
requestAnimationFrame(tick);
setTimeout(() => { const r = renderer.info.render; $('stats').textContent = `${r.calls} calls · ${r.triangles} triangles`; console.log('world render:', r.calls, 'draw calls,', r.triangles, 'triangles,', featureLabels.length, 'feature labels'); }, 1500);
