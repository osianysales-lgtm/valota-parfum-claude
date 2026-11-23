import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { drawMain, drawRival, drawAmbient, PANEL_T } from './panels.js';
import ROTEIRO from '/projeto/roteiro.js';
import { TW as QTW, TH as QTH } from './cartoes.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
const QV = { blender: ROTEIRO };

const W = 1080, H = 1920, FPS = 30;
const DURATION = 44.0;
window.DURATION = DURATION;

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const win = (t, a, b, f = 0.22) => smooth(a - f * 0.3, a + f * 0.7, t) * (1 - smooth(b - f * 0.3, b + f * 0.7, t));
const back = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(11);
const blink = (t, ph) => { const p = (t + ph) % 3.3; return p < 0.13 ? 0.12 : 1; };

// ---------- subtitles ----------
const SUBS = [];
const HERO_TALK = [[0, 2.5], [2.6, 5.12], [6.4, 7.85], [7.95, 10.85], [10.95, 12.92], [14.5, 17.3], [17.35, 18.46], [22.95, 23.55], [30.1, 32.56], [33.65, 35.72], [37.75, 39.88], [40.25, 42.6]];
const subEl = document.getElementById('sub');
const style = document.createElement('style');
style.textContent = '#sub b{color:#ffd166;font-weight:800} #sub.c b{color:#fff}';
document.head.appendChild(style);

// ---------- renderer ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
{
  const gl = renderer.getContext();
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  window.gpuInfo = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06050e);
scene.fog = new THREE.FogExp2(0x0b0820, 0.011);
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 400);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.2;

const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.42, 0.6, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- materials ----------
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.88, metalness: 0, ...o });
const glow = (color, o = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o });
function mesh(geo, m, x = 0, y = 0, z = 0, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; if (parent) parent.add(o); return o; }

// ---------- backdrop ----------
{
  // stars
  for (const [n, size, op] of [[1500, 2.2, 0.75], [260, 3.6, 0.95]]) {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - 0.5) * 150; pos[i * 3 + 1] = -45 + rnd() * 100; pos[i * 3 + 2] = -70 - rnd() * 60; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdcd6ff, size, sizeAttenuation: false, transparent: true, opacity: op, fog: false, depthWrite: false }));
    scene.add(p);
  }
  // planet
  const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(7, 2), new THREE.MeshStandardMaterial({ color: 0x4a2f8f, flatShading: true, roughness: 1, fog: false, emissive: 0x1a0c40, emissiveIntensity: 0.6 }));
  pl.position.set(-17, 26, -110); scene.add(pl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(11, 0.35, 4, 48), new THREE.MeshBasicMaterial({ color: 0x8a66d8, fog: false, transparent: true, opacity: 0.55 }));
  ring.position.copy(pl.position); ring.rotation.set(1.25, 0.2, 0.3); scene.add(ring);
  // horizon glow
  const c = document.createElement('canvas'); c.width = 8; c.height = 256; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, 'rgba(60,20,120,0)'); gr.addColorStop(0.45, 'rgba(150,40,160,0.35)'); gr.addColorStop(0.62, 'rgba(255,90,150,0.75)'); gr.addColorStop(0.7, 'rgba(255,150,90,0.55)'); gr.addColorStop(0.8, 'rgba(60,20,90,0.15)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 8, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const hz = new THREE.Mesh(new THREE.PlaneGeometry(320, 46), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, depthWrite: false, opacity: 0.5 }));
  hz.position.set(0, 1.5, -100); scene.add(hz);
}

// city skyline
const cityMats = [];
{
  const palette = ['#ff5fb0', '#63e6ff', '#ffc36b', '#a98bff', '#ff8a5c'];
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = 96; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#0a0916'; x.fillRect(0, 0, 96, 256);
    const col = palette[k % palette.length];
    for (let r = 0; r < 26; r++) for (let q = 0; q < 8; q++) {
      if (rnd() < 0.5) { x.fillStyle = rnd() < 0.75 ? col : palette[Math.floor(rnd() * palette.length)]; x.globalAlpha = 0.55 + rnd() * 0.45; x.fillRect(6 + q * 11, 6 + r * 9.6, 7, 5); }
    }
    x.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter;
    cityMats.push(new THREE.MeshBasicMaterial({ map: tex }));
  }
  const neon = [glow(0xff4fa8), glow(0x5fe0ff), glow(0xa98bff)];
  for (let i = 0; i < 46; i++) {
    const w = 4 + rnd() * 6, h = 6 + rnd() * 11, d = 4 + rnd() * 5;
    const tx = (rnd() - 0.5) * 190, tz = -85 - rnd() * 40;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cityMats[i % 4]);
    b.position.set(tx, -9 + h / 2, tz); scene.add(b);
    if (rnd() < 0.55) { const s = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.14, d + 0.1), neon[i % 3]); s.position.set(tx, -9 + h + 0.07, tz); scene.add(s); }
    if (rnd() < 0.25) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1), neon[(i + 1) % 3]); a.position.set(tx, -9 + h + 1.5, tz); scene.add(a); }
  }
}

// platform
{
  const slab = new THREE.Mesh(new THREE.BoxGeometry(70, 0.3, 10.7), new THREE.MeshStandardMaterial({ color: 0x0e0c1f, roughness: 0.8, metalness: 0.1 }));
  slab.position.set(0, -0.165, -2.15); slab.receiveShadow = true; scene.add(slab);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(70, 0.05, 0.05), glow(0x9a7cff)); edge.position.set(0, -0.01, 3.2); scene.add(edge);
  const edge2 = new THREE.Mesh(new THREE.BoxGeometry(70, 0.02, 0.02), glow(0x5a3fd0)); edge2.position.set(0, -0.3, 3.2); scene.add(edge2);
  const mirror = new Reflector(new THREE.PlaneGeometry(70, 10.7), { textureWidth: 540, textureHeight: 960, color: 0x8f88b8, clipBias: 0.003 });
  mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, 0, -2.15); scene.add(mirror);
  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(70, 10.7), new THREE.MeshStandardMaterial({ color: 0x0b0919, roughness: 0.62, metalness: 0, transparent: true, opacity: 0.36, depthWrite: false, envMapIntensity: 0.3 }));
  sheen.rotation.x = -Math.PI / 2; sheen.position.set(0, 0.004, -2.15); sheen.receiveShadow = true; scene.add(sheen);
}

// lights
scene.add(new THREE.HemisphereLight(0x7a6cff, 0x0a0614, 0.4));
const key = new THREE.DirectionalLight(0xffeef6, 1.55); key.position.set(-3.5, 5.5, 6.5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -2, near: 1, far: 20 }); key.shadow.bias = -0.0004; key.shadow.radius = 5;
scene.add(key);
const rim = new THREE.DirectionalLight(0xff3fa4, 3.0); rim.position.set(4, 3.5, -6); scene.add(rim);
const rim2 = new THREE.DirectionalLight(0x4fd8ff, 1.9); rim2.position.set(-5, 3, -5); scene.add(rim2);
const panelLight = new THREE.PointLight(0x7fd6ff, 5, 9, 1.5); panelLight.position.set(0.05, 2.9, -0.45); scene.add(panelLight);
const spot = new THREE.SpotLight(0xd6c8ff, 20, 15, 0.42, 0.8, 1.4); spot.position.set(0.05, 7.5, 2.8); spot.target.position.set(0.05, 0.7, 0); scene.add(spot, spot.target);
const PANEL_COL = [0x5fe0ff, 0xff4fa8, 0x5fe0ff, 0xffc24a, 0xff8a5c, 0xff8a5c, 0xff8a5c, 0xff4fa8, 0xffc24a, 0xff4fa8];
const edgeLight = new THREE.PointLight(0x8a6cff, 3.5, 5, 1.8); edgeLight.position.set(0, 0.25, 1.9); scene.add(edgeLight);
const coldLight = new THREE.PointLight(0x4a78ff, 0, 5, 1.6); coldLight.position.set(-1.7, 2.1, 0.8); scene.add(coldLight);

// ---------- characters ----------
function buildKid(o) {
  const g = new THREE.Group();
  const skin = mat(o.skin), hood = mat(o.hood), hoodD = mat(o.hoodD), pants = mat(o.pants), hair = mat(o.hair);
  const shoe = mat(0xd9d5ee, { emissive: 0x8a7cff, emissiveIntensity: 0.04 });
  mesh(new THREE.BoxGeometry(0.2, 0.52, 0.22), pants, -0.14, 0.38, 0, g);
  mesh(new THREE.BoxGeometry(0.2, 0.52, 0.22), pants, 0.14, 0.38, 0, g);
  mesh(new THREE.BoxGeometry(0.25, 0.14, 0.38), shoe, -0.14, 0.07, 0.06, g);
  mesh(new THREE.BoxGeometry(0.25, 0.14, 0.38), shoe, 0.14, 0.07, 0.06, g);
  const body = new THREE.Group(); body.position.y = 0.62; g.add(body);
  const torso = mesh(new THREE.CylinderGeometry(0.27, 0.35, 0.64, 7), hood, 0, 0.32, 0, body); torso.scale.z = 0.76;
  mesh(new THREE.BoxGeometry(0.32, 0.13, 0.03), hoodD, 0, 0.14, 0.255, body);
  mesh(new THREE.BoxGeometry(0.022, 0.17, 0.022), mat(o.string), -0.06, 0.47, 0.215, body);
  mesh(new THREE.BoxGeometry(0.022, 0.17, 0.022), mat(o.string), 0.06, 0.47, 0.215, body);
  const hb = mesh(new THREE.IcosahedronGeometry(0.24, 0), hoodD, 0, 0.63, -0.13, body); hb.scale.set(1.35, 0.7, 1);
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.36, 0.56, 0); body.add(a);
    mesh(new THREE.BoxGeometry(0.15, 0.46, 0.16), hood, 0, -0.23, 0, a);
    mesh(new THREE.IcosahedronGeometry(0.085, 0), skin, 0, -0.51, 0, a);
    arms.push(a);
  }
  const head = new THREE.Group(); head.position.set(0, 0.68, 0.02); body.add(head);
  const skull = mesh(new THREE.IcosahedronGeometry(0.42, 1), skin, 0, 0.38, 0, head); skull.scale.set(1, 0.95, 0.95);
  mesh(new THREE.IcosahedronGeometry(0.08, 0), skin, -0.4, 0.36, 0, head);
  mesh(new THREE.IcosahedronGeometry(0.08, 0), skin, 0.4, 0.36, 0, head);
  const cap = mesh(new THREE.IcosahedronGeometry(0.455, 1), hair, 0, 0.5, -0.05, head); cap.scale.set(1.03, 0.76, 1.03);
  for (let i = 0; i < 5; i++) {
    const f = mesh(new THREE.ConeGeometry(0.11, 0.24, 4), hair, -0.26 + i * 0.13, 0.6 - Math.abs(i - 2) * 0.012, 0.33 - Math.abs(i - 2) * 0.03, head);
    f.rotation.set(Math.PI + 0.35, 0.4 * (i - 2) * 0.3, o.messy ? (i % 2 ? 0.25 : -0.3) : 0.12 * (i - 2));
  }
  const eyes = [], brows = [];
  const eyeM = new THREE.MeshBasicMaterial({ color: 0x1a1220 }), hiM = new THREE.MeshBasicMaterial({ color: 0xc8c8d2 });
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * 0.15, 0.36, 0.378); head.add(e);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), eyeM); ball.scale.set(1, 1.3, 0.45); e.add(ball);
    const hi = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), hiM); hi.position.set(0.016, 0.03, 0.024); e.add(hi);
    eyes.push(e);
    const b = mesh(new THREE.BoxGeometry(0.15, 0.032, 0.03), hair, s * 0.15, 0.49, 0.385, head); b.castShadow = false; brows.push(b);
  }
  if (o.bags) for (const s of [-1, 1]) { const bg = mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), mat(0xb98a86), s * 0.15, 0.275, 0.392, head); bg.castShadow = false; }
  const nose = mesh(new THREE.ConeGeometry(0.035, 0.08, 4), mat(o.nose), 0, 0.3, 0.42, head); nose.rotation.x = Math.PI / 2;
  const mouthM = new THREE.MeshBasicMaterial({ color: 0x4a1826, side: THREE.DoubleSide });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.013, 4, 12, Math.PI), mouthM); mouth.rotation.z = Math.PI; mouth.position.set(0, 0.22, 0.4); head.add(mouth);
  const openM = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mouthM); openM.position.set(0, 0.2, 0.39); openM.scale.set(1, 0.01, 0.4); head.add(openM);
  if (o.headset) {
    const dk = mat(0x15131f, { roughness: 0.5 });
    const band = mesh(new THREE.TorusGeometry(0.47, 0.03, 6, 18, Math.PI), dk, 0, 0.4, -0.02, head);
    for (const s of [-1, 1]) {
      const cup = mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.09, 10), dk, s * 0.47, 0.38, -0.02, head); cup.rotation.z = Math.PI / 2;
      const rg = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 6, 16), glow(0x5fe0ff)); rg.position.set(s * 0.52, 0.38, -0.02); rg.rotation.y = Math.PI / 2; head.add(rg);
    }
    const mic = mesh(new THREE.BoxGeometry(0.02, 0.02, 0.32), dk, -0.45, 0.24, 0.16, head); mic.rotation.y = -0.35;
    mesh(new THREE.SphereGeometry(0.03, 8, 6), dk, -0.39, 0.24, 0.32, head);
  }
  return { g, body, head, armL: arms[0], armR: arms[1], eyes, brows, mouth, openM };
}
function poseKid(c, P, t, ph) {
  c.g.position.set(P.x, P.hop, P.z ?? 0); c.g.rotation.y = P.yaw;
  c.body.rotation.x = P.lean;
  c.head.rotation.set(P.hp, P.hy, P.hr);
  c.armL.rotation.set(P.aLx, 0, P.aLz); c.armR.rotation.set(P.aRx, 0, P.aRz);
  const bl = blink(t, ph);
  for (let i = 0; i < 2; i++) {
    c.eyes[i].scale.set(1, Math.max(0.1, P.eye * bl), 1);
    c.brows[i].position.y = 0.49 + P.brow; c.brows[i].rotation.z = (i ? -1 : 1) * P.browT;
  }
  const m = P.mouth; c.mouth.scale.set(1, Math.sign(m || 1) * Math.max(0.18, Math.abs(m)), 1);
  c.mouth.visible = P.open < 0.25; c.openM.visible = P.open >= 0.25; c.openM.scale.set(0.9, Math.max(0.01, P.open), 0.4);
}

const hero = buildKid({ skin: 0xf3bea6, nose: 0xe2a48e, hood: 0x1fa79c, hoodD: 0x178178, pants: 0x242a4c, hair: 0x2b1b22, string: 0xffffff, headset: true });
const rival = buildKid({ skin: 0xd9b3ad, nose: 0xc59b96, hood: 0x66739f, hoodD: 0x4d5880, pants: 0x1d2138, hair: 0x40342f, string: 0x9aa3c4, messy: true, bags: true, shoeGlow: 0.1 });
scene.add(hero.g, rival.g);

function buildBot() {
  const g = new THREE.Group();
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gx = gc.getContext('2d');
  const gg = gx.createRadialGradient(64, 64, 4, 64, 64, 86); gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.5, '#9a9a9a'); gg.addColorStop(1, '#1c1c1c'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(gc); glowTex.colorSpace = THREE.SRGBColorSpace;
  const coral = new THREE.MeshPhysicalMaterial({ color: 0xea744b, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.16, emissive: 0xff5a1c, emissiveMap: glowTex, emissiveIntensity: 0.6, envMapIntensity: 0.7 });
  const coralD = new THREE.MeshPhysicalMaterial({ color: 0xc9562f, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2, emissive: 0xff6a30, emissiveIntensity: 0.2 });
  const inner = new THREE.PointLight(0xff7a40, 3, 4.5, 1.6); g.add(inner);
  const body = mesh(new RoundedBoxGeometry(0.86, 0.74, 0.7, 4, 0.16), coral, 0, 0, 0, g);
  mesh(new RoundedBoxGeometry(0.62, 0.4, 0.06, 3, 0.03), new THREE.MeshStandardMaterial({ color: 0x24121c, roughness: 0.3 }), 0, 0.03, 0.335, g);
  const eyeM = glow(0xfff0dc);
  const eyeL = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.19, 0.03, 2, 0.015), eyeM); eyeL.position.set(-0.15, 0.04, 0.375); g.add(eyeL);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.15; g.add(eyeR);
  mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 6), coralD, 0, 0.48, 0, g);
  const bulbM = glow(0xffe2c2); const bulb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), bulbM); bulb.position.set(0, 0.63, 0); g.add(bulb);
  mesh(new RoundedBoxGeometry(0.12, 0.28, 0.32, 2, 0.05), coralD, -0.49, -0.05, 0, g);
  mesh(new RoundedBoxGeometry(0.12, 0.28, 0.32, 2, 0.05), coralD, 0.49, -0.05, 0, g);
  mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x2a1a22, roughness: 0.5 }), 0, -0.42, 0, g);
  const thr = new THREE.Mesh(new THREE.CircleGeometry(0.19, 20), glow(0xffb48c)); thr.rotation.x = Math.PI / 2; thr.position.y = -0.475; g.add(thr);
  const tl = new THREE.PointLight(0xff9460, 2.2, 2.2, 1.8); tl.position.y = -0.6; g.add(tl);
  const rings = [];
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.006, 6, 48), glow(0xffe2c2, { transparent: true, opacity: 0, depthWrite: false })); r.position.z = 0.1; g.add(r); rings.push(r); }
  return { g, body, eyeL, eyeR, bulb, bulbM, rings, thr, coral, coralD, inner };
}
const bot = buildBot(); scene.add(bot.g);
const halo = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,170,110,0.6)'); g.addColorStop(0.4, 'rgba(255,120,70,0.2)'); g.addColorStop(1, 'rgba(255,90,50,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, fog: false }));
  sp.scale.set(2.0, 2.0, 1); scene.add(sp); return sp; })();

// divider beam
const divider = new THREE.Group(); divider.position.set(-1.02, 0, 0.3); scene.add(divider);
{ const g1 = new THREE.BoxGeometry(0.035, 1, 0.035); g1.translate(0, 0.5, 0); divider.add(new THREE.Mesh(g1, glow(0xd9ccff)));
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 3.2), glow(0xb9a4ff)); fl.position.set(0, 0.006, -0.4); divider.add(fl); divider.userData.fl = fl; divider.userData.beam = divider.children[0]; }

// ---------- holo panels ----------
function makePanel(wPx, hPx, wWorld) {
  const c = document.createElement('canvas'); c.width = wPx; c.height = hPx;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, fog: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(wWorld, wWorld * hPx / wPx), m);
  return { c, ctx: c.getContext('2d'), tex, m, p };
}
const mainP = makePanel(1000, 700, 2.55); mainP.p.position.set(0.05, 2.74, -1.6); mainP.m.color.setScalar(0.82); scene.add(mainP.p);
const rivalP = makePanel(600, 420, 1.45); rivalP.p.position.set(-2.0, 2.78, -1.25); rivalP.p.rotation.y = 0.16; scene.add(rivalP.p);
const ambient = [];
for (const [x, y, z, ry, w] of [[-2.3, 3.5, -3.4, 0.3, 1.5], [2.35, 3.3, -3.6, -0.3, 1.6], [2.2, 1.55, -3.2, -0.25, 1.3], [-2.45, 1.45, -3.5, 0.28, 1.3], [0.4, 4.35, -3.8, 0, 1.7]]) {
  const a = makePanel(512, 360, w); a.p.position.set(x, y, z); a.p.rotation.y = ry; a.m.opacity = 0.34; scene.add(a.p); ambient.push(a);
}

// ---------- camera shots ----------
const SH = {
  W2: { p: [0.05, 1.5, 9.4], q: [0.05, 0.95, 0], push: 0.05 },
  M2: { p: [0.05, 1.45, 7.5], q: [0.05, 1.2, 0], push: 0.05 },
  CH: { p: [-0.18, 1.55, 4.3], q: [-0.45, 1.2, 0], push: 0.06 },
  CB: { p: [0.86, 1.35, 4.0], q: [0.57, 0.82, 0], push: 0.07 },
  WS: { p: [-0.72, 1.6, 11.6], q: [-0.72, 1.3, 0], push: 0.04 },
  CR: { p: [-1.42, 1.45, 5.4], q: [-1.7, 1.5, 0], push: 0.06 },
  PF: { p: [0.05, 1.93, 9.0], q: [0.05, 1.93, 0], push: 0.035 },
  PF2: { p: [-1.05, 2.0, 8.75], q: [0.2, 1.95, -0.2], push: 0.035 },
  W2o: { p: [0.05, 1.5, 9.0], q: [0.05, 0.95, 0], push: -0.08 },
};
const CUTS = [[0, 'W2'], [2.58, 'CH'], [5.35, 'CB'], [6.38, 'CH'], [7.9, 'PF'], [10.9, 'CH'], [13.05, 'CB'], [14.45, 'W2'], [17.3, 'CH'], [18.58, 'CB'], [19.8, 'M2'], [21.55, 'CB'], [22.9, 'CH'], [23.6, 'PF2'], [26.7, 'PF'], [28.8, 'M2'], [30.05, 'PF2'], [33.6, 'M2'], [35.75, 'W2o'], [37.7, 'M2'], [40.2, 'PF'], [DURATION, 'END']];
const vp = new THREE.Vector3(), vq = new THREE.Vector3();
function setCamera(t) {
  let i = 0; while (i < CUTS.length - 2 && t >= CUTS[i + 1][0]) i++;
  const s = SH[CUTS[i][1]], k = clamp((t - CUTS[i][0]) / (CUTS[i + 1][0] - CUTS[i][0]));
  vp.set(...s.p); vq.set(...s.q);
  vp.lerp(vq, s.push * k);
  vp.x += Math.sin(t * 0.55) * 0.03; vp.y += Math.sin(t * 0.41 + 1.3) * 0.02;
  camera.position.copy(vp); camera.lookAt(vq);
}

// ---------- acting ----------
function heroPose(t) {
  const P = { x: -0.45, hop: 0, yaw: 0.22, lean: 0, hp: 0, hy: 0, hr: 0, aLx: 0, aLz: -0.1, aRx: 0, aRz: 0.1, eye: 1, brow: 0, browT: 0, mouth: 0.6, open: 0 };
  let w;
  const run = 1 - smooth(0, 0.85, t); P.x -= 1.9 * run; P.hop += 0.07 * run * Math.abs(Math.sin(t * 14));
  w = win(t, -1, 2.5); P.hy += 0.45 * w; P.aLz -= 0.5 * w; P.aRz += 0.5 * w; P.eye += 0.15 * w; P.brow += 0.03 * w; P.hop += 0.04 * w * Math.abs(Math.sin(t * 8));
  w = win(t, 2.58, 5.3); P.hy -= 0.15 * w; P.hp -= 0.12 * w; P.eye += 0.2 * w; P.brow += 0.04 * w; P.mouth += 0.4 * w;
  const pump = win(t, 3.4, 4.9, 0.3); P.aRx -= 2.3 * pump; P.aRz += 0.25 * pump; P.hop += 0.05 * pump * Math.abs(Math.sin((t - 3.4) * 8));
  w = win(t, 5.35, 6.35); P.hy += 0.5 * w; P.brow += 0.03 * w; P.hr += 0.08 * w;
  w = win(t, 6.38, 7.05, 0.12); P.hy += w * 0.32 * Math.sin((t - 6.38) * 15);
  const chop = win(t, 6.95, 7.75, 0.15); P.aRx -= chop * (1.3 + 0.35 * Math.sin((t - 6.95) * 16)); P.hy += 0.3 * win(t, 6.38, 7.85); P.browT -= 0.1 * chop; P.mouth += 0.3 * chop;
  w = win(t, 7.9, 10.85); P.hp -= 0.3 * w; P.aLz -= 0.9 * w; P.aRz += 0.9 * w; P.hop += 0.04 * w * Math.abs(Math.sin(t * 7)); P.eye += 0.12 * w;
  w = win(t, 10.9, 13.0); P.hy += 0.25 * w; P.mouth += 0.4 * w; const one = win(t, 11.9, 12.9, 0.2); P.aRx -= 2.75 * one; P.aRz += 0.25 * one; P.brow += 0.03 * one;
  w = win(t, 13.05, 14.4); P.hy += 0.5 * w; P.hr -= 0.06 * w; P.mouth -= 0.3 * w;
  w = win(t, 14.45, 16.15); P.hp -= 0.25 * w; P.aLx -= 2.6 * w; P.aLz -= 0.3 * w; P.browT += 0.1 * w; P.mouth -= 0.5 * w;
  w = win(t, 16.15, 19.8, 0.35); P.lean += 0.2 * w; P.hp += 0.3 * w; P.eye -= 0.45 * w; P.browT += 0.2 * w; P.mouth -= 1.3 * w;
  w = win(t, 19.8, 22.85, 0.4); P.hy += 0.5 * w; P.eye -= 0.1 * w; P.mouth -= 0.2 * w;
  w = win(t, 22.9, 23.6, 0.1); P.hy += 0.55 * w; P.hp -= 0.12 * w; P.eye += 0.4 * w; P.brow += 0.06 * w;
  w = win(t, 23.6, 28.8); P.hp -= 0.3 * w; P.eye += 0.15 * w;
  for (const tt of [24.0, 25.0, 26.0]) P.hp += 0.1 * win(t, tt, tt + 0.3, 0.2);
  w = win(t, 28.8, 30.0); P.hy += 0.35 * w; P.mouth += 0.5 * w; const th = win(t, 29.4, 30.0, 0.15); P.aRx -= 2.7 * th; P.hp += 0.12 * th * Math.sin((t - 29.4) * 10);
  w = win(t, 30.05, 32.6); P.hy += 0.4 * w; P.aRx -= 2.2 * w; P.aRz += 0.3 * w; P.brow += 0.03 * w;
  for (const tt of [30.39, 31.15, 31.97]) { const b = win(t, tt, tt + 0.25, 0.12); P.aRx -= 0.45 * b; P.hp += 0.06 * b; }
  w = win(t, 32.6, 33.55); P.hy += 0.45 * w; P.eye += 0.3 * w; P.brow += 0.05 * w; P.open += 0.4 * w;
  w = win(t, 33.6, 35.75, 0.18); P.aLz -= 2.5 * w; P.aRz += 2.5 * w; P.hop += 0.1 * w * Math.abs(Math.sin((t - 33.6) * 8)); P.mouth += 0.6 * w; P.eye += 0.12 * w; P.hy += 0.3 * w;
  w = win(t, 35.75, 37.65); P.hy += 0.4 * w; P.mouth += 0.5 * w; P.hp -= 0.08 * w;
  w = smooth(37.6, 37.95, t); P.yaw -= 0.22 * w;
  w = win(t, 37.7, 40.15); P.aRx -= 2.75 * w; P.aRz += 0.35 * w; P.brow += 0.03 * w;
  w = smooth(40.15, 40.45, t); const bob = Math.sin((t - 40.15) * 6.5);
  P.aLx -= w * (0.95 + 0.12 * bob); P.aRx -= w * (0.95 + 0.12 * bob); P.aLz += 0.2 * w; P.aRz -= 0.2 * w; P.hp += w * (0.1 + 0.06 * bob); P.mouth += 0.5 * w; P.eye += 0.08 * w;
  return P;
}
function rivalPose(t) {
  const P = { x: -1.6, hop: 0, yaw: 0.18, lean: 0.14, hp: 0.13, hy: 0.1, hr: 0.07, aLx: 0, aLz: -0.08, aRx: -1.15, aRz: 0.15 + 0.22 * Math.sin(t * 2.3), eye: 0.5, brow: -0.01, browT: -0.22, mouth: -0.8, open: 0 };
  P.hp += 0.05 * Math.sin(t * 1.1);
  const w = win(t, 39.7, 41.0, 0.2); P.hy += 0.7 * w; P.hp -= 0.3 * w; P.eye += 0.6 * w; P.open += 0.5 * w; P.lean -= 0.12 * w;
  return P;
}
function poseBot(t, env) {
  let x = 0.55, y = 1.1 + 0.05 * Math.sin(t * 1.9), yaw = -0.32, pitch = 0, roll = 0.04 * Math.sin(t * 1.3), eL = 1, eR = 1, ringAmp = 0, ringDir = 1, w;
  yaw += 0.6 * (1 - smooth(0.3, 1.7, t));
  const talk = (a, b) => win(t, a, b, 0.2);
  const speak = clamp(talk(5.35, 6.3) + talk(13.05, 14.35) + talk(18.58, 22.75) + talk(23.6, 30.0) + talk(32.65, 33.5) + talk(35.75, 37.65));
  x -= 0.1 * speak; roll += 0.1 * speak; eL *= 1 - 0.22 * speak; eR *= 1 - 0.22 * speak; yaw -= 0.12 * speak;
  ringAmp = Math.max(ringAmp, 0.45 * speak * Math.min(1, env * 2.4));
  w = clamp(talk(5.35, 6.3) + talk(13.05, 14.35)); roll += 0.1 * w; eL *= 1 + 0.3 * w; eR *= 1 - 0.15 * w;
  w = win(t, 7.9, 10.85); pitch -= 0.2 * w; yaw += 0.3 * w;
  w = win(t, 14.45, 17.3); pitch -= 0.2 * w; yaw += 0.3 * w;
  y += 0.12 * win(t, 19.8, 20.3, 0.15);
  w = win(t, 21.55, 22.8, 0.2); eL *= 1 - 0.75 * w; eR *= 1 - 0.75 * w; ringAmp = Math.max(ringAmp, w); if (w > 0.01) ringDir = -1;
  w = win(t, 23.6, 28.8); pitch -= 0.12 * w; yaw += 0.22 * w;
  for (const tt of [24.0, 25.0, 26.0]) { const h = win(t, tt, tt + 0.28, 0.14); y += 0.1 * h; ringAmp = Math.max(ringAmp, 0.6 * h); }
  for (const tt of [32.75, 32.95, 33.15]) ringAmp = Math.max(ringAmp, 0.6 * win(t, tt, tt + 0.3, 0.12));
  { const k = clamp((t - 32.7) / 0.6); if (k > 0 && k < 1) yaw += Math.PI * 2 * (k * k * (3 - 2 * k)); }
  w = win(t, 32.65, 33.55); eL *= 1 - 0.5 * w; eR *= 1 - 0.5 * w;
  w = win(t, 35.75, 37.65); eL *= 1 - 0.55 * w; eR *= 1 - 0.55 * w;
  w = smooth(37.6, 37.95, t); yaw += 0.32 * w;
  w = smooth(40.15, 40.45, t); y += 0.06 * w * Math.sin((t - 40.15) * 6.5); eL *= 1 - 0.6 * w; eR *= 1 - 0.6 * w;
  const bl = blink(t, 1.4);
  bot.g.position.set(x, y, 0); bot.g.rotation.set(pitch, yaw, roll);
  bot.eyeL.scale.y = Math.max(0.1, eL * bl); bot.eyeR.scale.y = Math.max(0.1, eR * bl);
  bot.bulbM.color.setScalar(1).multiply(new THREE.Color(0xffe2c2)).multiplyScalar(0.7 + 0.9 * env);
  bot.thr.scale.setScalar(0.9 + 0.15 * Math.sin(t * 9));
  const breath = 0.5 + 0.16 * Math.sin(t * 1.7) + 0.45 * ringAmp + 0.2 * env;
  bot.coral.emissiveIntensity = breath; bot.coralD.emissiveIntensity = 0.12 + breath * 0.35; bot.inner.intensity = 1.2 + 2.4 * breath;
  halo.position.set(x, y, -0.05); halo.material.opacity = 0.16 + 0.3 * breath;
  for (let i = 0; i < 3; i++) {
    let ph = (t * 0.9 + i / 3) % 1; if (ringDir < 0) ph = 1 - ph;
    const s = 0.75 + ph * 0.95; bot.rings[i].scale.set(s, s, 1);
    bot.rings[i].material.opacity = ringAmp * Math.sin(Math.PI * ph) * 0.42;
    bot.rings[i].quaternion.copy(bot.g.quaternion).invert().multiply(camera.quaternion);
  }
}

// ---------- frame ----------
let ENV = [];
const envAt = t => { const i = clamp(Math.floor(t * FPS), 0, ENV.length - 1); return ENV.length ? (ENV[i] + (ENV[Math.max(0, i - 1)] || 0)) / 2 : 0; };

window.renderFrame = (t) => {
  const env = envAt(t);
  setCamera(t);
  const HP = heroPose(t);
  if (HERO_TALK.some(([a, b]) => t >= a && t < b) && env > 0.1) HP.open = Math.max(HP.open, Math.min(1, 0.08 + env * 1.15));
  poseKid(hero, HP, t, 0.3);
  const showRival = false;
  rival.g.visible = showRival; rivalP.p.visible = showRival; divider.visible = showRival && !(t >= 16.42 && t < 20.66); coldLight.intensity = showRival ? 3 : 0;
  if (showRival) {
    poseKid(rival, rivalPose(t), t, 1.9);
    const g = t < 30 ? back((t - 14.62) / 0.55) : 1;
    divider.userData.beam.scale.y = 3.4 * Math.max(0.001, g); divider.userData.fl.scale.z = Math.max(0.001, clamp((t < 30 ? (t - 14.62) / 0.4 : 1)));
    drawRival(rivalP.ctx, t); rivalP.tex.needsUpdate = true;
    rivalP.p.position.y = 2.78 + 0.03 * Math.sin(t * 1.4);
  }
  poseBot(t, env);
  // main panel
  let pt = 0; for (const x of PANEL_T) if (t >= x) pt = x;
  const k = pt === 0 ? 1 : (t - pt) / 0.42, sc = 0.84 + 0.16 * back(k);
  mainP.p.scale.set(sc, sc, 1); mainP.m.opacity = pt === 0 ? 1 : smooth(0, 0.16, t - pt);
  const inPF = (t >= 7.9 && t < 10.9) || (t >= 23.6 && t < 28.8) || (t >= 30.05 && t < 33.6) || t >= 40.2; const inWS = false; const ps = inPF ? 1.29 : 1; mainP.p.scale.set(sc * ps, sc * ps, 1); mainP.p.position.y = (inPF ? 3.45 : inWS ? 3.25 : 3.05) + 0.035 * Math.sin(t * 1.2);
  mainP.p.rotation.y = 0.03 * Math.sin(t * 0.7);
  drawMain(mainP.ctx, t); mainP.tex.needsUpdate = true;
  panelLight.intensity = 4.2 + 2.5 * smooth(0, 0.3, t - pt) * (1 - smooth(0.3, 0.9, t - pt)); panelLight.color.setHex(PANEL_COL[Math.max(0, PANEL_T.indexOf(pt))]);
  ambient.forEach((a, i) => { a.p.position.y += 0; a.m.opacity = 0.26 + 0.08 * Math.sin(t * 0.9 + i * 1.7); });
  // city lights
  const ck = 0.75 + 0.6 * smooth(7.95, 9.2, t) * (1 - smooth(12.9, 14.4, t)) - 0.5 * smooth(35.75, 37.2, t) * (1 - smooth(39.5, 40.2, t));
  cityMats.forEach(m => m.color.setScalar(ck));
  bloom.strength = 0.4 + 0.08 * env;
  composer.render();
  // subtitle
  let html = '', who = 'h'; for (const s of SUBS) if (t >= s[0] && t < s[1]) { html = s[2]; who = s[3]; }
  subEl.className = who === 'c' ? 'c' : '';
  if (subEl.dataset.h !== html) { subEl.innerHTML = html; subEl.dataset.h = html; }
  return true;
};

(async () => {
  try { ENV = await (await fetch('/projeto/env.json')).json(); } catch (e) { console.log('no env'); }
  await Promise.all(['700 40px Montserrat', '800 40px Montserrat', '900 40px Montserrat', '600 40px Montserrat'].map(f => document.fonts.load(f)));
  ambient.forEach((a, i) => { drawAmbient(a.ctx, i); a.tex.needsUpdate = true; });
  window.renderFrame(0);
  window.ready = true;
})();


// ================= VIDEOS NO "QUARTO" (telão + clipador + amigo + Claude) =================
// Anexado ao fim de uma copia de main.js (build-quarto.mjs). window.VIDEO escolhe o roteiro em quarto-videos.js.
{
  const VID = 'blender';
  const V = QV[VID];
  V.cine = true; V.ugly = V.feio || V.ugly || [-1, -1]; V.cards = V.cards && V.cards.length ? V.cards : [[0, '#07060c', () => {}]];
  const DUR = V.dur; window.DURATION = DUR;
  const winMax = (t, list, f = 0.2) => (list || []).reduce((m, [a, b]) => Math.max(m, win(t, a, b, f)), 0);
  const LN = V.lines, CUTS = V.cuts.concat([[DUR + 1, 'END']]);
  const PLANO = VID === 'plano', FESTA = VID === 'festa', BLENDER = VID === 'blender', CINE = !!V.cine;
  const talking = (who, t) => LN.find(l => l[2] === who && t >= l[0] && t < l[1]);
  const hash = i => { const s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };

  if (V.heroi) { const map = { 0x1fa79c: V.heroi.capuz, 0x178178: V.heroi.capuzEscuro || (V.heroi.capuz && '#' + new THREE.Color(V.heroi.capuz).multiplyScalar(0.78).getHexString()), 0xf3bea6: V.heroi.pele, 0xe2a48e: V.heroi.nariz || (V.heroi.pele && '#' + new THREE.Color(V.heroi.pele).multiplyScalar(0.9).getHexString()), 0x2b1b22: V.heroi.cabelo, 0x242a4c: V.heroi.calca };
    hero.g.traverse(o => { if (o.material && o.material.color) { const c = map[o.material.color.getHex()]; if (c) { o.material = o.material.clone(); o.material.color.set(c); } } }); }
  { // visual do personagem e do robo escolhidos pela pessoa (roteiro: heroi / robo)
    const HI = V.heroi || {};
    if (HI.bone) { for (let i = 4; i <= 8; i++) hero.head.children[i].visible = false;
      const cm = mat(new THREE.Color(HI.bone).getHex()); const dome = mesh(new THREE.IcosahedronGeometry(0.47, 1), cm, 0, 0.5, -0.02, hero.head); dome.scale.set(1.03, 0.72, 1.05);
      const brim = mesh(new THREE.BoxGeometry(0.52, 0.035, 0.3), cm, 0, 0.5, 0.44, hero.head); brim.rotation.x = 0.12; }
    if (HI.fone === false) hero.head.children.forEach(o => { const c = o.material && o.material.color && o.material.color.getHex(); if (c === 0x15131f || c === 0x5fe0ff) o.visible = false; });
    if (HI.oculos) { const om = mat(new THREE.Color(HI.oculos === true ? '#1a1a1a' : HI.oculos).getHex(), { roughness: 0.4 });
      for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(0.078, 0.014, 6, 18), om, s * 0.15, 0.36, 0.415, hero.head); r.castShadow = false; }
      mesh(new THREE.BoxGeometry(0.08, 0.016, 0.016), om, 0, 0.375, 0.42, hero.head).castShadow = false;
      if (HI.oculosSol) { const lm = mat(new THREE.Color(HI.oculosSol === true ? '#0c0d10' : HI.oculosSol).getHex(), { roughness: 0.12, metalness: 0.6, flatShading: false });
        for (const s of [-1, 1]) { const l = mesh(new THREE.CircleGeometry(0.074, 20), lm, s * 0.15, 0.36, 0.418, hero.head); l.castShadow = false; } } }
    const RB = V.robo || {};
    if (RB.cor) { const c = new THREE.Color(RB.cor); bot.coral.color.copy(c); bot.coral.emissive.copy(c).multiplyScalar(0.9); bot.coralD.color.copy(c).multiplyScalar(0.78); bot.coralD.emissive.copy(c).multiplyScalar(0.8); halo.material.color.copy(c).lerp(new THREE.Color(1, 1, 1), 0.3); }
  }
  { // estilo do corpo: lowpoly (padrao), quadrado, redondo, realista
    const est = (V.heroi || {}).estilo || 'lowpoly';
    const restyle = (root, est, skip) => root.traverse(o => {
      if (!o.isMesh || !o.geometry.parameters || (skip && skip.has(o)) || o.material.isMeshBasicMaterial) return;
      const p = o.geometry.parameters, T = o.geometry.type; let ng = null;
      if (est === 'redondo' || est === 'realista') {
        if (T === 'IcosahedronGeometry') ng = new THREE.SphereGeometry(p.radius, 40, 28);
        else if (T === 'BoxGeometry') ng = new RoundedBoxGeometry(p.width, p.height, p.depth, 5, Math.min(p.width, p.height, p.depth) * (est === 'redondo' ? 0.48 : 0.22));
        else if (T === 'ConeGeometry') ng = new THREE.ConeGeometry(p.radius, p.height, 18);
        else if (T === 'CylinderGeometry') ng = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 32);
        o.material = o.material.clone(); o.material.flatShading = false; o.material.needsUpdate = true;
        if (est === 'realista') { o.material.roughness = 0.62; }
      } else if (est === 'quadrado') {
        if (T === 'IcosahedronGeometry') { const d = p.radius * 1.75; ng = new THREE.BoxGeometry(d, d, d); }
        else if (T === 'ConeGeometry') ng = new THREE.BoxGeometry(p.radius * 1.5, p.height * 0.55, p.radius * 1.1);
        else if (T === 'CylinderGeometry') { const d = Math.max(p.radiusTop, p.radiusBottom) * 1.8; ng = new THREE.BoxGeometry(d, p.height, d); }
      }
      if (ng) o.geometry = ng;
    });
    if (est !== 'lowpoly') {
      const H = hero.head, capHair = H.children[3];
      restyle(hero.g, est, new Set(est === 'quadrado' ? [capHair] : []));
      if (est === 'quadrado') {   // cabelo em blocos: tampa em cima + nuca, sem cobrir o rosto
        capHair.geometry = new THREE.BoxGeometry(0.8, 0.24, 0.8); capHair.scale.set(1, 1, 1); capHair.position.set(0, 0.8, -0.02);
        const nuca = mesh(new THREE.BoxGeometry(0.8, 0.5, 0.22), capHair.material, 0, 0.55, -0.31, H);
        for (let i = 4; i <= 8; i++) { H.children[i].rotation.set(0, 0, 0); H.children[i].position.y = 0.66; }
      }
      if (est === 'redondo') H.scale.setScalar(1.08);
      if (est === 'realista') { H.scale.setScalar(0.86); H.children.forEach(o => { if (o.isGroup) { o.scale.x *= 0.8; o.scale.z *= 0.8; } }); }
      if (est === 'realista') {   // pele e tecido com brilho suave, olhos com reflexo
        hero.g.traverse(o => { if (o.isMesh && o.material.isMeshStandardMaterial && !o.material.isMeshPhysicalMaterial) {
          const m = new THREE.MeshPhysicalMaterial({ color: o.material.color, roughness: 0.58, sheen: 0.6, sheenRoughness: 0.5, sheenColor: o.material.color.clone().lerp(new THREE.Color(1, 1, 1), 0.4) }); o.material = m; } });
      }
    }
    const rest = (V.robo || {}).estilo;
    if (rest === 'redondo') { bot.body.geometry = new RoundedBoxGeometry(0.86, 0.74, 0.7, 6, 0.34); }
    if (rest === 'quadrado') { bot.body.geometry = new THREE.BoxGeometry(0.86, 0.74, 0.7); restyle(bot.g, 'quadrado', new Set([bot.body])); }
  }
  mainP.p.visible = false; rivalP.p.visible = false; ambient.forEach(a => (a.p.visible = false));
  rival.g.visible = false; divider.visible = false; coldLight.intensity = 0;
  scene.add(key.target);

  // ---------- quarto ----------
  const room = new THREE.Group(); scene.add(room);
  const wallM = new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.92 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), wallM); wall.position.set(0, 4, -2.4); wall.receiveShadow = true; room.add(wall);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), wallM); sw.position.set(s * 3.2, 4, 1.5); sw.rotation.y = -s * Math.PI / 2; room.add(sw); }
  for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, 8, 0.02), new THREE.MeshStandardMaterial({ color: 0x0d0b14 })); p.position.set(-3 + i, 4, -2.39); room.add(p); }
  // telão
  const TLW = 2.2, TLH = 1.54, TLY = 3.05, TLZ = -2.33;
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(TLW + 0.12, TLH + 0.12, 0.08, 3, 0.04), new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.25 })); bezel.position.set(0, TLY, TLZ - 0.03); room.add(bezel);
  const tc = document.createElement('canvas'); tc.width = QTW; tc.height = QTH; const tx = tc.getContext('2d');
  const tTex = new THREE.CanvasTexture(tc); tTex.colorSpace = THREE.SRGBColorSpace; tTex.anisotropy = 8;
  const tMat = new THREE.MeshBasicMaterial({ map: tTex, toneMapped: false, fog: false }); tMat.color.setScalar(0.82);
  const telao = new THREE.Mesh(new THREE.PlaneGeometry(TLW, TLH), tMat); telao.position.set(0, TLY, TLZ + 0.02); room.add(telao);
  // neon e LEDs
  const neonL = glow(0xff3fa4), neonR = glow(0x4fd8ff), ledM = glow(0x9a6cff);
  for (const [s, m] of [[-1, neonL], [1, neonR]]) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.6, 0.04), m); n.position.set(s * 1.42, 2.6, -2.36); room.add(n); }
  const ledTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.03, 0.03), ledM); ledTop.position.set(0, 4.15, -2.37); room.add(ledTop);
  const zero = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 28), neonL); zero.scale.y = 1.25; zero.position.set(-1.95, 3.3, -2.36); room.add(zero);
  const zero2 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 28), neonR); zero2.scale.y = 1.25; zero2.position.set(1.95, 3.3, -2.36); room.add(zero2);
  // mesa
  const deskM = new THREE.MeshStandardMaterial({ color: 0x1d1826, roughness: 0.5, metalness: 0.2 });
  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.06, 0.78), deskM); desk.position.set(0, 0.9, -1.95); desk.castShadow = true; desk.receiveShadow = true; room.add(desk);
  for (const s of [-1, 1]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.7), deskM); lg.position.set(s * 1.58, 0.44, -1.95); room.add(lg); }
  const deskLed = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.025, 0.025), ledM); deskLed.position.set(0, 0.86, -1.57); room.add(deskLed);
  // 3 monitores pequenos
  const minis = [[-0.92, 0.36], [0, 0], [0.92, -0.36]].map(([x, ry], i) => {
    const c = document.createElement('canvas'); c.width = 320; c.height = 200; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const g = new THREE.Group(); g.position.set(x, 1.3, -2.08 + Math.abs(x) * 0.12); g.rotation.y = ry; room.add(g);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.54, 0.04), new THREE.MeshStandardMaterial({ color: 0x08080c, roughness: 0.3 })));
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.48), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); p.position.z = 0.022; p.material.color.setScalar(0.75); g.add(p);
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.05), deskM); st.position.set(0, -0.36, -0.02); g.add(st);
    const bs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.18), deskM); bs.position.set(0, -0.37 - 0.09, 0); g.add(bs);
    return { ctx: c.getContext('2d'), tex };
  });
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.02, 0.17), new THREE.MeshStandardMaterial({ color: 0x0c0c12, roughness: 0.4 })); kb.position.set(0, 0.945, -1.72); room.add(kb);
  const kbLed = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.006, 0.12), glow(0x5fe0ff, { transparent: true, opacity: 0.55 })); kbLed.position.set(0, 0.958, -1.72); room.add(kbLed);
  // latinhas organizadas
  const canM = new THREE.MeshStandardMaterial({ color: 0x2b4fb8, roughness: 0.3, metalness: 0.7 }), canT = new THREE.MeshStandardMaterial({ color: 0xc8ccd6, roughness: 0.3, metalness: 0.9 });
  const cans = [];
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.position.set(-1.42 + i * 0.085, 0.93, -1.68); room.add(g);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.13, 12), canM); b.position.y = 0.065; g.add(b);
    const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.012, 12), canT); tp.position.y = 0.136; g.add(tp);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.0345, 0.0345, 0.03, 12), glow(0xc8d4ff, { transparent: true, opacity: 0.7 })); st.position.y = 0.07; g.add(st); cans.push(g); }
  // gabinete com RGB
  const pc = new THREE.Group(); pc.position.set(1.36, 0.93, -1.98); room.add(pc);
  pc.add(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.46), new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.3, metalness: 0.4 }))); pc.children[0].position.y = 0.25;
  const fans = [0.14, 0.34].map((y, i) => { const f = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 20), glow(i ? 0x4fd8ff : 0xff3fa4)); f.position.set(0, y, 0.235); pc.add(f); return f; });
  // celular num suporte (usado no video da festa)
  const phone = new THREE.Group(); phone.position.set(0.55, 1.13, -1.72); phone.rotation.x = -0.22; room.add(phone); phone.visible = FESTA;
  const phC = document.createElement('canvas'); phC.width = 200; phC.height = 400; const phX = phC.getContext('2d'); const phTex = new THREE.CanvasTexture(phC); phTex.colorSpace = THREE.SRGBColorSpace;
  phone.add(new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.4, 0.02, 3, 0.02), new THREE.MeshStandardMaterial({ color: 0x0a0a0e, roughness: 0.25 })));
  const phScr = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.38), new THREE.MeshBasicMaterial({ map: phTex, toneMapped: false })); phScr.position.z = 0.011; phone.add(phScr);
  const phRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 8, 40), glow(0xffb48c, { transparent: true, opacity: 0 })); phRing.position.set(0.55, 1.13, -1.7); room.add(phRing);
  const phStand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.12), deskM); phStand.position.set(0.55, 0.945, -1.76); room.add(phStand); phStand.visible = FESTA;
  // luzes do quarto
  const lightL = new THREE.PointLight(0xff3fa4, 6, 8, 1.6); lightL.position.set(-2.2, 2.5, -1.0); scene.add(lightL);
  const lightR = new THREE.PointLight(0x4fd8ff, 5, 8, 1.6); lightR.position.set(2.2, 2.3, -0.8); scene.add(lightR);
  const lightT = new THREE.PointLight(0xfff0e0, 3, 7, 1.5); lightT.position.set(0, 2.9, -1.2); scene.add(lightT);

  // ---------- personagens ----------
  const friend = buildKid({ skin: 0xc48a66, nose: 0xae7653, hood: 0xd23a3a, hoodD: 0xa32828, pants: 0x1c1c26, hair: 0x1a1414, string: 0xffffff });
  scene.add(friend.g);
  for (let i = 4; i <= 8; i++) friend.head.children[i].visible = false;        // sem franja: usa bone
  { const cm = mat(0x1d1d28); const dome = mesh(new THREE.IcosahedronGeometry(0.47, 1), cm, 0, 0.5, -0.02, friend.head); dome.scale.set(1.03, 0.72, 1.05);
    const brim = mesh(new THREE.BoxGeometry(0.52, 0.035, 0.3), cm, 0, 0.5, 0.44, friend.head); brim.rotation.x = 0.12;
    mesh(new THREE.BoxGeometry(0.16, 0.1, 0.02), glow(0xffd166), 0, 0.62, 0.43, friend.head); }
  const neck = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 8, 24), glow(0x7CFC8A)); neck.rotation.x = Math.PI / 2 - 0.25; neck.position.set(0, 0.6, 0.06); friend.body.add(neck); neck.visible = FESTA;
  // garrafa na mao direita do clipador (video do plano)
  const bottle = new THREE.Group(); bottle.position.set(0, -0.52, 0.02); bottle.rotation.x = Math.PI / 2; hero.armR.add(bottle); bottle.visible = PLANO;
  const btlM = new THREE.MeshPhysicalMaterial({ color: 0x0f3a22, roughness: 0.2, clearcoat: 1 }), goldM = new THREE.MeshStandardMaterial({ color: 0xd9b24c, roughness: 0.35, metalness: 0.8 });
  mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.26, 10), btlM, 0, 0.1, 0, bottle); mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.1, 10), btlM, 0, 0.28, 0, bottle);
  mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.1, 8), goldM, 0, 0.37, 0, bottle); mesh(new THREE.CylinderGeometry(0.0565, 0.0565, 0.09, 10), mat(0xf0e6d0), 0, 0.1, 0, bottle);
  const tip = new THREE.Object3D(); tip.position.y = 0.43; bottle.add(tip);
  const foam = []; for (let i = 0; i < 40; i++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.022, 0), glow(0xfff6dc, { transparent: true })); scene.add(f); f.visible = false; foam.push(f); }
  const confetti = []; for (let i = 0; i < 80; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.09), glow([0xffd166, 0xff4fa8, 0x5fe0ff, 0x7CFC8A, 0xff7a45][i % 5], { side: THREE.DoubleSide, transparent: true })); scene.add(c); c.visible = false; confetti.push(c); }
  // tacas
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  const champM = new THREE.MeshStandardMaterial({ color: 0xf2d27a, roughness: 0.2, emissive: 0x6a5010 });
  function makeGlass() { const g = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.01, 10), glassM, 0, 0.005, 0, g); mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.13, 6), glassM, 0, 0.07, 0, g);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.02, 0.17, 10, 1, true), glassM); b.position.y = 0.22; g.add(b); mesh(new THREE.CylinderGeometry(0.038, 0.02, 0.1, 10), champM, 0, 0.19, 0, g); return g; }
  const botGlass = makeGlass(); scene.add(botGlass); botGlass.visible = PLANO;
  const botGlassRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 24), glow(0xffe2c2, { transparent: true, opacity: 0.8 })); botGlassRing.rotation.x = Math.PI / 2; botGlass.add(botGlassRing);
  const frGlass = makeGlass(); frGlass.position.set(0, -0.52, 0.02); frGlass.rotation.x = Math.PI / 2; friend.armR.add(frGlass); frGlass.visible = false;

  // rua com os dois carros (final do video da festa)
  const CARX = 24; const cars = [];
  if (FESTA) for (const [col, z] of [[0xff7a45, 1.2], [0x22d3c5, -0.6]]) {
    const g = new THREE.Group(); scene.add(g); const pm = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.25, clearcoat: 1, metalness: 0.3 });
    const b = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.36, 0.95, 3, 0.1), pm); b.position.y = 0.36; b.castShadow = true; g.add(b);
    const cab = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.3, 0.8, 3, 0.1), new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.1, metalness: 0.6 })); cab.position.set(-0.15, 0.66, 0); g.add(cab);
    for (const [wx, wz] of [[-0.75, 0.48], [0.75, 0.48], [-0.75, -0.48], [0.75, -0.48]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.6 })); w.rotation.x = Math.PI / 2; w.position.set(wx, 0.2, wz); g.add(w); }
    for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.2), glow(0xfff4d0)); hl.position.set(1.16, 0.4, s * 0.3); g.add(hl); const tl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.24), glow(0xff2a3a)); tl.position.set(-1.16, 0.42, s * 0.3); g.add(tl); }
    const ul = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), glow(col, { transparent: true, opacity: 0.35 })); ul.rotation.x = -Math.PI / 2; ul.position.y = 0.03; g.add(ul);
    g.userData.z = z; cars.push(g);
  }

  // ---------- telão e telas pequenas ----------
  const H = {
    x: tx, sm: smooth, clamp,
    fnt: (px, w = 700, fam = "'Segoe UI', sans-serif") => { tx.font = `${w} ${px}px ${fam}`; },
    box: (X, Y, W_, H_, R, fill, stroke, lw = 4) => { tx.beginPath(); tx.roundRect(X, Y, W_, H_, R); if (fill) { tx.fillStyle = fill; tx.fill(); } if (stroke) { tx.strokeStyle = stroke; tx.lineWidth = lw; tx.stroke(); } },
    txt: (s, X, Y, col, al = 'left') => { tx.textAlign = al; tx.fillStyle = col; tx.fillText(s, X, Y); tx.textAlign = 'left'; },
    pop: (t, t0, d = 0.28) => { const k = clamp((t - t0) / d); return k <= 0 ? 0 : back(k); },
  };
  function drawTelao(t) {
    let i = 0; while (i < V.cards.length - 1 && t >= V.cards[i + 1][0]) i++;
    const [t0, bg, fn] = V.cards[i];
    tx.globalAlpha = 1; tx.shadowBlur = 0; tx.textBaseline = 'alphabetic'; tx.textAlign = 'left'; tx.setLineDash([]);
    tx.fillStyle = bg; tx.fillRect(0, 0, QTW, QTH);
    const a = i === 0 ? 1 : smooth(t0, t0 + 0.16, t);
    tx.save(); tx.globalAlpha = a; tx.translate(0, (1 - a) * 30); fn(t, H); tx.restore();
    tTex.needsUpdate = true;
  }
  function drawMinis(t) {
    minis.forEach((m, k) => { const x = m.ctx; x.fillStyle = '#0b0d16'; x.fillRect(0, 0, 320, 200);
      if (k === 0) { for (let i = 0; i < 9; i++) { const w = 60 + hash(i + Math.floor(t * 2)) * 200; x.fillStyle = ['#5fe0ff', '#ff4fa8', '#a98bff', '#7CFC8A'][i % 4]; x.globalAlpha = 0.8; x.fillRect(16 + (i % 3) * 14, 14 + i * 20, w, 9); } x.globalAlpha = 1; }
      else if (k === 1) { x.fillStyle = '#1a2036'; x.fillRect(0, 130, 320, 70); for (let i = 0; i < 40; i++) { const hh = 10 + 60 * Math.abs(Math.sin(i * 1.7 + t * 5)) * (0.4 + hash(i)); x.fillStyle = '#ff7a45'; x.fillRect(8 + i * 7.7, 80 - hh / 2, 5, hh); } x.fillStyle = '#ffd166'; x.fillRect((t * 40) % 320, 130, 3, 70); for (let i = 0; i < 5; i++) { x.fillStyle = ['#7b3cff', '#22d3c5', '#ff2e88'][i % 3]; x.fillRect(10 + i * 62, 142 + (i % 2) * 26, 52, 18); } }
      else { for (let i = 0; i < 8; i++) { const hh = 30 + 130 * (0.5 + 0.5 * Math.sin(i * 0.9 + t * 1.5)) * (i + 3) / 11; x.fillStyle = i === 7 ? '#7CFC8A' : '#3b6cff'; x.fillRect(24 + i * 36, 180 - hh, 24, hh); } }
      m.tex.needsUpdate = true; });
  }
  function drawPhone(t) {
    const x = phX; const g = x.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#2a1650'); g.addColorStop(1, '#0c0a18'); x.fillStyle = g; x.fillRect(0, 0, 200, 400);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '700 54px Montserrat'; x.fillText('23:47', 100, 90);
    const n = t >= 44.34 ? 2 : t >= 42.34 ? 1 : 0;
    for (let i = 0; i < n; i++) { const t0 = i ? 44.34 : 42.34, k = clamp((t - t0) / 0.2); x.globalAlpha = k; x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.roundRect(12, 130 + i * 92, 176, 78, 14); x.fill(); x.fillStyle = '#7CFC8A'; x.font = '800 21px Montserrat'; x.fillText('Venda aprovada', 100, 164 + i * 92); x.fillStyle = '#cfc8e0'; x.font = '600 16px sans-serif'; x.fillText('agora', 100, 190 + i * 92); x.globalAlpha = 1; }
    if (t >= 48.3) { x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, 0, 200, 400); x.fillStyle = '#fff'; x.font = '800 22px Montserrat'; x.fillText('SILENCIOSO', 100, 210); }
    x.textAlign = 'left'; phTex.needsUpdate = true;
  }

  // ---------- planos (com movimento) ----------
  const SHOTS = {
    W: { p: [0, 2.0, 7.4], q: [0, 1.95, -0.6], d: [0, 0, -0.45] },
    WB: { p: [0, 2.3, 6.2], q: [0, 2.3, -1.2], d: [0, 0.1, 0.9] },
    PF: { p: [0, 2.6, 4.75], q: [0, 2.55, -2.33], d: [0, 0, -0.22], turn: true },
    H: { p: [0.3, 1.8, 3.6], q: [-0.6, 1.64, 0], d: [-0.12, 0, -0.2] },
    A: { p: [0.05, 1.8, 3.6], q: [0.8, 1.64, 0], d: [0.12, 0, -0.2] },
    B: { p: [0.5, 2.1, 2.5], q: [0.1, 2.05, -0.55], d: [-0.1, 0, -0.14] },
    TS: { p: [0.1, 1.75, 5.0], q: [0.1, 1.62, 0], d: [0, 0, -0.3] },
    LOW: { p: [-1.7, 0.55, 4.3], q: [-0.5, 1.75, 0], d: [0.35, 0.05, -0.2] },
    CAN: { p: [-1.2, 1.32, -0.7], q: [-1.2, 1.0, -1.72], d: [0.06, 0, -0.1] },
    PH: { p: [0.42, 1.5, -0.2], q: [0.52, 1.12, -1.72], d: [0.05, 0, -0.14] },
    CAR: { p: [CARX, 1.7, 7.6], q: [CARX, 0.75, -3], d: [0, 0.35, -0.5] },
    // video "blender" (clipador em x -0.4, Claude em x 0.5)
    CH: { p: [0.25, 1.8, 3.5], q: [-0.4, 1.68, 0], d: [-0.1, 0, -0.3] },
    LOWH: { p: [0.05, 0.95, 3.0], q: [-0.42, 1.78, 0], d: [0.12, 0.05, -0.1] },
    CC: { p: [1.45, 2.2, 4.3], q: [0.5, 2.0, -0.45], d: [-0.08, 0, -0.25] },
    PFC: { p: [0, 2.6, 5.3], q: [0, 2.6, -2.33], d: [0, 0, -0.35], turn: true },
    UG: { p: [0, 1.85, 5.4], q: [0, 1.55, -0.6], d: [0, 0, 0], still: true },
    UGH: { p: [-0.1, 1.75, 3.4], q: [-0.4, 1.62, 0], d: [0, 0, 0], still: true },
    UGC: { p: [0.75, 2.05, 2.9], q: [0.5, 2.0, -0.45], d: [0, 0, 0], still: true },
    REV: { p: [0.25, 1.6, 5.4], q: [0, 1.85, -0.8], d: [-0.15, 0.25, -1.4], ease: true },
    OTS: { p: [3.3, 2.0, 2.5], q: [0, 1.85, -0.2], d: [-0.25, 0, -0.3] },
    ORB: { orbit: [0.05, 1.85, -0.2, 4.7, 0.4, -0.15, 1.95], q: [0.05, 1.8, -0.2] },
    ORB2: { orbit: [0.05, 1.85, -0.2, 4.3, 1.0, -0.6, 2.2], q: [0.05, 1.85, -0.2] },
    W2: { p: [0, 2.05, 5.6], q: [0, 1.8, -0.8], d: [0, 0, -0.6] },
    MOUTH: { p: [0.25, 1.62, 1.95], q: [-0.38, 1.55, 0.05], d: [0, 0, -0.1] },
    END: { p: [0, 2.4, 4.4], q: [0, 2.55, -2.33], d: [0, 0.2, 1.8], turn: true },
  };
  const vp = new THREE.Vector3(), vq = new THREE.Vector3();
  function cam(t) {
    let i = 0; while (i < CUTS.length - 2 && t >= CUTS[i + 1][0]) i++;
    const name = CUTS[i][1], s = SHOTS[name], lt = t - CUTS[i][0], k = clamp(lt / Math.max(1.2, CUTS[i + 1][0] - CUTS[i][0]));
    vq.set(...s.q);
    if (s.orbit) { const [cx, cy, cz, r, a0, a1, hy] = s.orbit, a = a0 + (a1 - a0) * smooth(0, 1, k); vp.set(cx + Math.sin(a) * r, hy, cz + Math.cos(a) * r); }
    else { const kk = s.ease ? 1 - Math.pow(1 - k, 3) : k; vp.set(s.p[0] + s.d[0] * kk, s.p[1] + s.d[1] * kk, s.p[2] + s.d[2] * kk); }
    if (s.rel && window.__bonPos) { const o = window.__bonPos(s.rel, t); vq.x += o.x; vq.z += o.z; vp.x += o.x; vp.z += o.z; }   // 18/11: plano que acompanha o boneco (praca)
    if (!s.still) { vp.x += Math.sin(t * 0.7) * 0.025 + (CINE ? 0.008 * Math.sin(t * 2.3) : 0); vp.y += Math.sin(t * 0.53 + 1.3) * 0.016 + (CINE ? 0.006 * Math.sin(t * 3.1 + 2) : 0); }
    camera.fov = (s.fov || (CINE ? 33 : 35)) * (1 + (s.still || V.semSoco ? 0 : CINE ? 0.035 : 0.07) * (1 - smooth(0, 0.3, lt))); camera.updateProjectionMatrix();   // "soco" de zoom a cada corte
    if (camera.near !== 0.1) { camera.near = 0.1; camera.updateProjectionMatrix(); if (CINE && cine.bokeh) cine.bokeh.uniforms.nearClip.value = 0.1; }
    camera.up.set(0, 1, 0); camera.position.copy(vp); camera.lookAt(vq);
    return { name, turn: !!s.turn, still: !!s.still, scr: !!s.scr, focus: vp.distanceTo(vq) };
  }

  // ---------- atuacao ----------
  function gesture(P, o, w, t, t0) {
    const g = o.g, e = o.e;
    if (g === 'up') { P.aLz -= 2.4 * w; P.aRz += 2.3 * w; P.hop += 0.09 * w * Math.abs(Math.sin((t - t0) * 9)); }
    if (g === 'point') { P.aLx -= 1.5 * w; P.aLz -= 0.2 * w; }
    if (g === 'shrug') { P.aLz -= 0.7 * w; P.aRz += 0.7 * w; P.aLx -= 0.45 * w; P.aRx -= 0.45 * w; P.hr += 0.1 * w; }
    if (g === 'no') { P.hy += 0.3 * w * Math.sin((t - t0) * 18); }
    if (g === 'chest') { P.aLx -= 1.15 * w; P.aLz += 0.55 * w; }
    if (g === 'think') { P.aLx -= 2.3 * w; P.aLz += 0.35 * w; P.hr += 0.08 * w; }
    if (g === 'beg') { P.aLx -= 1.35 * w; P.aRx -= 1.35 * w; P.aLz += 0.32 * w; P.aRz -= 0.32 * w; P.brow += 0.05 * w; P.eye += 0.2 * w; P.lean += 0.1 * w; }
    if (g === 'annoy') { P.aLx -= 0.85 * w; P.aLz += 0.6 * w; P.aRx -= 0.85 * w; P.aRz -= 0.6 * w; P.browT -= 0.3 * w; P.mouth -= 1.2 * w; }
    if (g === 'shock') { P.eye += 0.38 * w; P.brow += 0.07 * w; P.open = Math.max(P.open, 0.45 * w); P.aLz -= 0.9 * w; P.aRz += 0.9 * w; P.lean -= 0.1 * w; }
    if (g === 'one') { P.aLx -= 2.85 * w; P.aLz -= 0.1 * w; }
    expr(P, e, w);
  }
  function expr(P, e, w) {
    if (e === 'happy') { P.mouth += 0.5 * w; P.eye += 0.1 * w; P.brow += 0.02 * w; }
    if (e === 'proud') { P.hp -= 0.14 * w; P.mouth += 0.45 * w; P.browT -= 0.1 * w; }
    if (e === 'conf') { P.hr += 0.13 * w; P.browT -= 0.12 * w; P.mouth -= 0.6 * w; P.eye += 0.1 * w; }
    if (e === 'sus') { P.eye -= 0.32 * w; P.browT -= 0.2 * w; P.hr -= 0.08 * w; P.mouth -= 0.7 * w; }
    if (e === 'off') { P.browT -= 0.34 * w; P.mouth -= 1.3 * w; P.eye += 0.12 * w; P.hp -= 0.08 * w; }
    if (e === 'sad') { P.hp += 0.3 * w; P.mouth -= 1.5 * w; P.browT += 0.22 * w; P.eye -= 0.15 * w; P.lean += 0.1 * w; }
  }
  function actor(who, t, turn) {
    const hero_ = who === 'h';
    const P = { x: hero_ ? -0.62 : 0.8, z: 0, hop: 0, yaw: hero_ ? 0.22 : -0.3, lean: 0, hp: 0.02 * Math.sin(t * 1.3 + (hero_ ? 0 : 2)), hy: 0, hr: 0.02 * Math.sin(t * 0.9 + (hero_ ? 1 : 0)), aLx: 0, aLz: -0.1, aRx: 0, aRz: 0.1, eye: 1, brow: 0, browT: 0, mouth: 0.55, open: 0 };
    for (const ln of LN) {
      const w = win(t, ln[0], ln[1] + 0.12, 0.24); if (w < 0.001) continue; const o = ln[4];
      if (ln[2] === who) gesture(P, o, w, t, ln[0]);
      else {
        if (hero_) { if (ln[2] === 'a') P.hy += 0.42 * w; else { P.hy += 0.2 * w; P.hp -= 0.16 * w; } if (o.hr) expr(P, o.hr, w); }
        else { if (ln[2] === 'h') P.hy -= 0.42 * w; else { P.hy -= 0.28 * w; P.hp -= 0.16 * w; } if (o.ar) expr(P, o.ar, w); }
      }
    }
    return P;
  }
  function faceScreen(P, who, t) { P.yaw = who === 'h' ? Math.PI - 0.25 : Math.PI + 0.3; P.hy = 0; P.hp = -0.28; P.hr = 0; P.lean = -0.04; if (talking(who, t)) { P.aLx = -2.3; P.aLz = who === 'h' ? 0.25 : -0.25; } }

  function botAt(t, env, x, y, z, yaw, pitch, extraRoll = 0) {
    let roll = 0.04 * Math.sin(t * 1.3) + extraRoll, eL = 1, eR = 1, ringAmp = 0;
    for (const ln of LN) { const w = win(t, ln[0], ln[1], 0.22); if (w < 0.001 || ln[2] !== 'c') continue; roll += 0.09 * w; eL *= 1 - 0.22 * w; eR *= 1 - 0.22 * w; ringAmp = Math.max(ringAmp, 0.5 * w * Math.min(1, env * 2.4)); }
    const bl = blink(t, 1.4);
    bot.g.position.set(x, y + 0.05 * Math.sin(t * 1.9), z); bot.g.rotation.set(pitch, yaw, roll);
    bot.eyeL.scale.y = Math.max(0.1, eL * bl); bot.eyeR.scale.y = Math.max(0.1, eR * bl);
    bot.bulbM.color.setScalar(1).multiply(new THREE.Color(0xffe2c2)).multiplyScalar(0.7 + 0.9 * env);
    bot.thr.scale.setScalar(0.9 + 0.15 * Math.sin(t * 9));
    const breath = 0.5 + 0.16 * Math.sin(t * 1.7) + 0.45 * ringAmp + 0.2 * env;
    bot.coral.emissiveIntensity = breath; bot.coralD.emissiveIntensity = 0.12 + breath * 0.35; bot.inner.intensity = 1.2 + 2.4 * breath;
    halo.position.copy(bot.g.position); halo.position.z -= 0.05; halo.material.opacity = 0.14 + 0.28 * breath;
    for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1; const s = 0.75 + ph * 0.95; bot.rings[i].scale.set(s, s, 1);
      bot.rings[i].material.opacity = ringAmp * Math.sin(Math.PI * ph) * 0.42; bot.rings[i].quaternion.copy(bot.g.quaternion).invert().multiply(camera.quaternion); }
  }
  const botLook = t => { let y = 0; for (const ln of LN) { const w = win(t, ln[0], ln[1], 0.25); if (ln[2] === 'h') y -= 0.4 * w; if (ln[2] === 'a') y += 0.4 * w; } return y; };

  const tipW = new THREE.Vector3();
  function framePlano(t, env, shot) {
    const P = actor('h', t), A = actor('a', t);
    // garrafa: segura na altura do peito; no comeco, sacode pro alto
    const cheer = 1 - smooth(3.4, 4.2, t), toast = smooth(54.8, 55.2, t);
    P.aRx = -1.05 - 1.25 * cheer - 1.2 * toast + 0.22 * cheer * Math.sin(t * 15); P.aRz = 0.15 + 0.2 * cheer;
    P.hop += 0.07 * cheer * Math.abs(Math.sin(t * 8)) + 0.05 * toast * Math.abs(Math.sin(t * 7));
    // amigo entra pela direita
    const inn = smooth(5.5, 6.5, t); A.x = lerp(2.6, 0.8, inn); A.hop += 0.07 * (1 - inn) * Math.abs(Math.sin(t * 13)) * (t > 5.5 ? 1 : 0);
    if (t >= 54.2) { A.aRx = -1.15 - 1.25 * toast; A.aRz = 0.15; A.mouth += 0.5; }
    if (shot.turn) { faceScreen(P, 'h', t); faceScreen(A, 'a', t); P.aRx = -1.05; }
    if (talking('h', t) && env > 0.1) P.open = Math.max(P.open, Math.min(1, 0.08 + env * 1.15));
    if (talking('a', t) && env > 0.1) A.open = Math.max(A.open, Math.min(1, 0.08 + env * 1.15));
    poseKid(hero, P, t, 0.3); poseKid(friend, A, t, 1.9); friend.g.visible = t >= 5.45; frGlass.visible = t >= 54.2;
    const spin = smooth(21.7, 22.6, t) * Math.PI * 2, raise = win(t, 5.35, 6.3, 0.2) + smooth(55.5, 55.9, t);
    botAt(t, env, 0.1, shot.turn ? 1.7 : 2.02, -0.55, botLook(t) + spin, shot.turn ? 0 : 0.06);
    botGlass.position.set(bot.g.position.x + 0.62, bot.g.position.y - 0.25 + 0.22 * raise, bot.g.position.z + 0.1); botGlass.rotation.z = -0.25 * raise;
    // espuma do espumante
    hero.g.updateMatrixWorld(true); tip.getWorldPosition(tipW);
    foam.forEach((f, i) => { const b = 0.3 + (i * 0.083) % 3.2, age = t - b - Math.floor((t - b) / 3.3) * 0; const a = t - b; f.visible = a > 0 && a < 0.9 && t < 4.4;
      if (f.visible) { f.position.set(tipW.x + (hash(i) - 0.5) * 1.1 * a, tipW.y + (1.6 + hash(i + 9)) * a - 2.6 * a * a, tipW.z + (hash(i + 5) - 0.2) * 0.8 * a); f.material.opacity = 1 - a / 0.9; f.scale.setScalar(1 + a * 1.5); } });
    const party = Math.max(win(t, 0.1, 5.6, 0.5), smooth(54.8, 55.1, t));
    confetti.forEach((c, i) => { c.visible = party > 0.02; if (!c.visible) return; const ph = (t * (0.22 + hash(i) * 0.12) + hash(i + 3)) % 1;
      c.position.set((hash(i + 1) - 0.5) * 3.6, 4.4 - ph * 4.6, 0.3 + hash(i + 2) * 1.6); c.rotation.set(t * 3 + i, t * 2.1 + i * 2, i); c.material.opacity = party; });
  }

  function frameFesta(t, env, shot) {
    const P = actor('h', t), A = actor('a', t);
    // clipador de costas, focado, ate "oferta milionaria"
    const faceCam = smooth(5.7, 6.15, t); if (faceCam < 1) { P.yaw = lerp(Math.PI - 0.25, 0.22 + Math.PI * 2 * 0, faceCam) ; P.aLx -= 0.9 * (1 - faceCam); P.aRx -= 0.9 * (1 - faceCam); if (faceCam === 0) { P.hy = 0.5 * win(t, 3.1, 3.8, 0.2); P.hp = 0.1; } }
    // amigo entra animado
    const inn = smooth(0.0, 0.95, t); A.x = lerp(2.6, 0.8, inn); A.hop += 0.07 * (1 - inn) * Math.abs(Math.sin(t * 13));
    // saida para a festa
    const out = smooth(56.7, 57.3, t);
    if (out > 0) { P.x += 3.6 * out; A.x += 3.6 * out; P.yaw = lerp(P.yaw, 1.45, Math.min(1, out * 3)); A.yaw = lerp(A.yaw, 1.45, Math.min(1, out * 3)); const hp_ = 0.08 * Math.abs(Math.sin(t * 13)); P.hop += hp_; A.hop += hp_; }
    if (shot.turn) { faceScreen(P, 'h', t); faceScreen(A, 'a', t); }
    if (talking('h', t) && env > 0.1) P.open = Math.max(P.open, Math.min(1, 0.08 + env * 1.15));
    if (talking('a', t) && env > 0.1) A.open = Math.max(A.open, Math.min(1, 0.08 + env * 1.15));
    poseKid(hero, P, t, 0.3); poseKid(friend, A, t, 1.9);
    const gone = t >= 57.3; hero.g.visible = !gone; friend.g.visible = !gone;
    // colar de festa: cai no "ta bom"
    const drop = smooth(54.5, 55.0, t); neck.visible = drop < 1; neck.position.y = 0.6 - 0.9 * drop; neck.scale.setScalar(1 - 0.5 * drop);
    // Claude: escondido atras do monitor ate "desde marco"
    const rise = smooth(7.85, 8.45, t), work = smooth(59.6, 60.5, t);
    bot.g.visible = rise > 0; halo.visible = rise > 0;
    botAt(t, env, 0.1, shot.turn ? 1.7 : lerp(1.0, 2.02, back(rise)), lerp(-1.25, -0.55, rise) - 0.5 * work, botLook(t) * (1 - work) + Math.PI * work, shot.turn ? 0 : 0.06, 0.25 * win(t, 12.6, 13.2, 0.15));
    // latinhas: uma some de fininho no "toma energetico"
    cans[5].position.x = -1.42 + 5 * 0.085 + 0.9 * smooth(31.75, 32.4, t); cans[5].position.z = -1.68 + 0.25 * smooth(31.75, 32.4, t);
    // celular vibrando e sendo silenciado
    const vib = Math.max(win(t, 41.1, 42.2, 0.08), win(t, 43.0, 44.1, 0.08));
    phone.rotation.z = 0.07 * vib * Math.sin(t * 95); phone.position.x = 0.55 + 0.012 * vib * Math.sin(t * 80);
    const flip = smooth(47.9, 48.5, t); phone.rotation.y = Math.PI * flip; phRing.material.opacity = 0.9 * win(t, 47.6, 48.9, 0.2); phRing.scale.setScalar(1.2 - 0.6 * smooth(47.6, 48.5, t)); phRing.rotation.set(0.2, t * 3, 0);
    drawPhone(t);
    // carros indo embora
    cars.forEach((c, i) => { const k = clamp((t - 57.2) / 1.4); c.rotation.y = Math.PI / 2; c.position.set(CARX + (i ? 0.95 : -0.95), 0, 2.4 - (k * k * 0.6 + k * 0.4) * (7.2 - i * 0.9) - i * 0.5); c.visible = t >= 57.15 && t < 58.6; });
    foam.forEach(f => (f.visible = false)); confetti.forEach(c => (c.visible = false));
    return work;
  }


  // ================= MODO CINEMA v2 (video "blender") =================
  // Cenario realista: quarto retro com sol de fim de tarde entrando pela persiana, madeira, computador antigo, estante,
  // abajur, planta e tapete. Sombras suaves (sol "de area" por sub-quadro), oclusao de ambiente (GTAO), motion blur e
  // anti-aliasing por acumulo de sub-quadros, foco seletivo, granulacao e cor de cinema. Personagens continuam low poly.
  const cine = { on: CINE, NS: 10, shutter: 0.5 / 30, sub: 0 };
  const ovl = id => document.getElementById(id);
  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();
  if (CINE) {
    const keep = new Set([hero.g, bot.g, halo]);
    cine.oldLights = [];
    scene.children.slice().forEach(o => { if (o.isLight) cine.oldLights.push(o); else if (!keep.has(o) && !o.isCamera) o.visible = false; });
    cine.bg = new THREE.Color(0x0b0806); cine.uglyBg = new THREE.Color(0x8c8c8c);
    scene.background = cine.bg;
    cine.fog = new THREE.FogExp2(0x24180f, 0.012); scene.fog = cine.fog;
    scene.environmentIntensity = 0.07; renderer.toneMappingExposure = 0.92;
    const set = new THREE.Group(); scene.add(set);
    const R = mulberry32(77);
    const cvTex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; };
    const box = (w, h, d, m, x, y, z, parent = set) => { const r = Math.min(0.014, Math.min(w, h, d) * 0.3); const o = new THREE.Mesh(r > 0.0025 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
    const woodTex = (base, planks, rep) => cvTex(1024, 1024, (x, w, h) => {
      const ph = h / planks;
      for (let i = 0; i < planks; i++) {
        const c = new THREE.Color(base); c.offsetHSL((R() - 0.5) * 0.015, (R() - 0.5) * 0.06, (R() - 0.5) * 0.07);
        x.fillStyle = '#' + c.getHexString(); x.fillRect(0, i * ph, w, ph);
        for (let k = 0; k < 46; k++) {
          x.strokeStyle = R() < 0.6 ? `rgba(30,15,5,${0.05 + R() * 0.08})` : `rgba(255,225,190,${0.03 + R() * 0.05})`; x.lineWidth = 0.8 + R() * 2.4; x.beginPath();
          const y0 = i * ph + R() * ph, a = R() * 6, f = 0.003 + R() * 0.008, amp = ph * (0.05 + R() * 0.12);
          for (let xx = 0; xx <= w; xx += 12) x.lineTo(xx, y0 + Math.sin(xx * f + a) * amp);
          x.stroke();
        }
        x.fillStyle = 'rgba(20,10,4,.55)'; x.fillRect(0, i * ph, w, Math.max(2, ph * 0.02)); x.fillRect(R() * w, i * ph, 3, ph);
      }
    }, rep);
    const plasterTex = cvTex(512, 512, (x, w, h) => { x.fillStyle = '#e8e2da'; x.fillRect(0, 0, w, h); for (let i = 0; i < 12000; i++) { const v = 170 + R() * 85 | 0; x.fillStyle = `rgba(${v},${v - 6},${v - 12},.22)`; const s = 1 + R() * 3; x.fillRect(R() * w, R() * h, s, s); } }, [3, 2]);
    const relief = (m, k) => { m.bumpMap = m.map; m.bumpScale = k; m.roughnessMap = m.map; return m; };
    const floorM = relief(new THREE.MeshStandardMaterial({ map: woodTex('#8a5a36', 8, [2.2, 3]), roughness: 0.75 }), 1.2);
    const wallM = new THREE.MeshStandardMaterial({ map: plasterTex, color: 0xb59c80, roughness: 0.95 }); wallM.bumpMap = plasterTex; wallM.bumpScale = 1.6;
    const panelM = relief(new THREE.MeshStandardMaterial({ map: woodTex('#4a2c1a', 6, [3, 1]), roughness: 0.9 }), 0.8);
    const deskWoodM = relief(new THREE.MeshStandardMaterial({ map: woodTex('#7a4a2a', 5, [1, 1]), roughness: 0.65 }), 0.6);
    const beigeM = new THREE.MeshStandardMaterial({ color: 0xd9ceb2, roughness: 0.55 });
    const beigeD = new THREE.MeshStandardMaterial({ color: 0xb9ad90, roughness: 0.6 });
    const darkM = new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 0.5 });
    const metalM = new THREE.MeshStandardMaterial({ color: 0x2f4a3c, roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide });
    const frameM = new THREE.MeshStandardMaterial({ color: 0xe9e1d2, roughness: 0.5 });

    // piso, paredes e teto (parede esquerda com a janela)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 11.4), floorM); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.002, 3.3); floor.receiveShadow = true; set.add(floor);
    const backW = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.5), wallM); backW.position.set(0, 2.25, -2.4); backW.receiveShadow = true; set.add(backW);
    box(6.6, 1.05, 0.04, panelM, 0, 0.525, -2.38); box(6.6, 0.05, 0.07, panelM, 0, 1.06, -2.37); box(6.6, 0.12, 0.05, panelM, 0, 0.06, -2.36);
    const rw = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 4.5), wallM); rw.rotation.y = -Math.PI / 2; rw.position.set(3.3, 2.25, 2.3); rw.receiveShadow = true; set.add(rw);
    box(0.05, 0.12, 9.4, panelM, 3.27, 0.06, 2.3);
    const WX = -3.25, WZ0 = -1.9, WZ1 = 2.3, WY0 = 1.0, WY1 = 3.85, WZC = (WZ0 + WZ1) / 2, WZL = WZ1 - WZ0;
    box(0.12, 4.5, WZ0 + 2.4, wallM, WX, 2.25, (-2.4 + WZ0) / 2);
    box(0.12, 4.5, 7.0 - WZ1, wallM, WX, 2.25, (WZ1 + 7.0) / 2);
    box(0.12, WY0, WZL, wallM, WX, WY0 / 2, WZC);
    box(0.12, 4.5 - WY1, WZL, wallM, WX, (WY1 + 4.5) / 2, WZC);
    box(6.8, 0.12, 11.6, wallM, 0, 4.56, 3.3);
    // janela: moldura, peitoril, travessas e persiana
    box(0.32, 0.05, WZL + 0.3, frameM, WX + 0.12, WY0 - 0.02, WZC);
    box(0.14, 0.06, WZL + 0.12, frameM, WX, WY1 + 0.03, WZC);
    for (const z of [WZ0 - 0.03, WZ1 + 0.03, WZC]) box(0.14, WY1 - WY0, 0.06, frameM, WX, (WY0 + WY1) / 2, z);
    box(0.1, 0.045, WZL, frameM, WX, (WY0 + WY1) / 2 + 0.25, WZC);
    const slatM = new THREE.MeshStandardMaterial({ color: 0xefe6d4, roughness: 0.6, side: THREE.DoubleSide });
    cine.slats = [];
    const NSL = 28;
    for (let i = 0; i < NSL; i++) { const y = WY1 - 0.08 - i * ((WY1 - WY0 - 0.12) / (NSL - 1)); const s = box(0.115, 0.006, WZL - 0.04, slatM, WX + 0.13, y, WZC); s.rotation.z = -0.1; cine.slats.push(s); }
    box(0.1, 0.06, WZL, frameM, WX + 0.13, WY1 - 0.01, WZC);
    // ceu de fim de tarde la fora
    const skyTex = cvTex(64, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6f8fd0'); g.addColorStop(0.42, '#ffc98a'); g.addColorStop(0.58, '#ffe6b8'); g.addColorStop(0.72, '#ff9a5a'); g.addColorStop(1, '#4a3038'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    cine.sky = new THREE.Mesh(new THREE.PlaneGeometry(22, 10), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false, fog: false })); cine.sky.material.color.setScalar(1.6);
    cine.sky.rotation.y = Math.PI / 2; cine.sky.position.set(-7.5, 2.2, -0.3); set.add(cine.sky);
    cine.nBase = set.children.length;   // ate aqui: piso, paredes, janela e ceu (o modo bonecos esconde o resto do quarto)

    // mesa de madeira
    const DX = -0.55, DZ = -1.9, DY = 0.92;
    box(3.0, 0.06, 0.9, deskWoodM, DX, DY - 0.03, DZ);
    box(0.06, DY - 0.06, 0.84, deskWoodM, DX - 1.45, (DY - 0.06) / 2, DZ);
    box(0.6, DY - 0.06, 0.84, deskWoodM, DX + 1.17, (DY - 0.06) / 2, DZ);
    for (let i = 0; i < 3; i++) { box(0.54, 0.24, 0.02, deskWoodM, DX + 1.17, 0.16 + i * 0.27, DZ + 0.43); box(0.12, 0.02, 0.03, metalM, DX + 1.17, 0.2 + i * 0.27, DZ + 0.455); }
    box(2.3, 0.5, 0.02, deskWoodM, DX - 0.25, DY - 0.32, DZ - 0.38);

    // computador retro (bege) com a tela que mostra os cartoes do roteiro
    const crt = new THREE.Group(); crt.position.set(-1.25, DY, -1.95); crt.rotation.y = 0.32; set.add(crt);
    box(1.0, 0.2, 0.85, beigeM, 0, 0.1, 0.05, crt);
    box(0.36, 0.02, 0.01, darkM, -0.22, 0.13, 0.476, crt); box(0.36, 0.02, 0.01, darkM, -0.22, 0.07, 0.476, crt);
    box(0.025, 0.012, 0.01, new THREE.MeshBasicMaterial({ color: 0x5dff7a, toneMapped: false }), 0.38, 0.1, 0.476, crt);
    box(0.98, 0.84, 0.16, beigeM, 0, 0.62, 0.28, crt);
    box(0.78, 0.66, 0.55, beigeD, 0, 0.6, -0.06, crt);
    box(0.5, 0.45, 0.2, beigeD, 0, 0.58, -0.4, crt);
    for (const kx of [0.33, 0.4]) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12), darkM); kn.rotation.x = Math.PI / 2; kn.position.set(kx, 0.27, 0.37); crt.add(kn); }
    const scrBorder = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.64), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.3 })); scrBorder.position.set(0, 0.64, 0.3605); crt.add(scrBorder);
    cine.screen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.56), tMat); cine.screen.position.set(0, 0.64, 0.362); crt.add(cine.screen);
    const scan = cvTex(8, 8, x => { x.clearRect(0, 0, 8, 8); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, 0, 8, 3); }, [1, 95]);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.56), new THREE.MeshBasicMaterial({ map: scan, transparent: true, toneMapped: false, depthWrite: false })); sc.position.set(0, 0.64, 0.3625); crt.add(sc);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.6), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.3, transparent: true, opacity: 0.07, envMapIntensity: 0.5 })); glass.position.set(0, 0.64, 0.364); /* sem vidro: reflexo lavava a tela */
    const note = box(0.12, 0.12, 0.003, new THREE.MeshStandardMaterial({ color: 0xf5d94a, roughness: 0.8 }), 0.4, 0.97, 0.3615, crt); note.rotation.z = 0.1;
    cine.scrL = new THREE.PointLight(0x9cc8ff, 1.0, 3, 2); cine.scrL.position.set(0, 0.64, 0.8); crt.add(cine.scrL);
    // teclado, mouse, caneca, disquetes, papeis, livros
    const kbG = new THREE.Group(); kbG.position.set(-0.98, DY, -1.47); kbG.rotation.y = 0.2; set.add(kbG);
    box(0.86, 0.035, 0.28, beigeM, 0, 0.0175, 0, kbG);
    const keys = new THREE.InstancedMesh(new RoundedBoxGeometry(0.044, 0.022, 0.044, 2, 0.006), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), 85); keys.castShadow = keys.receiveShadow = true;
    { const m4 = new THREE.Matrix4(), cK = new THREE.Color(); let ki = 0;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 17; c++) { m4.makeTranslation(-0.39 + c * 0.049, 0.045 + r * 0.004, 0.1 - r * 0.049); keys.setMatrixAt(ki, m4); keys.setColorAt(ki, cK.setHex(c > 13 || r === 4 ? 0x9a9284 : 0xe6dcc4)); ki++; } }
    kbG.add(keys);
    box(0.26, 0.004, 0.22, new THREE.MeshStandardMaterial({ color: 0x23303a, roughness: 0.9 }), -0.32, DY + 0.002, -1.5);
    box(0.065, 0.03, 0.11, beigeM, -0.32, DY + 0.019, -1.5);
    const cer = new THREE.MeshStandardMaterial({ color: 0xc94c3a, roughness: 0.35 });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.046, 0.11, 24), cer); mug.position.set(0.18, DY + 0.055, -1.62); mug.castShadow = mug.receiveShadow = true; set.add(mug);
    const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 16), cer); hdl.position.set(0.235, DY + 0.06, -1.62); hdl.castShadow = true; set.add(hdl);
    [0x2d4a8a, 0x1e1e1e, 0xb83a2e].forEach((c, i) => { const f = box(0.1, 0.008, 0.1, new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }), -0.15, DY + 0.004 + i * 0.009, -1.82); f.rotation.y = (R() - 0.5) * 0.6; });
    [[0.38, -1.78, 0.2], [0.42, -1.74, -0.15]].forEach(([x, z, r]) => { const p = box(0.21, 0.002, 0.29, new THREE.MeshStandardMaterial({ color: 0xf1ece0, roughness: 0.9 }), x, DY + 0.002, z); p.rotation.y = r; });
    [[0x3a5a7a, 0.05], [0x8a3a2a, 0.04], [0xd8c8a0, 0.045]].forEach(([c, h], i) => { const b = box(0.3, h, 0.22, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }), 0.72, DY + 0.03 + i * 0.047, -2.12); b.rotation.y = (R() - 0.5) * 0.3; });
    // abajur articulado
    const rod = (a, b, r, m) => { const d = b.clone().sub(a); const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); o.castShadow = true; set.add(o); return o; };
    const LB = new THREE.Vector3(0.5, DY + 0.04, -2.12), LE = new THREE.Vector3(0.47, DY + 0.66, -2.02), LH = new THREE.Vector3(0.24, DY + 0.6, -1.78);
    const lbase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.04, 24), metalM); lbase.position.set(LB.x, DY + 0.02, LB.z); lbase.castShadow = lbase.receiveShadow = true; set.add(lbase);
    rod(LB, LE, 0.013, metalM); rod(LE, LH, 0.013, metalM);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.17, 24, 1, true), metalM); shade.position.copy(LH).add(new THREE.Vector3(0, -0.05, 0)); shade.rotation.z = 0.3; shade.castShadow = true; set.add(shade);
    cine.bulbM = new THREE.MeshBasicMaterial({ color: 0xffe0b0, toneMapped: false });
    const bulbP = LH.clone().add(new THREE.Vector3(-0.02, -0.11, 0)); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), cine.bulbM); bulb.position.copy(bulbP); set.add(bulb);
    cine.lamp = new THREE.SpotLight(0xffc988, 2.5, 3.5, 0.8, 0.7, 2); cine.lamp.position.copy(bulbP).add(new THREE.Vector3(0, -0.03, 0)); cine.lamp.target.position.set(-0.1, DY, -1.62);
    cine.lamp.castShadow = true; cine.lamp.shadow.mapSize.set(1024, 1024); cine.lamp.shadow.bias = -0.0006; scene.add(cine.lamp, cine.lamp.target);
    // estante com livros
    const shelfM = new THREE.MeshStandardMaterial({ map: woodTex('#5a3620', 4, [1, 2]), roughness: 0.55 });
    const SX = 2.15, SZ = -2.18, SW = 1.15, SH = 2.5, SD = 0.38;
    box(0.04, SH, SD, shelfM, SX - SW / 2, SH / 2, SZ); box(0.04, SH, SD, shelfM, SX + SW / 2, SH / 2, SZ); box(SW, SH, 0.02, shelfM, SX, SH / 2, SZ - SD / 2);
    const shelfYs = [0.08, 0.6, 1.1, 1.6, 2.1, 2.49];
    shelfYs.forEach(y => box(SW, 0.035, SD, shelfM, SX, y, SZ));
    const bookCols = [0x7a2e22, 0x2c4a6e, 0xc9a24a, 0x3d5a3a, 0x8c6a4a, 0x5a2c4a, 0xd8cdb4, 0x1f2a36, 0xa8452e, 0x6b7a5a];
    for (let s = 0; s < 5; s++) {
      let x = SX - SW / 2 + 0.04; const y0 = shelfYs[s] + 0.0175, lim = SX + SW / 2 - 0.04 - (s % 2 ? 0.32 : 0.06);
      while (x < lim) { const w = 0.03 + R() * 0.045, h = 0.24 + R() * 0.17, d = 0.2 + R() * 0.1; if (x + w > lim) break;
        const b = box(w, h, d, new THREE.MeshStandardMaterial({ color: bookCols[(R() * bookCols.length) | 0], roughness: 0.7 }), x + w / 2, y0 + h / 2, SZ + 0.03);
        if (R() < 0.08) { b.rotation.z = 0.22; b.position.x += 0.04; x += 0.05; } x += w + 0.003; }
      if (s % 2) { const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x3c6e6a, roughness: 0.3 })); vase.position.set(lim + 0.16, y0 + 0.1, SZ); vase.castShadow = vase.receiveShadow = true; set.add(vase); }
    }
    // quadros na parede
    const posterTex = cvTex(600, 840, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#efe2c8'); g.addColorStop(0.6, '#f3d6a8'); g.addColorStop(1, '#e8b27a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#e0683e'; x.beginPath(); x.arc(w / 2, h * 0.52, w * 0.3, Math.PI, 0); x.fill();
      x.fillStyle = '#efe2c8'; for (let i = 0; i < 6; i++) x.fillRect(0, h * 0.4 + i * 22 + i * i * 2, w, 5 + i * 2);
      x.fillStyle = '#2f5a5c'; x.beginPath(); x.moveTo(0, h * 0.62); for (let i = 0; i <= 10; i++) x.lineTo(i * w / 10, h * (0.55 + 0.06 * Math.sin(i * 1.9))); x.lineTo(w, h); x.lineTo(0, h); x.fill();
      x.fillStyle = '#f6e8cf'; x.textAlign = 'center'; x.font = "900 66px Montserrat"; x.fillText('NIGHT DRIVE', w / 2, h * 0.86); x.font = "600 26px Montserrat"; x.fillText('— 1986 —', w / 2, h * 0.92); });
    box(0.78, 1.06, 0.03, new THREE.MeshStandardMaterial({ color: 0x6a4428, roughness: 0.5 }), -0.2, 2.62, -2.37);
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.98), new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.7 })); poster.position.set(-0.2, 2.62, -2.353); poster.receiveShadow = true; set.add(poster);
    const photoTex = cvTex(300, 240, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2c5a6a'); g.addColorStop(1, '#c9a46a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(20,30,30,.7)'; x.beginPath(); x.moveTo(0, h); x.lineTo(w * 0.35, h * 0.45); x.lineTo(w * 0.6, h * 0.7); x.lineTo(w * 0.8, h * 0.5); x.lineTo(w, h); x.fill(); });
    box(0.46, 0.38, 0.025, new THREE.MeshStandardMaterial({ color: 0x6a4428, roughness: 0.5 }), 0.75, 2.35, -2.37);
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.3), new THREE.MeshStandardMaterial({ map: photoTex, roughness: 0.6 })); photo.position.set(0.75, 2.35, -2.355); set.add(photo);
    // planta perto da janela
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.42, 20), new THREE.MeshStandardMaterial({ color: 0xa8583a, roughness: 0.85 })); pot.position.set(-2.7, 0.21, -1.95); pot.castShadow = pot.receiveShadow = true; set.add(pot);
    const leafM = new THREE.MeshStandardMaterial({ color: 0x3f6e3a, roughness: 0.6, flatShading: true, side: THREE.DoubleSide });
    for (let i = 0; i < 20; i++) { const a = i * 2.39996, up = 0.45 + R() * 0.5; const dir = new THREE.Vector3(Math.cos(a) * (1 - up), up + 0.3, Math.sin(a) * (1 - up)).normalize();
      const lf = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4), leafM); lf.scale.set(0.075, 0.38 + R() * 0.2, 0.018); lf.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); lf.rotateY(R() * 3);
      lf.position.set(-2.7, 0.42, -1.95).addScaledVector(dir, 0.3); lf.castShadow = lf.receiveShadow = true; set.add(lf); }
    // tapete
    const rugTex = cvTex(512, 384, (x, w, h) => { x.fillStyle = '#7a3a2c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e2cfa8'; x.lineWidth = 10; x.strokeRect(22, 22, w - 44, h - 44); x.strokeStyle = '#2d4b54'; x.lineWidth = 6; x.strokeRect(44, 44, w - 88, h - 88);
      for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? '#c99a5a' : '#2d4b54'; x.beginPath(); const cx = 100 + i * 52; x.moveTo(cx, h / 2 - 40); x.lineTo(cx + 22, h / 2); x.lineTo(cx, h / 2 + 40); x.lineTo(cx - 22, h / 2); x.fill(); }
      for (let i = 0; i < 20000; i++) { x.fillStyle = `rgba(0,0,0,${R() * 0.12})`; x.fillRect(R() * w, R() * h, 2, 2); } });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.0), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0.05, 0.006, 0.55); rug.receiveShadow = true; set.add(rug);

    // cortinas de tecido ao lado da janela
    const curtM = new THREE.MeshStandardMaterial({ color: 0xa8743e, roughness: 1, side: THREE.DoubleSide });
    for (const z0 of [WZ0 - 0.32, WZ1 + 0.32]) {
      const g = new THREE.PlaneGeometry(0.62, 3.3, 48, 1); const pa = g.attributes.position;
      for (let i = 0; i < pa.count; i++) { const u = pa.getX(i); pa.setZ(i, 0.045 * Math.sin(u * 38) + 0.02 * Math.sin(u * 91)); }
      g.computeVertexNormals(); const c = new THREE.Mesh(g, curtM); c.rotation.y = Math.PI / 2; c.position.set(WX + 0.2, 2.42, z0); c.castShadow = c.receiveShadow = true; set.add(c);
    }
    box(0.03, 0.03, WZL + 1.6, metalM, WX + 0.2, 4.1, WZC);
    // cadeira de escritorio
    const chair = new THREE.Group(); chair.position.set(1.15, 0, -1.15); chair.rotation.y = -0.7; set.add(chair);
    const fab = new THREE.MeshStandardMaterial({ color: 0x3a3330, roughness: 0.95 });
    box(0.5, 0.08, 0.48, fab, 0, 0.52, 0, chair); box(0.46, 0.55, 0.07, fab, 0, 0.88, -0.24, chair);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 12), metalM); pole.position.y = 0.3; pole.castShadow = true; chair.add(pole);
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const leg = box(0.32, 0.03, 0.04, darkM, Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.16, chair); leg.rotation.y = -a;
      const wh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), darkM); wh.position.set(Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3); wh.castShadow = true; chair.add(wh); }
    // caixinhas de som, porta-lapis, cacto
    for (const sx of [-2.0, -0.55]) { const sp = box(0.16, 0.24, 0.16, beigeD, sx, DY + 0.12, -2.05); sp.rotation.y = sx < -1 ? 0.3 : -0.2;
      const cone = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), darkM); cone.position.set(0, 0.03, 0.081); sp.add(cone); }
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0x26323a, roughness: 0.4, side: THREE.DoubleSide })); cup.position.set(0.05, DY + 0.05, -2.08); cup.castShadow = true; set.add(cup);
    [0xe8c547, 0xd94a3a, 0x3a6ad9, 0x2a2a2a].forEach((c, i) => { const pn = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.18, 6), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })); pn.position.set(0.05 + Math.cos(i * 1.6) * 0.015, DY + 0.11, -2.08 + Math.sin(i * 1.6) * 0.015); pn.rotation.set(Math.sin(i) * 0.25, 0, Math.cos(i) * 0.25); pn.castShadow = true; set.add(pn); });
    const cpot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.07, 16), new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.8 })); cpot.position.set(-1.88, DY + 0.035, -1.6); cpot.castShadow = true; set.add(cpot);
    const cac = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.07, 4, 8), new THREE.MeshStandardMaterial({ color: 0x4f7a45, roughness: 0.7, flatShading: true })); cac.position.set(-1.88, DY + 0.12, -1.6); cac.castShadow = true; set.add(cac);
    // cabos saindo do computador
    const cabM = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
    for (const [a, b, c] of [[[-1.35, DY + 0.3, -2.3], [-1.5, DY - 0.1, -2.36], [-1.6, 0.02, -2.3]], [[-1.15, DY + 0.1, -2.3], [-1.0, DY - 0.3, -2.37], [-0.8, 0.02, -2.32]]]) {
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(...a), new THREE.Vector3(...b), new THREE.Vector3(...c), new THREE.Vector3(c[0] + 0.4, 0.01, c[2] + 0.05)]), 40, 0.009, 6), cabM); tube.castShadow = true; set.add(tube); }
    // tomada e interruptor
    box(0.08, 0.12, 0.01, frameM, -0.95, 0.3, -2.355); box(0.08, 0.12, 0.01, frameM, 2.9, 1.25, -2.395);
    // prateleira na parede com objetos
    box(0.9, 0.03, 0.22, deskWoodM, 0.95, 1.85, -2.29);
    [[0x8a3a2a, 0.04, 0.18], [0x2c4a6e, 0.035, 0.2], [0xc9a24a, 0.05, 0.16]].forEach(([c, w, h], i) => box(w, h, 0.15, new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }), 0.6 + i * 0.05, 1.865 + h / 2, -2.29));
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), new THREE.MeshStandardMaterial({ color: 0x3d6e8a, roughness: 0.4 })); globe.position.set(1.15, 1.95, -2.29); globe.castShadow = true; set.add(globe);
    box(0.04, 0.02, 0.04, metalM, 1.15, 1.875, -2.29);

    // luzes: sol pela persiana, ceu azul de preenchimento, luz rebatida quente, contra frio, abajur e tela
    cine.sunDir = new THREE.Vector3(0.75, -0.5, -0.45).normalize();
    cine.sunT = new THREE.Vector3(-0.5, 1.3, -0.9);
    cine.sun = new THREE.DirectionalLight(0xffb06a, 7); cine.sun.castShadow = true;
    cine.sun.shadow.mapSize.set(4096, 4096); Object.assign(cine.sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 }); cine.sun.shadow.bias = -0.0002; cine.sun.shadow.normalBias = 0.025;
    cine.sun.target.position.copy(cine.sunT); scene.add(cine.sun, cine.sun.target);
    cine.hemi = new THREE.HemisphereLight(0x9fb4ff, 0x6a4630, 0.42); scene.add(cine.hemi);
    cine.bounce = new THREE.PointLight(0xff9a55, 2.5, 6, 2); cine.bounce.position.set(-0.5, 1.1, -0.9); scene.add(cine.bounce);
    RectAreaLightUniformsLib.init();
    cine.winL = new THREE.RectAreaLight(0xffd2a0, 2.2, WZL, WY1 - WY0); cine.winL.position.set(WX + 0.1, (WY0 + WY1) / 2, WZC); cine.winL.lookAt(0, (WY0 + WY1) / 2, WZC); scene.add(cine.winL);
    cine.cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType }); cine.cubeCam = new THREE.CubeCamera(0.05, 40, cine.cubeRT); cine.cubeCam.position.set(-0.2, 1.5, -0.3); scene.add(cine.cubeCam);
    cine.rimL = new THREE.DirectionalLight(0x86a0ff, 0.8); cine.rimL.position.set(4, 3.5, -3); scene.add(cine.rimL);
    cine.uglyHemi = new THREE.HemisphereLight(0xffffff, 0x808080, 2.4); cine.uglyHemi.visible = false; scene.add(cine.uglyHemi);
    cine.ugly = new THREE.MeshLambertMaterial({ color: 0x9c9c9c });

    // feixes de luz entre as laminas da persiana + poeira
    cine.shafts = new THREE.Group(); scene.add(cine.shafts);
    const shTex = cvTex(256, 4, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    shTex.colorSpace = THREE.NoColorSpace;
    const xA = cine.sunDir.clone(), zA = new THREE.Vector3(0, 0, 1).addScaledVector(xA, -xA.z).normalize(), yA = new THREE.Vector3().crossVectors(zA, xA);
    const qb = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA));
    const SL = 4.2; cine.shaftOp = 0.013; const gaps = [];
    for (let i = 0; i < NSL - 1; i++) {
      const y = (cine.slats[i].position.y + cine.slats[i + 1].position.y) / 2; gaps.push(y);
      const g = new THREE.BoxGeometry(SL, 0.04, WZL - 0.1); g.translate(SL / 2, 0, 0);
      const sh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffc890, alphaMap: shTex, transparent: true, opacity: cine.shaftOp, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }));
      sh.quaternion.copy(qb); sh.position.set(WX + 0.15, y, WZC); cine.shafts.add(sh);
    }
    { const N = 900, pos = new Float32Array(N * 3); cine.dustSeed = [];
      for (let i = 0; i < N; i++) { const p = new THREE.Vector3(WX + 0.15, gaps[(R() * gaps.length) | 0] + (R() - 0.5) * 0.06, WZ0 + 0.1 + R() * (WZL - 0.2)).addScaledVector(xA, R() * SL * 0.75); cine.dustSeed.push(p); pos.set([p.x, p.y, p.z], i * 3); }
      const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      cine.dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffe2b8, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false })); scene.add(cine.dust); }

    // pos-processamento: AO e foco (sem os feixes, que nao tem superficie), acumulo de sub-quadros e cor de cinema
    class Hook extends Pass { constructor(fn) { super(); this.fn = fn; this.needsSwap = false; } render() { this.fn(); } }
    cine.gtao = new GTAOPass(scene, camera, 1080, 1920); cine.gtao.output = GTAOPass.OUTPUT.Default; cine.gtao.blendIntensity = 1.0;
    cine.gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.5, thickness: 1.5, scale: 1.0, samples: 16 });
    cine.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 });
    cine.bokeh = new BokehPass(scene, camera, { focus: 3, aperture: 0.002, maxblur: 0.006 });
    composer.insertPass(new Hook(() => { cine.fxVis = cine.shafts.visible; cine.haloVis = halo.visible; cine.shafts.visible = cine.dust.visible = halo.visible = false; }), 1);
    composer.insertPass(cine.gtao, 2); composer.insertPass(cine.bokeh, 3);
    composer.insertPass(new Hook(() => { cine.shafts.visible = cine.dust.visible = cine.fxVis; halo.visible = cine.haloVis; }), 4);
    composer.renderToScreen = false;
    const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
    cine.acc = new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType });
    cine.accQ = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, w: { value: 0.1 } }, vertexShader: VS,
      fragmentShader: 'uniform sampler2D tDiffuse; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tDiffuse, vUv).rgb * w, 1.0); }',
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false }));
    cine.gradeQ = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amount: { value: 1 } }, vertexShader: VS, depthTest: false, depthWrite: false,
      fragmentShader: `uniform sampler2D tDiffuse; uniform float time; uniform float amount; varying vec2 vUv;
        float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){
          vec2 d = vUv - 0.5; float r = dot(d, d);
          vec2 off = d * 0.0035 * amount;
          vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          c += amount * (vec3(-0.012, 0.008, 0.03) * (1.0 - l) + vec3(0.035, 0.012, -0.025) * l);
          c = mix(c, c * c * (3.0 - 2.0 * c), 0.18 * amount);
          c = c * (1.0 - 0.03 * amount) + 0.025 * amount;
          c *= 1.0 - amount * r * 0.8;
          // 14/11: sem granulado (no video em alta ficava cintilando)
          gl_FragColor = vec4(c, 1.0);
        }` }));

    // planos novos (clipador em x -0.4 z 0.3, Claude em x 0.55 z -0.1)
    set.updateMatrixWorld(true);
    const S = new THREE.Vector3(); cine.screen.getWorldPosition(S); const n = new THREE.Vector3(0, 0, 1).applyQuaternion(crt.quaternion);
    const atScr = (k, dy) => S.clone().addScaledVector(n, k).add(new THREE.Vector3(0, dy, 0)).toArray();
    Object.assign(SHOTS, {
      EST: { p: [0.9, 2.5, 7.6], q: [-0.7, 1.6, -1.5], d: [-0.4, -0.25, -1.6], ease: true, fov: 50 },
      CH: { p: [0.3, 1.8, 3.8], q: [-0.4, 1.68, 0.3], d: [-0.1, 0, -0.3] },
      LOWH: { p: [0.1, 0.95, 3.3], q: [-0.42, 1.78, 0.3], d: [0.12, 0.05, -0.1] },
      CC: { p: [1.4, 2.2, 4.4], q: [0.55, 2.0, -0.1], d: [-0.08, 0, -0.25] },
      SCR: { p: atScr(3.0, 0.06), q: S.toArray(), d: n.clone().multiplyScalar(-0.45).toArray(), scr: true },
      SCRE: { p: atScr(3.4, 0.1), q: S.toArray(), d: n.clone().multiplyScalar(-1.0).toArray(), scr: true, ease: true },
      UG: { p: [0, 1.85, 5.7], q: [0, 1.55, -0.3], d: [0, 0, 0], still: true },
      UGH: { p: [-0.1, 1.75, 3.7], q: [-0.4, 1.62, 0.3], d: [0, 0, 0], still: true },
      UGC: { p: [0.8, 2.05, 3.2], q: [0.55, 2.0, -0.1], d: [0, 0, 0], still: true },
      REV: { p: [0.3, 1.8, 6.4], q: [-0.3, 1.75, -1.0], d: [-0.2, 0.15, -1.6], ease: true, fov: 44 },
      OTS: { p: [3.0, 2.0, 2.9], q: [0, 1.85, 0], d: [-0.25, 0, -0.3] },
      ORB: { orbit: [0.05, 1.85, 0.1, 4.5, 0.4, -0.15, 1.95], q: [0.05, 1.8, 0.1] },
      ORB2: { orbit: [0.05, 1.85, 0.1, 4.0, 0.6, -0.7, 2.2], q: [0.05, 1.85, 0.1] },
      W2: { p: [0.2, 2.1, 6.3], q: [-0.3, 1.8, -0.8], d: [0, 0, -0.6], fov: 42 },
      MOUTH: { p: [0.25, 1.62, 2.25], q: [-0.38, 1.55, 0.35], d: [0, 0, -0.1] },
    });
  }

  // ================= MODO BONECOS (serie de bonecos: 2 pessoas conversando numa loja) =================
  // Liga com `elenco` no roteiro: { h: visual do personagem principal (usa `heroi`), a: { pele, camisa, cabelo, calca, bigode, idoso } }.
  // O robo some; o segundo personagem ('a' nas falas) fica atras do balcao. `cena: 'loja'` monta a perfumaria.
  const BON = CINE && !!V.elenco;
  const bon = { hx: -0.45, hz: 0.35, ax: 0.62, az: -0.5 };
  if (BON) {
    const EA = V.elenco.a || {};
    const R2 = mulberry32(2024);
    const set = cine.screen.parent.parent;
    set.children.forEach((o, i) => { if (i >= cine.nBase) o.visible = false; });
    cine.lamp.visible = false; bot.g.visible = false; halo.visible = false;
    const st = document.createElement('style');
    st.textContent = '#sub.a{color:#f6d29a;font-style:normal} #sub.a b{color:#fff}';
    document.head.appendChild(st);

    // --- segundo personagem (ex.: Seu Valdir) ---
    const C = c => new THREE.Color(c).getHex();
    const skinA = EA.pele || '#e9b693', shirt = EA.camisa || '#D49A4E', hairA = EA.cabelo || '#c9c4bb';
    const val = buildKid({ skin: C(skinA), nose: C('#' + new THREE.Color(skinA).multiplyScalar(0.88).getHexString()), hood: C(shirt), hoodD: C('#' + new THREE.Color(shirt).multiplyScalar(0.8).getHexString()), pants: C(EA.calca || '#3b3a45'), hair: C(hairA), string: C(shirt) });
    scene.add(val.g); bon.val = val;
    [1, 2, 3, 4].forEach(i => (val.body.children[i].visible = false));        // tira bolso, cordinhas e capuz: vira camisa
    const torso = val.body.children[0]; torso.scale.set(1.12, 1, 0.9);          // barriguinha
    const shirtD = mat(C('#' + new THREE.Color(shirt).multiplyScalar(0.72).getHexString()));
    for (const s of [-1, 1]) { const col = mesh(new THREE.BoxGeometry(0.17, 0.05, 0.12), shirtD, s * 0.08, 0.63, 0.17, val.body); col.rotation.set(0.5, 0, s * 0.5); }
    for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.018, 8, 6), mat(0xf2ead8), 0, 0.5 - i * 0.14, 0.235 + i * 0.012, val.body);
    const VH = val.head;
    if (EA.idoso !== false) {
      for (let i = 4; i <= 8; i++) VH.children[i].visible = false;               // sem franja: testa alta
      const capA = VH.children[3]; capA.position.set(0, 0.43, -0.12); capA.scale.set(1.06, 0.72, 0.9);
      for (const s of [-1, 1]) { const side = mesh(new THREE.IcosahedronGeometry(0.16, 0), capA.material, s * 0.37, 0.4, -0.08, VH); side.scale.set(0.5, 1, 1.2); }
      [10, 12].forEach(i => { const b = VH.children[i]; if (b) b.scale.set(1.15, 1.6, 1); });
    }
    if (EA.bigode !== false) {
      const bm = mat(C(EA.bigodeCor || hairA));
      for (const s of [-1, 1]) { const m_ = mesh(new THREE.BoxGeometry(0.13, 0.045, 0.05), bm, s * 0.06, 0.258, 0.418, VH); m_.rotation.z = s * -0.22; m_.castShadow = false; }
    }
    if (EA.cabeloLongo) {      // cabelo comprido ate os ombros, cilios e corpo mais fino
      const hm = VH.children[3].material;
      const nuca = mesh(new THREE.IcosahedronGeometry(0.46, 1), hm, 0, 0.24, -0.17, VH); nuca.scale.set(1.05, 1.28, 0.72);
      for (const s of [-1, 1]) { const lock = mesh(new THREE.BoxGeometry(0.13, 0.62, 0.22), hm, s * 0.41, 0.12, 0.0, VH); lock.rotation.z = s * 0.07; }
      for (const e of [9, 11]) { const ey = VH.children[e]; if (ey && ey.isGroup) { const l = mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), mat(0x1a1220), 0, 0.07, 0.015, ey); l.castShadow = false; } }
      torso.scale.set(0.95, 1, 0.84);
    }

    // --- props do personagem principal: frasco na mao direita, celular na esquerda ---
    const glassM = (c, op = 0.55) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, transparent: true, opacity: op, envMapIntensity: 1.6 });
    const goldM = new THREE.MeshStandardMaterial({ color: 0xd8b05a, roughness: 0.28, metalness: 0.95 });
    const blackM = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.3, metalness: 0.5 });
    function bottle(kind, col, capM, sc = 1) {
      const g = new THREE.Group();
      const liq = new THREE.MeshStandardMaterial({ color: col, roughness: 0.25, emissive: col, emissiveIntensity: 0.12 });
      let h;
      if (kind === 0) { h = 0.2; mesh(new RoundedBoxGeometry(0.12, h, 0.065, 2, 0.012), glassM(0xffffff, 0.35), 0, h / 2, 0, g); mesh(new RoundedBoxGeometry(0.1, h * 0.82, 0.05, 2, 0.01), liq, 0, h / 2 - 0.005, 0, g); }
      else if (kind === 1) { h = 0.17; mesh(new THREE.CylinderGeometry(0.05, 0.055, h, 20), glassM(0xffffff, 0.35), 0, h / 2, 0, g); mesh(new THREE.CylinderGeometry(0.042, 0.046, h * 0.8, 20), liq, 0, h / 2 - 0.006, 0, g); }
      else if (kind === 2) { h = 0.14; const b = mesh(new THREE.SphereGeometry(0.075, 20, 14), glassM(0xffffff, 0.35), 0, 0.075, 0, g); b.scale.set(1, 0.95, 0.7); const l = mesh(new THREE.SphereGeometry(0.064, 20, 14), liq, 0, 0.07, 0, g); l.scale.set(1, 0.85, 0.65); }
      else { h = 0.22; const b = mesh(new THREE.CylinderGeometry(0.035, 0.06, h, 6), glassM(0xffffff, 0.35), 0, h / 2, 0, g); b.castShadow = true; mesh(new THREE.CylinderGeometry(0.028, 0.05, h * 0.8, 6), liq, 0, h / 2 - 0.008, 0, g); }
      mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.025, 10), goldM, 0, h + 0.012, 0, g);
      const cap = kind === 2 ? mesh(new THREE.SphereGeometry(0.035, 14, 10), capM, 0, h + 0.05, 0, g) : mesh(new RoundedBoxGeometry(0.06, 0.06, 0.06, 2, 0.012), capM, 0, h + 0.05, 0, g);
      g.scale.setScalar(sc); g.userData.h = h; return g;
    }
    bon.frasco = bottle(0, 0xd49a4e, goldM, 0.85); bon.frasco.position.set(0.0, -0.53, 0.07); bon.frasco.rotation.x = -0.15; hero.armR.add(bon.frasco);
    bon.cel = new THREE.Group(); hero.armL.add(bon.cel); bon.cel.position.set(0.04, -0.56, 0.03); bon.cel.rotation.set(0, Math.PI / 2, 0);
    bon.cel.add(new THREE.Mesh(new RoundedBoxGeometry(0.085, 0.17, 0.012, 2, 0.01), blackM));
    if (V.telaCelular) {   // 14/11: info = corte pra tela do celular dentro do 3D (a imagem do card fica deitada na tela)
      bon.cel.children[0].geometry = new RoundedBoxGeometry(0.155, 0.218, 0.012, 2, 0.012);
      const hold = new THREE.Group(); hold.position.z = -0.007; hold.rotation.y = Math.PI; bon.cel.add(hold);
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), new THREE.MeshBasicMaterial({ map: tTex, toneMapped: false })); sc.material.color.setScalar(0.88); sc.rotation.z = Math.PI / 2; hold.add(sc); bon.celScr = sc;
    } else { const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.155), new THREE.MeshBasicMaterial({ color: 0x9cc8ff, toneMapped: false })); sc.position.z = -0.007; sc.rotation.y = Math.PI; bon.cel.add(sc); }
    bon.celA = new THREE.Group(); val.armR.add(bon.celA); bon.celA.position.set(0.0, -0.58, 0.05); bon.celA.rotation.set(-1.25, 0, 0);
    const TL = !!V.telaCelular;
    bon.celA.add(new THREE.Mesh(TL ? new RoundedBoxGeometry(0.218, 0.155, 0.012, 2, 0.012) : new RoundedBoxGeometry(0.18, 0.095, 0.012, 2, 0.01), blackM));
    { const sc = new THREE.Mesh(TL ? new THREE.PlaneGeometry(0.2, 0.14) : new THREE.PlaneGeometry(0.165, 0.083), new THREE.MeshBasicMaterial({ map: tTex, toneMapped: false })); if (TL) sc.material.color.setScalar(0.88); sc.position.z = 0.007; bon.celA.add(sc); bon.celAscr = sc; }
    bon.caixa = new THREE.Group(); hero.armR.add(bon.caixa); bon.caixa.position.set(0.0, -0.6, 0.06);
    mesh(new RoundedBoxGeometry(0.13, 0.19, 0.07, 2, 0.01), new THREE.MeshStandardMaterial({ color: C(V.caixaCor || '#3a2340'), roughness: 0.45 }), 0, 0, 0, bon.caixa);
    mesh(new RoundedBoxGeometry(0.135, 0.03, 0.075, 2, 0.008), goldM, 0, 0.04, 0, bon.caixa);

    // --- cenario: 'loja' (perfumaria) ou 'escritorio' ---
    const CENA = V.cena || 'loja'; let face;
    const loja = new THREE.Group(); scene.add(loja); bon.loja = loja;
    const box2 = (w, h, d, m, x, y, z, parent = loja) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(0.012, Math.min(w, h, d) * 0.3)), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
    const wallP = new THREE.MeshStandardMaterial({ color: EA.parede || 0x24525a, roughness: 0.92 });
    const backP = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.5), wallP); backP.position.set(0, 2.25, -2.33); backP.receiveShadow = true; loja.add(backP);
    const woodL = new THREE.MeshStandardMaterial({ color: 0x6b4428, roughness: 0.55 });
    const woodD = new THREE.MeshStandardMaterial({ color: 0x3b2416, roughness: 0.6 });
    const ledM = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false });
    const cols = [0xd49a4e, 0xe8c27a, 0xb8456a, 0x7a3a9a, 0x2f6f7a, 0xf0e0c0, 0x2a2a30, 0xc8743a, 0x8ab0d8, 0xd9a0b8, 0x4a8a5a, 0xf2d27a];
    if (CENA === 'loja') {
    const shelfY = [1.15, 1.6, 2.05, 2.5, 2.95];
    for (const bx of [-1.95, 0, 1.95]) {
      box2(0.05, 2.1, 0.32, woodD, bx - 0.86, 2.05, -2.17); box2(0.05, 2.1, 0.32, woodD, bx + 0.86, 2.05, -2.17);
      box2(1.72, 0.06, 0.34, woodD, bx, 3.12, -2.17); box2(1.72, 1.0, 0.36, woodD, bx, 0.5, -2.15);
      for (const y of shelfY) {
        box2(1.7, 0.03, 0.3, woodL, bx, y, -2.17);
        const led = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.008, 0.008), ledM); led.position.set(bx, y - 0.02, -2.03); loja.add(led);
        if (y > 3) continue;
        let x = bx - 0.76;
        while (x < bx + 0.72) {
          const k = (R2() * 4) | 0, b = bottle(k, cols[(R2() * cols.length) | 0], R2() < 0.5 ? goldM : blackM, 0.85 + R2() * 0.35);
          b.position.set(x + 0.06, y + 0.015, -2.17 + (R2() - 0.5) * 0.08); b.rotation.y = (R2() - 0.5) * 0.5; loja.add(b); x += 0.15 + R2() * 0.08;
        }
      }
    }
    // letreiro "PERFUMARIA"
    { const c = document.createElement('canvas'); c.width = 1400; c.height = 220; const x = c.getContext('2d');
      x.font = '900 150px Montserrat'; x.textAlign = 'center'; x.fillStyle = '#ffd08a'; x.shadowColor = '#ff9a3c'; x.shadowBlur = 30; x.fillText('PERFUMARIA', 700, 165);
      const tx2 = new THREE.CanvasTexture(c); tx2.colorSpace = THREE.SRGBColorSpace; bon.letreiroCv = { c, x, tx2 };
      const p = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.44), new THREE.MeshBasicMaterial({ map: tx2, transparent: true, toneMapped: false })); p.position.set(0, 3.62, -2.3); loja.add(p); }
    // balcao de vidro com perfumes dentro e testers em cima
    const CX = 0.95, CZ = 0.18, CW = 1.75, CD = 0.55;
    box2(CW, 0.72, CD, woodD, CX, 0.36, CZ);
    box2(CW + 0.04, 0.04, CD + 0.04, woodL, CX, 0.74, CZ);
    const vit = new THREE.Mesh(new THREE.BoxGeometry(CW, 0.24, CD), glassM(0xdfeff0, 0.14)); vit.position.set(CX, 0.88, CZ); loja.add(vit);
    box2(CW + 0.04, 0.025, CD + 0.04, new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transparent: true, opacity: 0.22, clearcoat: 1 }), CX, 1.012, CZ);
    for (let i = 0; i < 9; i++) { const b = bottle(i % 4, cols[(i * 5) % cols.length], i % 2 ? goldM : blackM, 0.7); b.position.set(CX - CW / 2 + 0.15 + i * 0.18, 0.765, CZ + (i % 2 ? 0.08 : -0.08)); loja.add(b); }
    const vled = new THREE.Mesh(new THREE.BoxGeometry(CW - 0.05, 0.01, 0.01), ledM); vled.position.set(CX, 0.99, CZ + CD / 2 - 0.02); loja.add(vled);
    [[0.25, 0.28, 0], [0.42, 0.33, 2], [0.58, 0.25, 3]].forEach(([x, z, k], i) => { const b = bottle(k, cols[i * 3 + 1], goldM, 0.8); b.position.set(x, 1.03, z); loja.add(b); });
    const strips = new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.9 });
    for (let i = 0; i < 4; i++) { const s = box2(0.02, 0.003, 0.16, strips, 0.78 + i * 0.03, 1.03, 0.32); s.rotation.y = 0.3 + i * 0.12; }
    // pendentes sobre o balcao
    bon.pend = [];
    for (const px of [0.45, 1.45]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.2, 6), blackM); cord.position.set(px, 3.95, CZ); loja.add(cord);
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x1d2a2c, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide })); sh.position.set(px, 3.28, CZ); loja.add(sh);
      const bl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffe2b0, toneMapped: false })); bl.position.set(px, 3.2, CZ); loja.add(bl);
      const L = new THREE.PointLight(0xffc98a, 1.1, 4.5, 1.8); L.position.set(px, 3.1, CZ); scene.add(L); bon.pend.push(L);
    }
    }
    bon.shelfL = new THREE.RectAreaLight(0xffd6a0, 3.2, 6.0, 2.4); bon.shelfL.position.set(0, 2.1, -1.0); bon.shelfL.lookAt(0, 2.1, -2.4); scene.add(bon.shelfL);
    bon.fill = new THREE.PointLight(0xfff0e0, 1.4, 7, 1.6); bon.fill.position.set(-0.2, 2.4, 2.6); scene.add(bon.fill);
    if (CENA === 'loja') {
    // plaquinha pendurada (o desenho vem dos `cards` do roteiro)
    bon.placa = new THREE.Group(); bon.placa.position.set(1.62, 2.86, -1.98); loja.add(bon.placa); bon.placaCasa = bon.placa.position.clone();
    const pivot = new THREE.Group(); bon.placa.add(pivot); bon.placaPiv = pivot;
    box2(0.98, 0.72, 0.03, woodL, 0, -0.42, 0, pivot);
    const faceM = new THREE.MeshBasicMaterial({ map: tTex }); faceM.color.setScalar(0.86); face = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.63), faceM); face.position.set(0, -0.42, 0.017); pivot.add(face);
    for (const s of [-1, 1]) { const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.36, 6), blackM); fio.position.set(s * 0.22, -0.05, 0); fio.rotation.z = s * 0.55; pivot.add(fio); }
    } else if (CENA === 'copa') {
      // copa do escritorio: armarios, bancada, cafeteira, geladeira e a mesinha alta na frente da Bia
      const whiteM = new THREE.MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.55 });
      const grayM = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.4, metalness: 0.4 });
      const tampoM = new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.35 });
      box2(4.2, 0.9, 0.6, whiteM, -0.6, 0.45, -2.05); box2(4.24, 0.05, 0.64, tampoM, -0.6, 0.925, -2.05);
      for (let i = 0; i < 6; i++) box2(0.66, 0.84, 0.01, whiteM, -2.35 + i * 0.7, 0.45, -1.745);
      for (let i = 0; i < 6; i++) box2(0.12, 0.02, 0.02, grayM, -2.35 + i * 0.7, 0.75, -1.735);
      box2(4.2, 0.75, 0.36, whiteM, -0.6, 2.6, -2.2);
      for (let i = 0; i < 6; i++) box2(0.12, 0.02, 0.02, grayM, -2.35 + i * 0.7, 2.32, -2.01);
      box2(0.8, 2.05, 0.7, new THREE.MeshStandardMaterial({ color: 0xdfe3e6, roughness: 0.35, metalness: 0.3 }), 2.05, 1.025, -1.95);
      box2(0.03, 0.5, 0.03, grayM, 1.72, 1.35, -1.58); box2(0.03, 0.3, 0.03, grayM, 1.72, 0.55, -1.58);
      const cafe = new THREE.Group(); cafe.position.set(-0.2, 0.95, -2.1); loja.add(cafe);
      box2(0.32, 0.42, 0.3, grayM, 0, 0.21, 0, cafe); box2(0.2, 0.02, 0.12, tampoM, 0, 0.06, 0.14, cafe);
      const luzC = new THREE.Mesh(new THREE.CircleGeometry(0.02, 12), new THREE.MeshBasicMaterial({ color: 0x5dff7a, toneMapped: false })); luzC.position.set(0.1, 0.35, 0.151); cafe.add(luzC);
      box2(0.48, 0.28, 0.34, grayM, -1.3, 1.09, -2.1);
      const canecas = [0x9C452A, 0xD49A4E, 0x7DBFB3, 0xE6AEB9];
      canecas.forEach((c, i) => { const m_ = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 })); m_.position.set(0.25 + i * 0.13, 1.0, -1.95); m_.castShadow = true; loja.add(m_); });
      const fruteira = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.6, side: THREE.DoubleSide })); fruteira.position.set(-2.0, 1.1, -2.0); loja.add(fruteira);
      [[0xd94a3a, 0], [0xf2c230, 1], [0x6aa84f, 2]].forEach(([c, i]) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })); f.position.set(-2.05 + i * 0.06, 1.0, -2.0 + (i - 1) * 0.04); loja.add(f); });
      // mesinha alta na frente da Bia, com cafe e a caixa de perfume vazia
      box2(1.5, 0.05, 0.62, tampoM, 1.0, 1.0, 0.3); box2(0.08, 1.0, 0.08, grayM, 1.0, 0.5, 0.3); box2(0.6, 0.03, 0.4, grayM, 1.0, 0.015, 0.3);
      const xic = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 18), whiteM); xic.position.set(0.55, 1.07, 0.35); xic.castShadow = true; loja.add(xic);
      const painel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.5), new THREE.MeshBasicMaterial({ color: 0xfff6e8, toneMapped: false })); painel.position.set(0.3, 4.48, 0.2); loja.add(painel);
      bon.pend = [new THREE.PointLight(0xfff2e0, 1.6, 6, 1.6)]; bon.pend[0].position.set(0.3, 3.9, 0.5); scene.add(bon.pend[0]);
      face = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ color: 0x222222 })); face.position.set(1.0, 1.5, 0.3); face.visible = false; loja.add(face);
    } else if (CENA === 'praca') {
      // 18/11 PRACA ao ar livre (Bidaya episodio unico): gramado, caminho de pedra, praca redonda com chafariz, bancos, postes,
      // arvores balancando, pipoqueiro, pombos, gente passando no fundo e predios no horizonte. Pernas com joelho (anda, corre, senta, ajoelha).
      bon.praca = true;
      set.children.forEach(o => (o.visible = false)); backP.visible = false;
      const RP = mulberry32(1811);
      const cvT = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; if (rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(...rep); } return tx; };
      const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o });
      // ceu com nuvens
      const skyT = cvT(1024, 1024, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3f7fcc'); g.addColorStop(0.3, '#78afe3'); g.addColorStop(0.46, '#cfe6f3'); g.addColorStop(0.5, '#e2eff3'); g.addColorStop(1, '#e2eff3'); x.fillStyle = g; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 18; i++) { const cx = RP() * w, cy = h * (0.16 + RP() * 0.26); for (let k = 0; k < 10; k++) { const ox = cx + (k - 5) * 14, oy = cy + (RP() - 0.5) * 14, r = 14 + RP() * 26; const gg = x.createRadialGradient(ox, oy, 0, ox, oy, r); gg.addColorStop(0, 'rgba(255,255,255,.8)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(ox - r, oy - r, 2 * r, 2 * r); } } });
      const ceu = new THREE.Mesh(new THREE.SphereGeometry(95, 48, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, toneMapped: false })); loja.add(ceu);
      cine.bg = new THREE.Color(0xcfe3ee); cine.fog = new THREE.FogExp2(0xd3e4ea, 0.016);
      // chao: grama + caminho reto (eixo x, onde eles andam) + praca redonda de pedra
      const grassT = cvT(512, 512, (x, w, h) => { x.fillStyle = '#5e8c3c'; x.fillRect(0, 0, w, h); for (let i = 0; i < 30000; i++) { const g = 120 + RP() * 80 | 0; x.fillStyle = `rgba(${g * 0.5 | 0},${g},${g * 0.35 | 0},.32)`; x.fillRect(RP() * w, RP() * h, 1 + RP() * 2, 2 + RP() * 5); } }, [60, 60]);
      const chao = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), M(0xffffff, { map: grassT, roughness: 0.97 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; loja.add(chao);
      const paveT = (rx, ry) => cvT(512, 512, (x, w, h) => { x.fillStyle = '#9c8e78'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) { const v = 196 + RP() * 34 | 0; x.fillStyle = `rgb(${v},${v - 10},${v - 30})`; x.fillRect(c * 64 - (r % 2) * 32 + 3, r * 64 + 3, 58, 58); } }, [rx, ry]);
      const PZ = 0.45;
      const cam_ = new THREE.Mesh(new THREE.PlaneGeometry(80, 2.2), M(0xffffff, { map: paveT(40, 1.1), roughness: 0.9 })); cam_.rotation.x = -Math.PI / 2; cam_.position.set(0, 0.006, PZ); cam_.receiveShadow = true; loja.add(cam_);
      const PC = [0, -3.4];
      const roda = new THREE.Mesh(new THREE.CircleGeometry(5.2, 72), M(0xffffff, { map: paveT(5, 5), roughness: 0.9 })); roda.rotation.x = -Math.PI / 2; roda.position.set(PC[0], 0.008, PC[1]); roda.receiveShadow = true; loja.add(roda);
      const aro = new THREE.Mesh(new THREE.RingGeometry(5.2, 5.42, 72), M(0x7d7468)); aro.rotation.x = -Math.PI / 2; aro.position.set(PC[0], 0.01, PC[1]); aro.receiveShadow = true; loja.add(aro);
      // chafariz com agua correndo
      const pedra = M(0xcfc7b8, { roughness: 0.7 }), agua = new THREE.MeshPhysicalMaterial({ color: 0x4f9fc4, roughness: 0.08, transparent: true, opacity: 0.88, clearcoat: 1, emissive: 0x0d3a50, emissiveIntensity: 0.3 });
      const FX = PC[0], FZ = PC[1] - 0.8;
      const fon = new THREE.Group(); fon.position.set(FX, 0, FZ); loja.add(fon);
      mesh(new THREE.CylinderGeometry(1.55, 1.65, 0.5, 48), pedra, 0, 0.25, 0, fon).receiveShadow = true;
      mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.04, 48), agua, 0, 0.46, 0, fon);
      mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.25, 16), pedra, 0, 0.9, 0, fon);
      mesh(new THREE.CylinderGeometry(0.7, 0.32, 0.22, 32), pedra, 0, 1.55, 0, fon);
      mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.03, 32), agua, 0, 1.65, 0, fon);
      mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.45, 12), pedra, 0, 1.85, 0, fon);
      { const N = 520, pos = new Float32Array(N * 3); bon.gotas = { N, pos, seed: Array.from({ length: N }, () => [RP() * Math.PI * 2, RP(), 0.6 + RP() * 0.5]) };
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        bon.gotas.pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe8f6ff, size: 0.035, transparent: true, opacity: 0.8, depthWrite: false })); bon.gotas.pts.position.set(FX, 0, FZ); bon.gotas.pts.frustumCulled = false; loja.add(bon.gotas.pts); }
      // bancos
      const madeira = M(0x8a5a34, { roughness: 0.7 }), ferro = M(0x1f2b26, { roughness: 0.45, metalness: 0.6 });
      const banco = (x, z, ry) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; loja.add(b);
        for (let i = 0; i < 3; i++) box2(2.1, 0.045, 0.12, madeira, 0, 0.255, -0.13 + i * 0.135, b);
        for (let i = 0; i < 2; i++) { const s = box2(2.1, 0.11, 0.035, madeira, 0, 0.45 + i * 0.16, -0.25 - i * 0.02, b); s.rotation.x = -0.12; }
        for (const sx of [-0.95, 0.95]) { box2(0.05, 0.25, 0.5, ferro, sx, 0.125, -0.02, b); box2(0.05, 0.5, 0.05, ferro, sx, 0.5, -0.26, b); box2(0.05, 0.04, 0.42, ferro, sx, 0.36, 0.0, b); }
        return b; };
      bon.banco = banco(0, -1.45, 0);
      banco(-4.6, -1.3, 0.55); banco(4.9, -1.6, -0.6); banco(-2.4, -7.6, Math.PI - 0.3); banco(2.6, -7.5, Math.PI + 0.3);
      bon.altar = bottle(0, 0xd49a4e, goldM, 1.15); bon.altar.position.set(...(V.altar || [0.0, 0.28, -1.38])); loja.add(bon.altar);   // o frasco "no altar" (V.altar = [x, y, z])
      if (V.tapete) {   // 18/11 tapete persa no chao da praca: V.tapete = { x, z, w, d, ry }
        const T = V.tapete, tt = cvT(512, 768, (x, w, h) => { x.fillStyle = '#8e2a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f2a4a'; x.fillRect(26, 26, w - 52, h - 52); x.fillStyle = '#8e2a2a'; x.fillRect(48, 48, w - 96, h - 96);
          x.strokeStyle = '#d9b25e'; x.lineWidth = 6; x.strokeRect(36, 36, w - 72, h - 72); x.strokeRect(60, 60, w - 120, h - 120);
          for (let i = 0; i < 18; i++) { x.fillStyle = i % 2 ? '#d9b25e' : '#f2e8d8'; x.beginPath(); const cy = 70 + i * 35.5; x.moveTo(13, cy - 10); x.lineTo(23, cy); x.lineTo(13, cy + 10); x.lineTo(3, cy); x.fill(); x.beginPath(); x.moveTo(w - 13, cy - 10); x.lineTo(w - 3, cy); x.lineTo(w - 13, cy + 10); x.lineTo(w - 23, cy); x.fill(); }
          const med = (cx, cy, r) => { for (let k = 4; k > 0; k--) { x.fillStyle = ['#d9b25e', '#1f2a4a', '#f2e8d8', '#b8456a'][k % 4]; x.beginPath(); x.moveTo(cx, cy - r * k / 4 * 1.5); x.lineTo(cx + r * k / 4, cy); x.lineTo(cx, cy + r * k / 4 * 1.5); x.lineTo(cx - r * k / 4, cy); x.fill(); } };
          med(w / 2, h / 2, 120); [[110, 120], [w - 110, 120], [110, h - 120], [w - 110, h - 120]].forEach(([a, b]) => med(a, b, 40));
          for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(0,0,0,${RP() * 0.1})`; x.fillRect(RP() * w, RP() * h, 2, 2); } });
        const tp = new THREE.Mesh(new THREE.BoxGeometry(T.w || 1.5, 0.015, T.d || 2.1), [M(0x6e2020), M(0x6e2020), M(0xffffff, { map: tt, roughness: 0.95 }), M(0x6e2020), M(0x6e2020), M(0x6e2020)]);
        tp.position.set(T.x, 0.016, T.z); tp.rotation.y = T.ry || 0; tp.receiveShadow = true; loja.add(tp);
        const fr = M(0xf2e8d8); for (const sz of [-1, 1]) for (let i = 0; i < 16; i++) { const f = mesh(new THREE.BoxGeometry(0.012, 0.004, 0.07), fr, -(T.w || 1.5) / 2 + 0.05 + i * ((T.w || 1.5) - 0.1) / 15, 0.012, sz * ((T.d || 2.1) / 2 + 0.035), tp); f.castShadow = false; }
      }
      // arvores (low poly), com a copa balancando no vento
      const tronco = M(0x6b4a32, { flatShading: true }), folhas = [0x3f7a35, 0x4d8a3c, 0x5b9a45, 0x356b2f, 0x6aa84f].map(c => M(c, { flatShading: true, roughness: 0.8 }));
      const geoF = new THREE.IcosahedronGeometry(1, 1), geoT = new THREE.CylinderGeometry(0.11, 0.17, 1, 7);
      bon.copas = [];
      const arvore = (x, z, s, tipo = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); loja.add(g);
        const h = (2.0 + RP() * 0.8) * s; const tr = mesh(geoT, tronco, 0, h / 2, 0, g); tr.scale.set(s, h, s); tr.receiveShadow = true;
        const cp = new THREE.Group(); cp.position.y = h; g.add(cp);
        const mf = folhas[(RP() * folhas.length) | 0], n = tipo ? 3 : 5;
        for (let i = 0; i < n; i++) { const a = i * 2.4 + RP(), r = i ? (0.55 + RP() * 0.35) * s : 0; const f = mesh(geoF, mf, Math.cos(a) * r, (i ? 0.1 + RP() * 0.5 : 0.55) * s, Math.sin(a) * r, cp); const sc = (i ? 0.75 + RP() * 0.35 : 1.15) * s; f.scale.set(sc, sc * (tipo ? 1.5 : 0.85), sc); f.rotation.set(RP(), RP(), RP()); f.receiveShadow = true; }
        bon.copas.push([cp, RP() * 6]); return g; };
      const livre = (x, z) => !(Math.abs(z - PZ) < 1.9) && Math.hypot(x - PC[0], z - PC[1]) > 6.4 && !(x > -5 && x < 9 && z > 1.5 && z < 9);
      for (let tent = 0, nA = 0; tent < 1200 && nA < 110; tent++) { const a = RP() * Math.PI * 2, r = 7 + Math.pow(RP(), 0.8) * 34; const x = Math.cos(a) * r, z = Math.sin(a) * r - 2; if (!livre(x, z)) continue; arvore(x, z, 0.9 + RP() * 0.7, RP() < 0.25 ? 1 : 0); nA++; }
      for (let x = -26; x <= 26; x += 4.2) { if (Math.abs(x) > 6.5) arvore(x + RP(), PZ - 2.7 - RP() * 0.6, 1.1 + RP() * 0.3); if (x < -7 || x > 11) arvore(x + RP(), PZ + 2.9 + RP() * 0.5, 1.1 + RP() * 0.3); }
      arvore(-3.9, -5.7, 1.5); arvore(3.7, -4.6, 1.45); arvore(-6.6, -2.4, 1.35); arvore(7.3, -2.5, 1.3);
      // canteiros com flores em volta da praca
      const arbM = M(0x2f6a33, { flatShading: true }), florCols = [0xE6AEB9, 0xFFC93C, 0xffffff, 0xD94A6A];
      for (let i = 0; i < 44; i++) { const a = (i / 44) * Math.PI * 2, x = PC[0] + Math.cos(a) * 5.9, z = PC[1] + Math.sin(a) * 5.9; if (z > -1.4) continue;
        const b = mesh(geoF, arbM, x, 0.3, z, loja); b.scale.set(0.55, 0.42, 0.55); b.rotation.y = RP() * 3; b.receiveShadow = true;
        for (let k = 0; k < 5; k++) mesh(new THREE.IcosahedronGeometry(0.05, 0), M(florCols[(i + k) % 4], { emissive: florCols[(i + k) % 4], emissiveIntensity: 0.08 }), x + (RP() - 0.5) * 0.7, 0.56 + RP() * 0.12, z + (RP() - 0.5) * 0.7, loja); }
      // postes
      const poste = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); loja.add(g); mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.2, 10), ferro, 0, 1.6, 0, g); mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.12, 10), ferro, 0, 0.06, 0, g);
        mesh(new THREE.CylinderGeometry(0.16, 0.1, 0.38, 6), new THREE.MeshStandardMaterial({ color: 0xfff2d0, emissive: 0xffe2a0, emissiveIntensity: 0.25, roughness: 0.3 }), 0, 3.38, 0, g); mesh(new THREE.ConeGeometry(0.24, 0.2, 6), ferro, 0, 3.66, 0, g); };
      poste(-2.6, -1.2); poste(2.6, -1.2); poste(-4.8, -6.4); poste(4.8, -6.4); poste(-9, PZ - 1.4); poste(10, PZ - 1.4);
      // predios no horizonte (a neblina deixa eles suaves)
      const predT = cvT(128, 256, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = 0; c < 6; c++) { x.fillStyle = RP() < 0.35 ? '#9fb7c8' : '#c7d6df'; x.fillRect(8 + c * 20, 8 + r * 15, 12, 9); } });
      const predCols = [0xF2E8D8, 0xE6AEB9, 0xDCD6E2, 0xFFE3B3, 0xCFE3DD, 0xF6D7C3];
      for (let i = 0; i < 24; i++) { const a = RP() * Math.PI * 2, r = 50 + RP() * 22, h = 9 + RP() * 22, w = 6 + RP() * 8; const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * 0.8), new THREE.MeshStandardMaterial({ map: predT, color: predCols[i % predCols.length], roughness: 0.8 })); p.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); p.rotation.y = RP() * 3; loja.add(p); }
      // carrinho de pipoca + pipoqueiro (fica virado pros dois)
      const PPX = 4.1, PPZ = -2.6, pipYaw = Math.atan2(0 - PPX, -0.6 - PPZ);
      const car = new THREE.Group(); car.position.set(PPX - Math.sin(pipYaw) * 0.75, 0, PPZ - Math.cos(pipYaw) * 0.75); car.position.set(PPX + Math.cos(pipYaw) * 0.95 + Math.sin(pipYaw) * 0.25, 0, PPZ - Math.sin(pipYaw) * 0.95 + Math.cos(pipYaw) * 0.25); car.rotation.y = pipYaw;   // carrinho do lado dele (a vareta do guarda-sol nao tampa o rosto) loja.add(car);
      const verm = M(0xc8372d, { roughness: 0.5 }), branco = M(0xf4efe6, { roughness: 0.6 });
      box2(1.1, 0.55, 0.62, verm, 0, 0.62, 0, car); box2(1.14, 0.06, 0.66, branco, 0, 0.92, 0, car);
      const vitP = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.5), glassM(0xffffff, 0.22)); vitP.position.set(0, 1.18, 0); car.add(vitP);
      for (let i = 0; i < 60; i++) mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0xfff1c2, { emissive: 0xffd27a, emissiveIntensity: 0.12 }), (RP() - 0.5) * 0.72, 0.98 + RP() * 0.22, (RP() - 0.5) * 0.42, car);
      for (const sx of [-0.4, 0.4]) { const w = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 18), ferro, sx, 0.2, 0.34, car); w.rotation.x = Math.PI / 2; }
      mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8), ferro, 0, 2.0, 0, car);
      { const c = document.createElement('canvas'); c.width = 512; c.height = 64; const x = c.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#f4efe6' : '#c8372d'; x.fillRect(i * 32, 0, 32, 64); } const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
        mesh(new THREE.ConeGeometry(0.95, 0.42, 16, 1, true), new THREE.MeshStandardMaterial({ map: tx, side: THREE.DoubleSide, roughness: 0.7 }), 0, 2.85, 0, car); }
      { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#f4efe6'; x.fillRect(0, 0, 512, 128); x.font = '900 96px Montserrat'; x.textAlign = 'center'; x.fillStyle = '#c8372d'; x.fillText('PIPOCA', 256, 100);
        const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6 })); p.position.set(0, 0.66, 0.315); car.add(p); }
      const pip = buildKid({ skin: C('#d9a37e'), nose: C('#c48f6c'), hood: C('#f4efe6'), hoodD: C('#d8d2c6'), pants: C('#2c3036'), hair: C('#8c8478'), string: C('#f4efe6') });
      [1, 2, 3, 4].forEach(i => (pip.body.children[i].visible = false));
      mesh(new THREE.CylinderGeometry(0.4, 0.43, 0.16, 16), verm, 0, 0.8, -0.04, pip.head); mesh(new THREE.BoxGeometry(0.5, 0.04, 0.32), verm, 0, 0.74, 0.32, pip.head);
      scene.add(pip.g); bon.pip = { k: pip, x: PPX, z: PPZ, yaw: pipYaw };
      // gente passando la no fundo (longe dos dois, nunca na frente deles)
      const passCols = [['#e9b693', '#7DBFB3', '#2a2a30', '#3b2a20'], ['#8d5a3c', '#FFC93C', '#1c1c26', '#141414'], ['#f0c8a8', '#9C452A', '#3b3a45', '#c9a46a'], ['#c48a66', '#DCD6E2', '#0F2E33', '#2a1a14'], ['#6b4430', '#B8BC5C', '#2c3036', '#141414']];
      const rotas = [[-30, -10.2, 30, -10.2], [32, -12.0, -32, -12.0], [-30, -14.5, 30, -14.5], [10.5, 25, 10.5, -25], [-10.5, -25, -10.5, 25]];
      bon.pass = passCols.map(([sk, sh, pa, ha], i) => { const k = buildKid({ skin: C(sk), nose: C('#' + new THREE.Color(sk).multiplyScalar(0.88).getHexString()), hood: C(sh), hoodD: C('#' + new THREE.Color(sh).multiplyScalar(0.8).getHexString()), pants: C(pa), hair: C(ha), string: C(sh) }); scene.add(k.g); return { k, rota: rotas[i], vel: [1.1, 0.9, 1.0, 1.2, 0.95][i], fase: RP() }; });
      // pombos ciscando no caminho
      const pomboM = M(0x8a8f98, { flatShading: true }), pomboE = M(0x5f6672, { flatShading: true }), bico = M(0xd8a060);
      bon.pombos = [];
      for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const x = -2.2 + (RP() - 0.5) * 1.8, z = PZ + 1.3 + RP() * 1.1; g.position.set(x, 0, z); g.rotation.y = RP() * 6; loja.add(g);
        const corpo = mesh(new THREE.IcosahedronGeometry(0.09, 0), pomboM, 0, 0.1, 0, g); corpo.scale.set(0.8, 0.75, 1.3);
        const asa = mesh(new THREE.IcosahedronGeometry(0.07, 0), pomboE, 0, 0.12, -0.03, g); asa.scale.set(1.1, 0.5, 1.4);
        const cab = new THREE.Group(); cab.position.set(0, 0.17, 0.09); g.add(cab); mesh(new THREE.IcosahedronGeometry(0.045, 0), pomboE, 0, 0, 0, cab); mesh(new THREE.ConeGeometry(0.012, 0.035, 4), bico, 0, -0.005, 0.045, cab).rotation.x = Math.PI / 2;
        for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.012, 0.06, 0.012), bico, s * 0.03, 0.03, 0.0, g);
        bon.pombos.push({ g, cab, f: RP() * 6 }); }
      // pernas com joelho: [quadril, joelho] (troca as pernas retas do boneco)
      const legRig = kid => { const ch = kid.g.children, pm = ch[0].material, sm = ch[2].material; for (let i = 0; i < 4; i++) ch[i].visible = false;
        kid.pernas = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.14, 0.64, 0); kid.g.add(hip); mesh(new THREE.BoxGeometry(0.2, 0.31, 0.22), pm, 0, -0.145, 0, hip);
          const knee = new THREE.Group(); knee.position.set(0, -0.29, 0); hip.add(knee); mesh(new THREE.BoxGeometry(0.19, 0.25, 0.21), pm, 0, -0.11, 0, knee); mesh(new THREE.BoxGeometry(0.25, 0.14, 0.38), sm, 0, -0.28, 0.06, knee); return [hip, knee]; }); };
      [hero, val, pip, ...bon.pass.map(q => q.k)].forEach(legRig);
      const pernas = (kid, s, k, amp, ph, c = 0) => kid.pernas.forEach(([hip, knee], i) => { const sn = Math.sin(ph + i * Math.PI);
        hip.rotation.x = -Math.PI / 2 * s - (Math.PI / 2 + 0.7) * c + 0.08 * k + sn * 0.7 * amp * (1 - s - c); knee.rotation.x = Math.PI / 2 * s + (Math.PI / 2 + 0.7) * c + Math.PI / 2 * k + Math.max(0, -sn) * amp * 0.9 * (1 - s); });
      // movimento: V.mov = { h: { ini: [x, z], m: [[t0, t1, x, z], ...] }, a: {...} } · V.estado = { h: [[t0, t1, 'senta'|'ajoelha'|'reverencia'], ...] } · V.yaw = [[t0, t1, angulo, quem]]
      const MV = V.mov || {}, ES = V.estado || {}, YW = V.yaw || [];
      bon.pos = (who, t) => { const m = MV[who] || { ini: who === 'h' ? [bon.hx, bon.hz] : [bon.ax, bon.az], m: [] };
        let x = m.ini[0], z = m.ini[1], mov = 0, dir = 0, vel = 0;
        for (const [a, b, X, Z] of m.m) { if (t >= b) { x = X; z = Z; continue; } if (t >= a) { const k = smooth(a, b, t); dir = Math.atan2(X - x, Z - z); vel = Math.hypot(X - x, Z - z) / (b - a); x += (X - x) * k; z += (Z - z) * k; mov = win(t, a, b, 0.3); } break; }
        return { x, z, mov, dir, vel }; };
      const est = (who, k, t) => { let w = 0; for (const [a, b, q] of (ES[who] || [])) if (q === k) w = Math.max(w, win(t, a, b, 0.45)); return w; };
      window.__bonPos = (who, t) => { if (who === 'par') { const a = bon.pos('h', t), b = bon.pos('a', t); return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }; } return bon.pos(who, t); };
      const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a)), lerpA = (a, b, k) => a + wrapA(b - a) * k;
      const yawDe = (who, me, ot, t) => { let y = lerpA(Math.atan2(ot.x - me.x, ot.z - me.z), 0, 0.55);
        if (me.mov > 0) y = lerpA(y, me.dir, me.mov);
        y = lerpA(y, 0, Math.max(est(who, 'senta', t), est(who, 'chao', t))); y = lerpA(y, Math.PI, Math.max(est(who, 'ajoelha', t), est(who, 'reverencia', t)));
        for (const [a, b, v, q] of YW) if (q === who) { const w = win(t, a, b, 0.4); if (w > 0) y = lerpA(y, v, w); }
        return y; };
      bon.pracaPre = (P, A, t) => { const ph = bon.pos('h', t), pa = bon.pos('a', t); P.yaw = yawDe('h', ph, pa, t); A.yaw = yawDe('a', pa, ph, t); bon._ph = ph; bon._pa = pa; P.x = ph.x; P.z = ph.z; A.x = pa.x; A.z = pa.z; };
      bon.pracaPose = (P, A, t) => { for (const [who, Q, pp] of [['h', P, bon._ph], ['a', A, bon._pa]]) { Q.x = pp.x; Q.z = pp.z;
          const s = est(who, 'senta', t), r = est(who, 'reverencia', t), k = Math.max(est(who, 'ajoelha', t), r), run = clamp(pp.vel / 2.2), f = 7 + 5 * run;
          const c = est(who, 'chao', t), d = est(who, 'deita', t);   // chao = sentado no chao com as pernas pra frente; deita = recostado pra tras, apoiado nas maos
          Q.hop += -0.29 * s - 0.31 * k - 0.47 * c; Q.lean -= 0.04 * s + 0.05 * c;
          if (d > 0) { Q.lean -= 0.5 * d; Q.aLx += (0.85 - Q.aLx) * d; Q.aRx += (0.85 - Q.aRx) * d; Q.aLz += (-0.3 - Q.aLz) * d; Q.aRz += (0.3 - Q.aRz) * d; Q.hp -= 0.25 * d; }
          if (r > 0) { const b = 0.5 + 0.5 * Math.sin(t * 3.4); Q.lean += r * (0.12 + 0.3 * b); Q.aLx += (-2.7 - Q.aLx) * r; Q.aRx += (-2.7 - Q.aRx) * r; Q.aLz += (0.2 - Q.aLz) * r; Q.aRz += (-0.2 - Q.aRz) * r; Q.hp += 0.1 * r * b; }
          if (pp.mov > 0) { Q.hop += (0.03 + 0.05 * run) * Math.abs(Math.sin(t * f)) * pp.mov; Q.lean += 0.08 * run * pp.mov; Q.aLx += 0.55 * Math.sin(t * f) * pp.mov * (0.6 + run); Q.aRx -= 0.55 * Math.sin(t * f) * pp.mov * (0.6 + run); }
          Q._s = s; Q._c = c; Q._k = k; Q._m = pp.mov; Q._run = run; Q._f = f; } };
      bon.pracaPos2 = (P, A, t) => {
        pernas(hero, P._s, P._k, P._m * (0.5 + 0.4 * P._run), t * P._f, P._c);
        pernas(val, A._s, A._k, A._m * (0.5 + 0.4 * A._run), t * A._f + 1.3, A._c);
        bon.altar.visible = t < (V.pegaFrasco ?? -1);
        for (const [cp, f] of bon.copas) { cp.rotation.z = 0.025 * Math.sin(t * 0.9 + f); cp.rotation.x = 0.02 * Math.sin(t * 0.7 + f * 1.7); }
        const G = bon.gotas; for (let i = 0; i < G.N; i++) { const [a, p, v] = G.seed[i], l = (t * v * 0.9 + p) % 1; let r, y;
          if (i % 2) { r = 0.08 + 0.55 * l; y = 2.08 + 0.32 * Math.sin(Math.PI * l) - 0.42 * l; } else { r = 0.66 + 0.75 * l; y = 1.64 + 0.1 * l - 1.2 * l * l; }
          G.pos[i * 3] = Math.cos(a) * r; G.pos[i * 3 + 1] = y; G.pos[i * 3 + 2] = Math.sin(a) * r; }
        G.pts.geometry.attributes.position.needsUpdate = true;
        for (const p of bon.pombos) { const c = Math.max(0, Math.sin(t * 2.2 + p.f)); p.cab.position.set(0, 0.17 - 0.08 * c, 0.09 + 0.04 * c); p.cab.rotation.x = 0.9 * c; p.g.position.y = Math.sin(t * 0.5 + p.f) > 0.85 ? 0.03 * Math.abs(Math.sin(t * 9 + p.f)) : 0; }
        for (const q of bon.pass) { const [x0, z0, x1, z1] = q.rota, L = Math.hypot(x1 - x0, z1 - z0), k = ((t * q.vel / L) + q.fase) % 1, ph = t * 7.5 + q.fase * 9;
          poseKid(q.k, { x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k, hop: 0.035 * Math.abs(Math.sin(ph)), yaw: Math.atan2(x1 - x0, z1 - z0), lean: 0.03, hp: 0, hy: 0.25 * Math.sin(t * 0.4 + q.fase * 5), hr: 0, aLx: 0.5 * Math.sin(ph), aLz: -0.1, aRx: -0.5 * Math.sin(ph), aRz: 0.1, eye: 1, brow: 0, browT: 0, mouth: 0.5, open: 0 }, t, q.fase * 7);
          pernas(q.k, 0, 0, 0.55, ph); }
        { const pp = bon.pip; let w = 0; for (const [a, b] of (V.pipocaOlha || [])) w = Math.max(w, win(t, a, b, 0.4));
          poseKid(pp.k, { x: pp.x, z: pp.z, hop: 0, yaw: pp.yaw, lean: 0.05 * (1 - w), hp: 0.28 * (1 - w) - 0.05 * w, hy: 0, hr: 0.04 * Math.sin(t * 0.8), aLx: -0.9 * (1 - w), aLz: -0.1, aRx: (-1.0 + 0.25 * Math.sin(t * 4)) * (1 - w) - 0.2 * w, aRz: 0.1, eye: 1 + 0.35 * w, brow: 0.06 * w, browT: 0, mouth: 0.4 - 0.9 * w, open: 0.3 * w }, t, 3.3);
          pernas(pp.k, 0, 0, 0, 0); }
      };
      bon.pracaLuz = (t, shot) => { cine.sun.intensity = V.sol ?? 6.0; cine.hemi.intensity = 0.55; cine.hemi.color.setHex(0xcfe4ff); cine.hemi.groundColor.setHex(0x6f8a4a); cine.bounce.intensity = 0; cine.winL.intensity = 0; cine.lamp.intensity = 0; cine.rimL.intensity = 0.5; cine.scrL.intensity = 0;
        cine.shafts.visible = cine.dust.visible = false; bon.shelfL.intensity = 0; bon.fill.intensity = 0.5; bloom.strength = 0.14; bloom.threshold = 0.9;
        if (['DRONE', 'PAIS', 'TRAVW', 'ALTARW', 'ORBP'].includes(shot.name)) cine.bokeh.uniforms.aperture.value = 0.0008; };
      cine.sunDir = new THREE.Vector3(0.45, -0.78, -0.43).normalize(); cine.sunT = new THREE.Vector3(0.5, 0, -1.0);
      Object.assign(cine.sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 }); cine.sun.shadow.camera.updateProjectionMatrix(); cine.sun.color.setHex(0xfff0d8); cine.sun.target.position.copy(cine.sunT);
      bon.pracaShots = {
        DRONE: { p: [-1.6, 15, -9.5], q: [0.2, 0.6, -1.0], d: [0.6, -9.6, 4.2], ease: true, fov: 46 },
        ALTARW: { p: [-3.9, 2.7, -5.4], q: [0.3, 0.95, -0.5], d: [0.35, -0.2, 0.5], fov: 50 },
        ALTAR: { p: [0.55, 1.55, -2.5], q: [0, 1.45, -0.7], d: [-0.1, 0, 0.15], fov: 50 },
        ALTAR2: { p: [-1.7, 2.4, -2.7], q: [0.45, 1.6, -0.55], d: [0.15, 0, 0.2], fov: 48 },
        FRENTE: { p: [-0.9, 2.2, 5.8], q: [-0.6, 1.15, -0.6], d: [0, 0, -0.3], fov: 50 },
        WIDE: { rel: 'par', p: [0.4, 2.3, 6.2], q: [0, 1.2, -0.3], d: [0, 0, -0.3], fov: 44 },
        CORRE: { rel: 'a', p: [-1.7, 1.7, 3.0], q: [0, 1.3, 0], d: [0, 0, -0.15], fov: 42 },
        CHR: { rel: 'h', p: [0.85, 1.85, 2.8], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        CBIA: { rel: 'a', p: [-0.85, 1.85, 2.8], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        DUO: { rel: 'par', p: [0.1, 1.9, 4.7], q: [0, 1.35, -0.2], d: [0, 0, -0.35], fov: 40 },
        OTSR: { rel: 'par', p: [-2.3, 2.0, 2.4], q: [0.55, 1.35, -0.4], d: [0.1, 0, -0.2], fov: 38 },
        OTSA: { rel: 'par', p: [2.4, 2.0, 2.4], q: [-0.55, 1.35, -0.4], d: [-0.1, 0, -0.2], fov: 38 },
        BANCO: { p: [0.1, 1.35, 3.1], q: [0, 0.95, -1.45], d: [0, 0, -0.3], fov: 38 },
        BANCOH: { p: [-0.15, 1.25, 1.2], q: [-0.5, 1.15, -1.45], d: [0, 0, -0.12], fov: 36 },
        BANCOA: { p: [0.85, 1.25, 1.2], q: [0.5, 1.15, -1.45], d: [0, 0, -0.12], fov: 36 },
        LOWSKY: { rel: 'h', p: [0.5, 0.45, 2.3], q: [0, 1.9, 0], d: [0.15, 0, -0.15], fov: 52 },
        PAIS: { p: [-6.5, 2.4, 4.5], q: [0.0, 1.2, -2.5], d: [1.2, -0.2, -0.4], fov: 46 },
        PIPO: { p: [2.5, 1.85, 0.6], q: [4.1, 1.75, -2.6], d: [0.1, 0, -0.15], fov: 42 },
        POMBO: { p: [-1.2, 0.28, 3.6], q: [-2.2, 0.2, 2.2], d: [-0.1, 0, -0.1], fov: 40 },
        TRAV: { rel: 'par', p: [2.0, 1.75, 2.6], q: [0.2, 1.4, 0], d: [0, 0, 0], fov: 40 },
        TRAVW: { rel: 'par', p: [4.2, 2.3, 6.0], q: [0, 1.3, 0], d: [0, 0, 0], fov: 42 },
        CTA: { rel: 'a', p: [0, 1.82, 2.9], q: [0, 1.6, 0], d: [0, 0, -0.25], fov: 34 },
        CHAOH: { rel: 'h', p: [0.6, 1.45, 2.7], q: [0, 0.95, 0], d: [0, 0, -0.2], fov: 42 },
        CBIAR: { rel: 'a', p: [0.95, 1.85, 2.8], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        CTAH: { rel: 'h', p: [0.3, 1.6, 3.8], q: [0.3, 1.15, 0], d: [0, 0, -0.2], fov: 38 },
        CHAOA: { rel: 'a', p: [-0.55, 1.45, 2.7], q: [0, 0.95, 0], d: [0, 0, -0.2], fov: 42 },
        DUOCH: { rel: 'par', p: [0.2, 1.9, 4.3], q: [0, 1.05, -0.2], d: [0, 0, -0.3], fov: 42 },
        TAPW: { p: [-2.6, 2.6, 4.4], q: [0.3, 0.8, -0.5], d: [0.4, -0.1, -0.3], fov: 44 },
        LATW: { p: [-4.6, 1.75, 1.6], q: [0.2, 1.0, -0.8], d: [0.3, 0, -0.2], fov: 42 },
        CBIAW: { rel: 'a', p: [2.5, 1.85, 2.3], q: [0, 1.5, 0], d: [0, 0, -0.2], fov: 38 },
        ORBP: { orbit: [0, 1.4, -0.4, 4.6, -0.6, 0.6, 2.1], q: [0, 1.4, -0.4] },
      };
      face = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ color: 0x222222 })); face.position.set(0, -5, 0); face.visible = false; loja.add(face);
      bon.pend = [];
    } else if (CENA === 'quarto') {
      // 21/11 QUARTO do Rafa (episodio "parceria paga"): cama arrumada (ele nao dormiu) com barbante e fotos em cima, criado-mudo
      // com gaveta e abajur, mural de investigacao com barbante, porta por onde a Bia entra, guarda-roupa, prateleira de perfumes,
      // mesinha com notebook. Cores da paleta oficial. Config no roteiro: V.quarto = { porta, entrega, pousa, gaveta, pegaFrasco,
      // largaFrasco, fotoMao, fotoPin, prende, destaque: [[t0, t1, idx]], sentaDy }.
      bon.quarto = true; bon.mover = true;
      const Q = V.quarto || {};
      const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
      const CREME = 0xF2E8D8, PET = 0x0F2E33, CEDRO = 0x6B4430, AMBAR = 0xD49A4E, PIM = 0x9C452A, ALG = 0xDCD6E2, MENTA = 0x7DBFB3, NOITE = 0x0A1F23, ROSA = 0xE6AEB9, BERG = 0xB8BC5C;
      wallP.color.setHex(CREME);
      const cedroM = M(CEDRO, { roughness: 0.6 }), cremeM = M(CREME, { roughness: 0.9 }), petM = M(PET, { roughness: 0.95 }), algM = M(ALG, { roughness: 0.85 });
      const metalM = M(0xa8adb3, { metalness: 0.7, roughness: 0.3 });
      // ceu de manha na janela
      { const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, '#8fb6e8'); g.addColorStop(0.6, '#cfe2f2'); g.addColorStop(1, '#F2E8D8'); x.fillStyle = g; x.fillRect(0, 0, 64, 512);
        const tx_ = new THREE.CanvasTexture(c); tx_.colorSpace = THREE.SRGBColorSpace; cine.sky.material.map = tx_; cine.sky.material.color.setScalar(1.15); cine.sky.material.needsUpdate = true; }
      // parede da direita com o vao da porta
      for (const o of set.children) if (o.isMesh && o.position.x > 3.2) o.visible = false;
      const DZ0 = 1.7, DZ1 = 2.75, DH = 2.45;
      const paredeD = (z0, z1, y0, y1) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, y1 - y0), cremeM); p.rotation.y = -Math.PI / 2; p.position.set(3.3, (y0 + y1) / 2, (z0 + z1) / 2); p.receiveShadow = true; loja.add(p); };
      paredeD(-2.4, DZ0, 0, 4.5); paredeD(DZ1, 9, 0, 4.5); paredeD(DZ0, DZ1, DH, 4.5);
      box2(0.05, 0.12, DZ0 + 2.4, cedroM, 3.27, 0.06, (DZ0 - 2.4) / 2); box2(0.05, 0.12, 9 - DZ1, cedroM, 3.27, 0.06, (DZ1 + 9) / 2);
      box2(0.16, DH + 0.08, 0.07, cremeM, 3.27, (DH + 0.08) / 2, DZ0 - 0.035); box2(0.16, DH + 0.08, 0.07, cremeM, 3.27, (DH + 0.08) / 2, DZ1 + 0.035);
      box2(0.16, 0.08, DZ1 - DZ0 + 0.14, cremeM, 3.27, DH + 0.04, (DZ0 + DZ1) / 2);
      { const corr = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.0, 3.2), M(NOITE, { side: THREE.BackSide })); corr.position.set(4.52, 1.5, 2.2); loja.add(corr);
        const cl = new THREE.PointLight(0xffe6c0, 0.6, 3, 2); cl.position.set(4.3, 2.4, 2.2); scene.add(cl); }
      bon.porta = new THREE.Group(); bon.porta.position.set(3.25, 0, DZ0); loja.add(bon.porta);
      box2(0.05, DH - 0.03, DZ1 - DZ0 - 0.03, algM, 0, (DH - 0.03) / 2, (DZ1 - DZ0) / 2, bon.porta);
      { const mac = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), goldM); mac.position.set(-0.06, 1.05, DZ1 - DZ0 - 0.13); bon.porta.add(mac); }

      // cama (arrumadinha: ninguem dormiu) com barbante, tesoura e fotos espalhadas em cima
      const BX = -2.2, BW = 1.6, BL = 2.3, BZ0 = -2.3, BZ1 = BZ0 + BL, BZC = (BZ0 + BZ1) / 2;
      box2(BW, 0.28, BL, cedroM, BX, 0.16, BZC);
      box2(BW - 0.08, 0.18, BL - 0.1, cremeM, BX, 0.39, BZC + 0.02);
      box2(BW + 0.06, 1.1, 0.08, cedroM, BX, 0.64, BZ0 + 0.03);
      box2(BW + 0.04, 0.07, 1.62, petM, BX, 0.5, BZ1 - 0.79);
      box2(BW + 0.04, 0.34, 0.04, petM, BX, 0.35, BZ1 + 0.03);
      box2(BW + 0.05, 0.075, 0.28, cremeM, BX, 0.51, BZ1 - 1.62);
      for (const sx of [-0.4, 0.4]) { const tv = box2(0.62, 0.15, 0.36, algM, BX + sx, 0.57, BZ0 + 0.32); tv.rotation.x = -0.3; }
      const fotoMini = (x, z, r, cor) => { const g = new THREE.Group(); g.position.set(x, 0.548, z); g.rotation.y = r; loja.add(g); box2(0.17, 0.008, 0.2, cremeM, 0, 0, 0, g);
        const im = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), M(cor)); im.rotation.x = -Math.PI / 2; im.position.set(0, 0.006, -0.02); g.add(im); };
      fotoMini(BX - 0.4, -0.85, 0.3, MENTA); fotoMini(BX + 0.05, -0.45, -0.5, ROSA); fotoMini(BX + 0.5, -1.25, 0.9, AMBAR); fotoMini(BX - 0.15, -1.4, -0.2, BERG);
      for (const [x, z] of [[BX + 0.35, -0.7], [BX - 0.5, -1.45]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 18), M(PIM, { roughness: 0.95 })); r.position.set(x, 0.585, z); r.castShadow = true; loja.add(r);
        const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.45, 5), M(PIM)); fio.rotation.set(Math.PI / 2, 0, 0.7); fio.position.set(x + 0.12, 0.545, z + 0.15); loja.add(fio); }
      { const tes = new THREE.Group(); tes.position.set(BX - 0.05, 0.55, -1.05); tes.rotation.y = 0.6; loja.add(tes);
        for (const s of [-1, 1]) { const b = box2(0.22, 0.012, 0.025, metalM, 0.04, 0, 0, tes); b.rotation.y = s * 0.25; const a = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 14), M(PIM)); a.rotation.x = Math.PI / 2; a.position.set(-0.1, 0, s * 0.03); tes.add(a); } }
      bon.frascoCama = bottle(0, PIM, goldM, 0.85); bon.frascoCama.position.set(-1.62, 0.535, -0.3); bon.frascoCama.rotation.y = 0.4; loja.add(bon.frascoCama); bon.frascoCama.visible = false;

      // criado-mudo com gaveta (o frasco esquecido mora nela) + abajur
      const CXm = -0.95, CZm = -2.05;
      box2(0.58, 0.62, 0.46, cedroM, CXm, 0.31, CZm);
      bon.gaveta = new THREE.Group(); bon.gaveta.position.set(CXm, 0.43, CZm); loja.add(bon.gaveta);
      box2(0.5, 0.02, 0.42, cremeM, 0, -0.08, 0, bon.gaveta); for (const sx of [-0.24, 0.24]) box2(0.02, 0.16, 0.42, cedroM, sx, 0, 0, bon.gaveta); box2(0.5, 0.16, 0.02, cedroM, 0, 0, -0.2, bon.gaveta);   // gaveta OCA (21/11: o frasco tem que aparecer dentro)
      box2(0.54, 0.22, 0.03, M(AMBAR, { roughness: 0.6 }), 0, 0, 0.228, bon.gaveta);
      { const px = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), goldM); px.position.set(0, 0, 0.255); bon.gaveta.add(px); }
      { const pos_ = bon.frasco.position.clone(), rot_ = bon.frasco.rotation.clone(); hero.armR.remove(bon.frasco); bon.frasco = bottle(0, PIM, goldM, 1.05); bon.frasco.position.copy(pos_); bon.frasco.rotation.copy(rot_); hero.armR.add(bon.frasco); }   // frasco do episodio: liquido pimenta (contrasta com a pele)
      bon.gavFrasco = bottle(0, PIM, goldM, 0.85);
      for (const f_ of [bon.frasco, bon.gavFrasco]) f_.traverse(o => { if (o.material && o.material.emissive && o.material.emissive.getHex()) o.material.emissiveIntensity = 0.5; });   // le no escuro
      bon.gavFrasco.rotation.set(0, 0.5, 0); bon.gavFrasco.position.set(0.02, -0.07, 0.06); bon.gaveta.add(bon.gavFrasco);
      mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.04, 16), cedroM, CXm - 0.14, 0.64, CZm - 0.06, loja);
      mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), goldM, CXm - 0.14, 0.82, CZm - 0.06, loja);
      { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: CREME, emissive: 0xffd9a0, emissiveIntensity: 0.55, side: THREE.DoubleSide, roughness: 0.9 }));
        sh.position.set(CXm - 0.14, 1.02, CZm - 0.06); loja.add(sh);
        const ll = new THREE.PointLight(0xffc07a, 2.6, 4.2, 1.8); ll.position.set(CXm - 0.14, 0.95, CZm + 0.08); scene.add(ll); }

      // cafes (copinho com tampa): 2 na mao da Bia, 1 vai pro Rafa, depois ele pousa no criado-mudo
      const copo = () => { const g = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.052, 0.04, 0.14, 16), M(CREME, { roughness: 0.6 }), 0, 0.07, 0, g);
        mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), M(CEDRO, { roughness: 0.5 }), 0, 0.148, 0, g); mesh(new THREE.CylinderGeometry(0.053, 0.046, 0.05, 16), M(AMBAR), 0, 0.065, 0, g); return g; };
      const naMao = (arm, g) => { g.position.set(0, -0.66, 0.06); arm.add(g); return g; };
      bon.cafeBiaL = naMao(val.armL, copo()); bon.cafeBiaR = naMao(val.armR, copo()); bon.cafeRafa = naMao(hero.armR, copo());
      bon.cafeMesa = copo(); bon.cafeMesa.position.set(CXm + 0.16, 0.62, CZm + 0.1); loja.add(bon.cafeMesa);

      // mural de investigacao (quadro de cortica com fotos, etiquetas, post-its e barbante)
      const MX = Q.muralX ?? 0.55, MY = 2.05, MZ = -2.28, MW = 2.3, MH = 1.45;
      box2(MW + 0.1, MH + 0.1, 0.05, cedroM, MX, MY, MZ - 0.03);
      const mc = document.createElement('canvas'); mc.width = 2048; mc.height = Math.round(2048 * MH / MW); const mx = mc.getContext('2d');
      const mTex = new THREE.CanvasTexture(mc); mTex.colorSpace = THREE.SRGBColorSpace; mTex.anisotropy = 8;
      { const mp = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshStandardMaterial({ map: mTex, roughness: 0.92 })); mp.position.set(MX, MY, MZ + 0.003); mp.receiveShadow = true; loja.add(mp); }
      const FOTOS = Q.fotos || [
        { u: 0.15, v: 0.3, lab: ['GRAVA JUNTO'], bg: '#7DBFB3', pele: '#e9b693', cab: '#2a1a14', tipo: 0 },
        { u: 0.85, v: 0.3, lab: ['MESMA AGÊNCIA'], bg: '#E6AEB9', pele: '#c48a66', cab: '#141414', tipo: 1 },
        { u: 0.17, v: 0.77, lab: ['PUBLI DA', 'MESMA MARCA'], bg: '#B8BC5C', pele: '#8a5a3c', cab: '#141414', tipo: 2 },
        { u: 0.83, v: 0.77, lab: ['PADRINHO DO 🐶'], bg: '#DCD6E2', pele: '#f3bea6', cab: '#6B4430', tipo: 3, cao: true },
      ];
      const CEN = { u: 0.5, v: 0.42 };
      const MWp = mc.width, MHp = mc.height;
      const rr = (x, y, w, h, r) => { mx.beginPath(); mx.moveTo(x + r, y); mx.arcTo(x + w, y, x + w, y + h, r); mx.arcTo(x + w, y + h, x, y + h, r); mx.arcTo(x, y + h, x, y, r); mx.arcTo(x, y, x + w, y, r); mx.closePath(); };
      const rosto = (cx, cy, s, f) => {   // boneco generico (ninguem real)
        mx.fillStyle = f.pele; mx.beginPath(); mx.arc(cx, cy, s, 0, 7); mx.fill();
        mx.fillStyle = f.cab; mx.beginPath();
        if (f.tipo === 1) { mx.arc(cx, cy - s * 0.15, s * 1.08, Math.PI, 0); mx.fill(); mx.fillRect(cx - s * 1.08, cy - s * 0.15, s * 0.3, s * 1.3); mx.fillRect(cx + s * 0.78, cy - s * 0.15, s * 0.3, s * 1.3); }
        else if (f.tipo === 2) { mx.arc(cx, cy - s * 0.35, s * 0.9, Math.PI * 1.05, Math.PI * 1.95); mx.fill(); }
        else { mx.arc(cx, cy - s * 0.2, s * 1.02, Math.PI * 1.02, Math.PI * 1.98); mx.fill(); }
        mx.fillStyle = '#0A1F23'; for (const sx of [-1, 1]) { mx.beginPath(); mx.ellipse(cx + sx * s * 0.36, cy + s * 0.05, s * 0.09, s * 0.13, 0, 0, 7); mx.fill(); }
        mx.strokeStyle = '#0A1F23'; mx.lineWidth = s * 0.08; mx.lineCap = 'round'; mx.beginPath(); mx.arc(cx, cy + s * 0.32, s * 0.3, 0.15 * Math.PI, 0.85 * Math.PI); mx.stroke();
        if (f.oculos) { mx.fillStyle = '#0A1F23'; for (const sx of [-1, 1]) { rr(cx + sx * s * 0.36 - s * 0.3, cy - s * 0.1, s * 0.6, s * 0.36, s * 0.12); mx.fill(); } mx.fillRect(cx - s * 0.1, cy - s * 0.02, s * 0.2, s * 0.06); }
        mx.fillStyle = f.camisa || '#0F2E33'; mx.beginPath(); mx.ellipse(cx, cy + s * 1.75, s * 1.25, s * 0.8, 0, Math.PI, 0); mx.fill();
      };
      const cao = (cx, cy, s) => { mx.fillStyle = '#6B4430'; for (const sx of [-1, 1]) { mx.beginPath(); mx.ellipse(cx + sx * s * 0.75, cy - s * 0.2, s * 0.32, s * 0.6, sx * 0.4, 0, 7); mx.fill(); }
        mx.fillStyle = '#D49A4E'; mx.beginPath(); mx.arc(cx, cy, s * 0.8, 0, 7); mx.fill(); mx.fillStyle = '#0A1F23'; for (const sx of [-1, 1]) { mx.beginPath(); mx.arc(cx + sx * s * 0.3, cy - s * 0.1, s * 0.1, 0, 7); mx.fill(); }
        mx.beginPath(); mx.ellipse(cx, cy + s * 0.25, s * 0.17, s * 0.12, 0, 0, 7); mx.fill(); };
      const etiqueta = (cx, cy, linhas, hi) => { mx.font = '900 60px Montserrat'; const w = Math.max(...linhas.map(l => mx.measureText(l).width)) + 56, h = 26 + linhas.length * 70;
        mx.save(); mx.translate(cx, cy); mx.rotate(-0.015); mx.fillStyle = 'rgba(10,31,35,.25)'; rr(-w / 2 + 6, 8, w, h, 10); mx.fill();
        mx.fillStyle = hi ? '#FFC93C' : '#F2E8D8'; rr(-w / 2, 0, w, h, 10); mx.fill(); mx.fillStyle = '#0A1F23'; mx.textAlign = 'center';
        linhas.forEach((l, i) => mx.fillText(l, 0, 72 + i * 70)); mx.restore(); };
      const polaroid = (cx, cy, w, f, hi, rot, centro) => { const h = w * 1.18; mx.save(); mx.translate(cx, cy); mx.rotate(rot);
        if (hi > 0) { mx.shadowColor = 'rgba(255,201,60,' + (0.9 * hi) + ')'; mx.shadowBlur = 60 * hi; }
        mx.fillStyle = 'rgba(10,31,35,.3)'; mx.fillRect(-w / 2 + 10, -h / 2 + 12, w, h); mx.shadowBlur = 0;
        mx.fillStyle = centro ? '#FFC93C' : '#F2E8D8'; mx.fillRect(-w / 2, -h / 2, w, h);
        if (hi > 0) { mx.strokeStyle = 'rgba(255,201,60,' + hi + ')'; mx.lineWidth = 16; mx.strokeRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20); }
        const iw = w * 0.86; mx.fillStyle = f.bg; mx.fillRect(-iw / 2, -h / 2 + w * 0.07, iw, iw);
        mx.save(); mx.beginPath(); mx.rect(-iw / 2, -h / 2 + w * 0.07, iw, iw); mx.clip();
        if (f.cao) { rosto(-iw * 0.12, -h / 2 + w * 0.07 + iw * 0.42, iw * 0.2, f); cao(iw * 0.24, -h / 2 + w * 0.07 + iw * 0.7, iw * 0.15); }
        else rosto(0, -h / 2 + w * 0.07 + iw * 0.42, iw * 0.22, f);
        if (centro) { mx.font = '900 ' + Math.round(iw * 0.2) + 'px Montserrat'; mx.textAlign = 'center'; mx.fillStyle = '#FFC93C'; mx.fillText('★', iw * 0.32, -h / 2 + w * 0.07 + iw * 0.25);
          const bx = -iw * 0.34, by = -h / 2 + w * 0.07 + iw * 0.62; mx.fillStyle = '#D49A4E'; rr(bx - iw * 0.07, by, iw * 0.14, iw * 0.2, 8); mx.fill(); mx.fillStyle = '#F2E8D8'; mx.fillRect(bx - iw * 0.03, by - iw * 0.05, iw * 0.06, iw * 0.05); }
        mx.restore();
        mx.fillStyle = '#9C452A'; mx.beginPath(); mx.arc(0, -h / 2 + 14, 16, 0, 7); mx.fill(); mx.fillStyle = 'rgba(255,255,255,.5)'; mx.beginPath(); mx.arc(-5, -h / 2 + 9, 5, 0, 7); mx.fill();
        mx.restore(); return h; };
      const postit = (cx, cy, txt, rot) => { mx.save(); mx.translate(cx, cy); mx.rotate(rot); mx.fillStyle = 'rgba(10,31,35,.25)'; mx.fillRect(-92, -82, 190, 176); mx.fillStyle = '#FFC93C'; mx.fillRect(-98, -90, 190, 176);
        mx.fillStyle = '#0A1F23'; mx.font = '900 46px Montserrat'; mx.textAlign = 'center'; txt.split('|').forEach((l, i, a) => mx.fillText(l, -3, 12 + (i - (a.length - 1) / 2) * 50)); mx.restore(); };
      const FW = 300, CW = 400;
      let muralKey = '';
      const desenhaMural = (hiIdx, hiK) => {
        const key = hiIdx + ':' + Math.round(hiK * 8); if (key === muralKey) return; muralKey = key;
        const Rm = mulberry32(5);
        mx.fillStyle = '#D49A4E'; mx.fillRect(0, 0, MWp, MHp);
        for (let i = 0; i < 9000; i++) { const v = Rm(); mx.fillStyle = v < 0.5 ? 'rgba(107,68,48,.22)' : 'rgba(242,232,216,.16)'; const s = 2 + Rm() * 5; mx.fillRect(Rm() * MWp, Rm() * MHp, s, s); }
        postit(MWp * 0.33, MHp * 0.13, 'QUEM|PAGA?', -0.08); postit(MWp * 0.67, MHp * 0.13, '???', 0.07); postit(MWp * 0.5, MHp * 0.9, 'PUBLI?', -0.04);
        FOTOS.forEach((f, i) => { const cx = f.u * MWp, cy = f.v * MHp, h = polaroid(cx, cy, FW, f, hiIdx === i ? hiK : 0, [-0.04, 0.05, 0.03, -0.05][i % 4]);
          etiqueta(cx, cy + h / 2 + 6, f.lab, hiIdx === i && hiK > 0.5); });
        const hc = polaroid(CEN.u * MWp, CEN.v * MHp, CW, { bg: '#0F2E33', pele: '#e9b693', cab: '#141414', tipo: 0, oculos: true, camisa: '#D49A4E' }, hiIdx === 9 ? hiK : 0, 0.01, true);
        etiqueta(CEN.u * MWp, CEN.v * MHp + hc / 2 + 4, ['O FAMOSO', 'E O PERFUME'], hiIdx === 9 && hiK > 0.5);
        mTex.needsUpdate = true;
      };
      desenhaMural(-1, 0);
      const w2 = (u, v, dz = 0.03) => new THREE.Vector3(MX + (u - 0.5) * MW, MY + (0.5 - v) * MH, MZ + dz);
      const pinV = (f, w) => f.v - (w * 1.18 / 2 - 14) / MHp;
      const centroPin = w2(CEN.u, pinV(CEN, CW));
      const fioM = M(PIM, { roughness: 0.7 });
      const tubo = (a, b) => { const m = a.clone().lerp(b, 0.5); m.y -= 0.05 + 0.04 * a.distanceTo(b); m.z += 0.025; return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 24, 0.008, 6); };
      bon.fios = FOTOS.map(f => { const a = w2(f.u, pinV(f, FW)); const ms = new THREE.Mesh(tubo(a, centroPin), fioM); ms.castShadow = true; loja.add(ms); return { ms, a }; });
      for (const p of [centroPin, ...bon.fios.map(f => f.a)]) { const pin = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), M(PIM, { roughness: 0.3 })); pin.position.copy(p).add(new THREE.Vector3(0, 0, 0.01)); loja.add(pin); }
      bon.fotoPos = FOTOS.map(f => w2(f.u, f.v + 0.06, 0)).concat([w2(CEN.u, CEN.v + 0.05, 0)]);
      const IFIO = Q.fioAnimado ?? 3;   // o barbante que ele esta prendendo no comeco

      // foto do review sincero: na mao dele e depois pregada SEPARADA, fora do mural, sem barbante
      const fotoCanvas = () => { const c = document.createElement('canvas'); c.width = 512; c.height = 820; const x = c.getContext('2d');
        x.fillStyle = '#F2E8D8'; x.fillRect(0, 0, 512, 604); x.fillStyle = '#7DBFB3'; x.fillRect(36, 36, 440, 440);
        const sv = mx; return { c, x, sv }; };
      const fc = fotoCanvas(); { const x = fc.x; const s = 90, cx = 256, cy = 230;
        x.fillStyle = '#c48a66'; x.beginPath(); x.arc(cx, cy, s, 0, 7); x.fill(); x.fillStyle = '#2a1a14'; x.beginPath(); x.arc(cx, cy - s * 0.2, s * 1.02, Math.PI * 1.02, Math.PI * 1.98); x.fill();
        x.fillStyle = '#0A1F23'; for (const sx of [-1, 1]) { x.beginPath(); x.ellipse(cx + sx * 32, cy + 5, 8, 12, 0, 0, 7); x.fill(); }
        x.strokeStyle = '#0A1F23'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy + 28, 26, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
        x.fillStyle = '#0F2E33'; x.beginPath(); x.ellipse(cx, cy + 160, 115, 72, 0, Math.PI, 0); x.fill();
        x.fillStyle = '#D49A4E'; x.fillRect(cx + 70, cy + 40, 44, 62); x.fillStyle = '#F2E8D8'; x.fillRect(cx + 82, cy + 28, 20, 14);
        x.fillStyle = '#9C452A'; x.beginPath(); x.arc(256, 18, 14, 0, 7); x.fill();
        x.fillStyle = '#FFC93C'; x.fillRect(16, 630, 480, 180); x.fillStyle = '#0A1F23'; x.font = '900 52px Montserrat'; x.textAlign = 'center'; x.fillText('COMPROU DO', 256, 705); x.fillText('PRÓPRIO BOLSO ✅', 256, 770); }
      const fTex = new THREE.CanvasTexture(fc.c); fTex.colorSpace = THREE.SRGBColorSpace; fTex.anisotropy = 8;
      const fotoMesh = sc => { const m_ = new THREE.Mesh(new THREE.PlaneGeometry(0.5 * sc, 0.8 * sc), new THREE.MeshStandardMaterial({ map: fTex, transparent: true, roughness: 0.9 })); return m_; };
      bon.fotoFinal = new THREE.Group(); bon.fotoFinal.position.set(Q.fotoX ?? 2.2, 2.0, MZ + 0.01); loja.add(bon.fotoFinal); { const fundo = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.88), M(PET)); fundo.position.z = -0.004; bon.fotoFinal.add(fundo); } bon.fotoFinal.add(fotoMesh(1)); bon.fotoFinal.visible = false;
      bon.fotoMao = new THREE.Group(); bon.fotoMao.position.set(0, -0.62, 0.1); bon.fotoMao.rotation.x = -0.2; hero.armR.add(bon.fotoMao); { const fm = fotoMesh(0.45); fm.rotation.y = Math.PI; fm.position.z = -0.01; bon.fotoMao.add(fm); bon.fotoMao.add(fotoMesh(0.45)); } bon.fotoMao.visible = false;

      // guarda-roupa, prateleira de perfumes, quadro, mesinha com notebook, tapete
      box2(0.55, 2.5, 1.2, algM, 3.0, 1.25, -1.68);
      box2(0.02, 2.4, 0.012, cedroM, 2.72, 1.25, -1.68);
      for (const s of [-1, 1]) box2(0.03, 0.3, 0.03, goldM, 2.71, 1.3, -1.68 + s * 0.08);
      box2(0.26, 0.04, 1.0, cedroM, 3.15, 1.62, 0.25);
      [[0, 0xE6AEB9], [3, 0x2f6f7a], [1, 0xd49a4e], [2, 0xb8456a]].forEach(([k, c], i) => { const b = bottle(k, c, goldM, 0.75); b.position.set(3.13, 1.64, -0.1 + i * 0.24); loja.add(b); });
      { const c = document.createElement('canvas'); c.width = 300; c.height = 400; const x = c.getContext('2d'); x.fillStyle = '#0F2E33'; x.fillRect(0, 0, 300, 400);
        x.fillStyle = '#D49A4E'; x.beginPath(); x.arc(150, 170, 80, 0, 7); x.fill(); x.fillStyle = '#7DBFB3'; x.fillRect(0, 250, 300, 150); x.fillStyle = '#F2E8D8'; x.fillRect(0, 250, 300, 10);
        const t_ = new THREE.CanvasTexture(c); t_.colorSpace = THREE.SRGBColorSpace; const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshStandardMaterial({ map: t_, roughness: 0.8 }));
        p.rotation.y = -Math.PI / 2; p.position.set(3.27, 2.45, 0.25); loja.add(p); box2(0.03, 0.84, 0.64, cedroM, 3.285, 2.45, 0.25); }
      box2(0.62, 0.05, 1.15, cedroM, -2.9, 0.78, 1.4);
      for (const [dx, dz] of [[-0.26, -0.52], [0.26, -0.52], [-0.26, 0.52], [0.26, 0.52]]) box2(0.04, 0.76, 0.04, cedroM, -2.9 + dx, 0.38, 1.4 + dz);
      box2(0.3, 0.015, 0.42, M(0x2c3036, { metalness: 0.4, roughness: 0.4 }), -2.86, 0.81, 1.4);
      { const sc = box2(0.012, 0.28, 0.42, M(0x2c3036, { metalness: 0.4, roughness: 0.4 }), -3.02, 0.95, 1.4); sc.rotation.z = -0.2;
        const tl = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.24), new THREE.MeshBasicMaterial({ color: 0xdcd6e2, toneMapped: false })); tl.rotation.y = Math.PI / 2; tl.rotation.x = 0; tl.position.set(-3.0, 0.95, 1.4); tl.rotation.z = 0; loja.add(tl); }
      mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 16), M(AMBAR, { roughness: 0.5 }), -2.8, 0.86, 1.85, loja);
      { const tp = new THREE.Mesh(new THREE.CircleGeometry(1.05, 48), M(AMBAR, { roughness: 1 })); tp.rotation.x = -Math.PI / 2; tp.position.set(0.7, 0.012, -0.35); tp.receiveShadow = true; loja.add(tp);
        const an = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.92, 48), M(CREME, { roughness: 1 })); an.rotation.x = -Math.PI / 2; an.position.set(0.7, 0.014, -0.35); loja.add(an); }
      // luz de teto
      { const pl_ = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 24), M(CREME)); pl_.position.set(0.3, 4.5, 0.2); loja.add(pl_); }
      // 21/11 (Osiany): quarto mais ESCURO que claro, sem estourar e sem piscar: persiana quase fechada, luz de teto apagada,
      // abajur + luz em cima do mural + brilho do notebook; sem raios de sol e sem poeira (eram eles que "piscavam" a cada corte)
      cine.slats.forEach(s_ => (s_.rotation.z = -1.25)); cine.sky.material.color.setScalar(0.45);
      renderer.toneMappingExposure = Q.exposicao ?? 0.72;
      bon.pend = [new THREE.PointLight(0xfff2e0, 0.0, 7, 1.6)]; bon.pend[0].position.set(0.3, 3.9, 0.4); scene.add(bon.pend[0]);
      { const fc_ = new THREE.PointLight(0xffd2a0, 0.25, 4.0, 1.6); fc_.position.set(-2.0, 2.3, 0.4); scene.add(fc_);
        const nb = new THREE.PointLight(0xa9c2ff, 1.1, 2.8, 1.8); nb.position.set(-2.7, 1.05, 1.4); scene.add(nb);
        const sp = new THREE.SpotLight(0xffdcb0, Q.luzMural ?? 16, 7, 0.52, 0.65, 1.4); sp.position.set(MX, 4.1, -0.35); sp.target.position.set(MX, MY - 0.1, MZ); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); scene.add(sp, sp.target); }
      // 21/11 v3: quarto ESCURINHO de investigacao (noir): so abajur, luz em cima do mural, notebook azulado e fresta da persiana
      bon.keyH = { k: new THREE.PointLight(0xffe0c2, Q.keyRosto ?? 1.6, 2.6, 2), r: new THREE.PointLight(0x9db8ff, Q.contorno ?? 1.4, 2.2, 2) };
      bon.keyA = { k: new THREE.PointLight(0xffe0c2, Q.keyRosto ?? 1.6, 2.6, 2), r: new THREE.PointLight(0x9db8ff, Q.contorno ?? 1.4, 2.2, 2) };
      scene.add(bon.keyH.k, bon.keyH.r, bon.keyA.k, bon.keyA.r);
      bon.quartoLuz = (t, shot) => { cine.sun.intensity = Q.sol ?? 0.9; cine.shafts.visible = cine.dust.visible = false; cine.hemi.intensity = 0.01; cine.bounce.intensity = 0.08;
        cine.winL.intensity = 0.25; cine.rimL.intensity = 0.15; cine.scrL.intensity = 0; bon.shelfL.intensity = 0; bon.fill.intensity = Q.preenche ?? 0.35;
        bloom.strength = 0.0; scene.environmentIntensity = Q.ambiente ?? 0.18; };
      face = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ color: 0x222222 })); face.position.set(0, -5, 0); face.visible = false; loja.add(face);

      // ---- movimento (mesmo sistema da praca: V.mov / V.estado / V.yaw) ----
      // pernas com joelho: [quadril, joelho] (troca as pernas retas do boneco)
      const legRig = kid => { const ch = kid.g.children, pm = ch[0].material, sm = ch[2].material; for (let i = 0; i < 4; i++) ch[i].visible = false;
        kid.pernas = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.14, 0.64, 0); kid.g.add(hip); mesh(new THREE.BoxGeometry(0.2, 0.31, 0.22), pm, 0, -0.145, 0, hip);
          const knee = new THREE.Group(); knee.position.set(0, -0.29, 0); hip.add(knee); mesh(new THREE.BoxGeometry(0.19, 0.25, 0.21), pm, 0, -0.11, 0, knee); mesh(new THREE.BoxGeometry(0.25, 0.14, 0.38), sm, 0, -0.28, 0.06, knee); return [hip, knee]; }); };
      [hero, val].forEach(legRig);
      const pernas = (kid, s, k, amp, ph, c = 0) => kid.pernas.forEach(([hip, knee], i) => { const sn = Math.sin(ph + i * Math.PI);
        hip.rotation.x = -Math.PI / 2 * s - (Math.PI / 2 + 0.7) * c + 0.08 * k + sn * 0.7 * amp * (1 - s - c); knee.rotation.x = Math.PI / 2 * s + (Math.PI / 2 + 0.7) * c + Math.PI / 2 * k + Math.max(0, -sn) * amp * 0.9 * (1 - s); });
      // movimento: V.mov = { h: { ini: [x, z], m: [[t0, t1, x, z], ...] }, a: {...} } · V.estado = { h: [[t0, t1, 'senta'|'ajoelha'|'reverencia'], ...] } · V.yaw = [[t0, t1, angulo, quem]]
      const MV = V.mov || {}, ES = V.estado || {}, YW = V.yaw || [];
      bon.pos = (who, t) => { const m = MV[who] || { ini: who === 'h' ? [bon.hx, bon.hz] : [bon.ax, bon.az], m: [] };
        let x = m.ini[0], z = m.ini[1], mov = 0, dir = 0, vel = 0;
        for (const [a, b, X, Z] of m.m) { if (t >= b) { x = X; z = Z; continue; } if (t >= a) { const k = smooth(a, b, t); dir = Math.atan2(X - x, Z - z); vel = Math.hypot(X - x, Z - z) / (b - a); x += (X - x) * k; z += (Z - z) * k; mov = win(t, a, b, 0.3); } break; }
        return { x, z, mov, dir, vel }; };
      const est = (who, k, t) => { let w = 0; for (const [a, b, q] of (ES[who] || [])) if (q === k) w = Math.max(w, win(t, a, b, 0.45)); return w; };
      window.__bonPos = (who, t) => { if (who === 'par') { const a = bon.pos('h', t), b = bon.pos('a', t); return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }; } return bon.pos(who, t); };
      const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a)), lerpA = (a, b, k) => a + wrapA(b - a) * k;
      const yawDe = (who, me, ot, t) => { let y = lerpA(Math.atan2(ot.x - me.x, ot.z - me.z), 0, 0.55);
        if (me.mov > 0) y = lerpA(y, me.dir, me.mov);
        y = lerpA(y, 0, Math.max(est(who, 'senta', t), est(who, 'chao', t))); y = lerpA(y, Math.PI, Math.max(est(who, 'ajoelha', t), est(who, 'reverencia', t)));
        for (const [a, b, v, q] of YW) if (q === who) { const w = win(t, a, b, 0.4); if (w > 0) y = lerpA(y, v, w); }
        return y; };
      bon.pracaPre = (P, A, t) => { const ph = bon.pos('h', t), pa = bon.pos('a', t); P.yaw = yawDe('h', ph, pa, t); A.yaw = yawDe('a', pa, ph, t); bon._ph = ph; bon._pa = pa; P.x = ph.x; P.z = ph.z; A.x = pa.x; A.z = pa.z; };
      bon.pracaPose = (P, A, t) => { for (const [who, Q, pp] of [['h', P, bon._ph], ['a', A, bon._pa]]) { Q.x = pp.x; Q.z = pp.z;
          const s = est(who, 'senta', t), r = est(who, 'reverencia', t), k = Math.max(est(who, 'ajoelha', t), r), run = clamp(pp.vel / 2.2), f = 7 + 5 * run;
          const c = est(who, 'chao', t), d = est(who, 'deita', t);   // chao = sentado no chao com as pernas pra frente; deita = recostado pra tras, apoiado nas maos
          Q.hop += -0.29 * s - 0.31 * k - 0.47 * c; Q.lean -= 0.04 * s + 0.05 * c;
          if (d > 0) { Q.lean -= 0.5 * d; Q.aLx += (0.85 - Q.aLx) * d; Q.aRx += (0.85 - Q.aRx) * d; Q.aLz += (-0.3 - Q.aLz) * d; Q.aRz += (0.3 - Q.aRz) * d; Q.hp -= 0.25 * d; }
          if (r > 0) { const b = 0.5 + 0.5 * Math.sin(t * 3.4); Q.lean += r * (0.12 + 0.3 * b); Q.aLx += (-2.7 - Q.aLx) * r; Q.aRx += (-2.7 - Q.aRx) * r; Q.aLz += (0.2 - Q.aLz) * r; Q.aRz += (-0.2 - Q.aRz) * r; Q.hp += 0.1 * r * b; }
          if (pp.mov > 0) { Q.hop += (0.03 + 0.05 * run) * Math.abs(Math.sin(t * f)) * pp.mov; Q.lean += 0.08 * run * pp.mov; Q.aLx += 0.55 * Math.sin(t * f) * pp.mov * (0.6 + run); Q.aRx -= 0.55 * Math.sin(t * f) * pp.mov * (0.6 + run); }
          Q._s = s; Q._c = c; Q._k = k; Q._m = pp.mov; Q._run = run; Q._f = f; } };
      { const base = bon.pracaPose, DY = Q.sentaDy ?? 0.2; bon.pracaPose = (P, A, t) => { base(P, A, t); P.hop += DY * P._s; A.hop += DY * A._s; }; }
      const _hv = new THREE.Vector3();
      const janela = (t, ab, f = 0.3) => ab ? win(t, ab[0], ab[1], f) : 0;
      bon.pracaPos2 = (P, A, t) => {
        pernas(hero, P._s, P._k, P._m * (0.5 + 0.4 * P._run), t * P._f, P._c);
        pernas(val, A._s, A._k, A._m * (0.5 + 0.4 * A._run), t * A._f + 1.3, A._c);
        bon.porta.rotation.y = -1.45 * (Q.porta ? smooth(Q.porta[0], Q.porta[1], t) : 1);
        bon.gaveta.position.z = CZm + 0.34 * janela(t, Q.gaveta, 0.5);
        bon.gavFrasco.visible = t < (Q.pegaFrasco ?? 1e9);
        bon.cafeBiaR.visible = t < (Q.entrega ?? -1);
        bon.cafeRafa.visible = t >= (Q.entrega ?? 1e9) && t < (Q.pousa ?? 1e9);
        bon.cafeMesa.visible = t >= (Q.pousa ?? 1e9);
        bon.cafeBiaL.visible = !(Q.cafeBiaFora && t >= Q.cafeBiaFora[0] && t < Q.cafeBiaFora[1]);
        bon.frascoCama.visible = t >= (Q.largaFrasco ?? 1e9);
        bon.fotoMao.visible = !!Q.fotoMao && t >= Q.fotoMao[0] && t < Q.fotoMao[1];
        if (bon.fotoMao.visible) bon.frasco.visible = false;
        bon.frasco.rotation.x = -0.15 + 1.2 * janela(t, Q.mostraFrasco, 0.25);
        for (const [kid, L] of [[hero, bon.keyH], [val, bon.keyA]]) {
          kid.head.getWorldPosition(_hv); const cx = camera.position.x - _hv.x, cz = camera.position.z - _hv.z, d = Math.hypot(cx, cz) || 1;
          const ux = cx / d, uz = cz / d;
          L.k.position.set(_hv.x + ux * 0.9 - uz * 0.45, _hv.y + 0.45, _hv.z + uz * 0.9 + ux * 0.45);
          L.r.position.set(_hv.x - ux * 0.8 + uz * 0.3, _hv.y + 0.7, _hv.z - uz * 0.8 - ux * 0.3); }   // em pe quando ele mostra o frasco
        const fp = Q.fotoPin ?? 1e9; bon.fotoFinal.visible = t >= fp; bon.fotoFinal.scale.setScalar(Math.max(0.001, back(clamp((t - fp) / 0.35))));
        // barbante sendo preso no comeco: a ponta segue a mao direita dele ate a hora de prender
        const F = bon.fios[IFIO];
        if (F && Q.prende != null && t < Q.prende) { hero.g.updateMatrixWorld(true); _hv.set(0, -0.62, 0.06); hero.armR.localToWorld(_hv);
          F.ms.geometry.dispose(); F.ms.geometry = tubo(_hv.clone(), centroPin); F.solto = true; }
        else if (F && F.solto) { F.ms.geometry.dispose(); F.ms.geometry = tubo(F.a, centroPin); F.solto = false; }
        // destaque da foto mencionada no mural
        let hi = -1, hk = 0; for (const [a, b, i] of (Q.destaque || [])) { const w = win(t, a, b, 0.25); if (w > hk) { hk = w; hi = i; } }
        desenhaMural(hi, hk);
      };
      const H0 = (V.mov && V.mov.h) ? V.mov.h.ini : [0.5, -1.3];
      bon.quartoShots = {
        EST: { p: [0.9, 2.9, 6.6], q: [-0.7, 1.2, -1.0], d: [-0.3, -0.15, -0.9], ease: true, fov: 52 },
        PORTA: { p: [-2.4, 2.3, 5.8], q: [2.4, 1.3, 1.0], d: [0.2, 0, -0.25], fov: 50 },
        MURALW: { p: [MX, 2.05, 2.35], q: [MX, 2.0, MZ], d: [0, 0, -0.25], fov: 52 },
        MURALF: { p: [MX + 0.75, 2.05, 2.9], q: [MX + 0.75, 1.95, MZ], d: [0, 0, -0.2], fov: 54 },
        MC: { p: [MX, 2.1, -0.75], q: [MX, 2.1, MZ], d: [0, 0, -0.12], fov: 46 },
        ...Object.fromEntries(bon.fotoPos.slice(0, 4).map((p, i) => ['M' + (i + 1), { p: [p.x + 0.05, p.y + 0.05, MZ + 1.6], q: [p.x, p.y, MZ], d: [0, 0, -0.12], fov: 42 }])),
        TOUR: { p: [MX - 0.9, 2.0, -0.4], q: [MX + 0.9, 1.95, MZ], d: [0, 0, 0], fov: 50 },
        M4L: { p: [bon.fotoPos[3].x - 0.75, bon.fotoPos[3].y + 0.05, MZ + 1.4], q: [bon.fotoPos[3].x, bon.fotoPos[3].y, MZ], d: [0.05, 0, -0.1], fov: 42 },
        CHR: { rel: 'h', p: [0.75, 1.85, 2.7], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        CHL: { rel: 'h', p: [-0.8, 1.85, 2.7], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        CBIA: { rel: 'a', p: [-0.75, 1.85, 2.7], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        CBIAR: { rel: 'a', p: [0.8, 1.85, 2.7], q: [0, 1.55, 0], d: [0, 0, -0.25], fov: 40 },
        DUO: { rel: 'par', p: [0.15, 1.95, 4.6], q: [0, 1.4, -0.2], d: [0, 0, -0.35], fov: 42 },
        DUOW: { rel: 'par', p: [0.3, 2.3, 6.2], q: [0, 1.3, -0.4], d: [0, 0, -0.3], fov: 46 },
        GAV: { p: [-2.6, 1.7, 0.4], q: [-0.75, 0.95, -1.6], d: [0.05, 0, -0.12], fov: 50 },
        GAVC: { p: [CXm - 0.55, 1.05, CZm + 1.15], q: [CXm + 0.02, 0.48, CZm + 0.42], d: [0.03, -0.04, -0.1], fov: 38 },
        BED: { p: [-2.2, 1.45, 3.4], q: [-2.2, 0.95, -0.1], d: [0, 0, -0.3], fov: 40 },
        BEDW: { p: [-0.6, 1.9, 4.6], q: [-2.0, 0.9, -0.6], d: [0.1, 0, -0.3], fov: 44 },
        BEDH: { rel: 'h', p: [0.35, 1.3, 2.4], q: [0, 1.25, 0], d: [0, 0, -0.2], fov: 40 },
        BEDA: { rel: 'a', p: [-0.35, 1.3, 2.4], q: [0, 1.25, 0], d: [0, 0, -0.2], fov: 40 },
        FOTO: { p: [2.45, 1.95, 0.3], q: [(Q.fotoX ?? 2.2) - 0.2, 1.9, MZ], d: [0, 0, -0.15], fov: 44 },
        CTA: { rel: 'h', p: [0, 2.15, 3.6], q: [0, 1.66, 0], d: [0, 0, -0.25], fov: 40 },
      };
    } else {
      // escritorio: estantes com pastas, quadro de avisos, relogio, planta e a mesa da Bia com o monitor (o monitor mostra os `cards`)
      const whiteM = new THREE.MeshStandardMaterial({ color: 0xf2ede4, roughness: 0.7 });
      const grayM = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.45, metalness: 0.3 });
      const pastaCols = [0x9C452A, 0x6B4430, 0xD49A4E, 0x7DBFB3, 0xE6AEB9, 0x0F2E33, 0xB8BC5C, 0xDCD6E2];
      for (const bx of [-1.95, 1.95]) {
        box2(0.04, 1.75, 0.34, woodD, bx - 0.8, 0.875, -2.15); box2(0.04, 1.75, 0.34, woodD, bx + 0.8, 0.875, -2.15);
        for (const y of [0.05, 0.6, 1.15, 1.72]) box2(1.6, 0.035, 0.34, woodL, bx, y, -2.15);
        for (const y of [0.07, 0.62, 1.17]) { let x = bx - 0.74; const lim = bx + (y > 1 ? 0.2 : 0.72);
          while (x < lim) { const w = 0.06 + R2() * 0.05, h = 0.36 + R2() * 0.1; box2(w, h, 0.28, new THREE.MeshStandardMaterial({ color: pastaCols[(R2() * pastaCols.length) | 0], roughness: 0.65 }), x + w / 2, y + 0.018 + h / 2, -2.13); x += w + 0.008; } }
        const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xc8b89a, roughness: 0.8 })); vaso.position.set(bx + 0.5, 1.84, -2.12); vaso.castShadow = true; loja.add(vaso);
        for (let i = 0; i < 9; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshStandardMaterial({ color: 0x4f7a45, roughness: 0.6, flatShading: true })); const a = i * 2.4; lf.scale.set(0.05, 0.2, 0.015); lf.position.set(bx + 0.5 + Math.cos(a) * 0.08, 2.05, -2.12 + Math.sin(a) * 0.08); lf.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); lf.castShadow = true; loja.add(lf); }
      }
      // quadro de avisos com post-its
      box2(1.7, 1.05, 0.04, new THREE.MeshStandardMaterial({ color: 0xb08a5e, roughness: 0.95 }), 0, 2.35, -2.3);
      box2(1.78, 1.13, 0.03, woodD, 0, 2.35, -2.32);
      for (let i = 0; i < 11; i++) { const pi_ = box2(0.17, 0.17, 0.006, new THREE.MeshStandardMaterial({ color: [0xFFC93C, 0xE6AEB9, 0x7DBFB3, 0xF2E8D8][i % 4], roughness: 0.9 }), -0.65 + (i % 6) * 0.26 + (R2() - 0.5) * 0.05, 2.62 - Math.floor(i / 6) * 0.42 + (R2() - 0.5) * 0.06, -2.275); pi_.rotation.z = (R2() - 0.5) * 0.3; }
      // relogio
      const rel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 32), whiteM); rel.rotation.x = Math.PI / 2; rel.position.set(1.95, 2.75, -2.3); loja.add(rel);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 32), grayM); aro.position.set(1.95, 2.75, -2.28); loja.add(aro);
      for (const [l, r] of [[0.13, 0.6], [0.09, 2.4]]) { const pt = box2(0.012, l, 0.006, grayM, 1.95, 2.75 + l / 2, -2.272); pt.geometry.translate(0, 0, 0); pt.rotation.z = r; pt.position.set(1.95 - Math.sin(r) * l / 2, 2.75 + Math.cos(r) * l / 2, -2.272); }
      // mesa da Bia
      const DX2 = 1.0, DZ2 = 0.3;
      box2(1.7, 0.045, 0.72, woodL, DX2, 0.76, DZ2);
      for (const sx of [-0.8, 0.8]) box2(0.045, 0.74, 0.66, grayM, DX2 + sx, 0.37, DZ2);
      box2(1.6, 0.4, 0.02, grayM, DX2, 0.5, DZ2 + 0.32);
      const mon = new THREE.Group(); mon.position.set(1.42, 0.78, 0.18); mon.rotation.y = -0.5; loja.add(mon);
      box2(0.7, 0.47, 0.035, grayM, 0, 0.42, 0, mon);
      box2(0.05, 0.2, 0.05, grayM, 0, 0.12, -0.03, mon); box2(0.24, 0.015, 0.16, grayM, 0, 0.01, -0.02, mon);
      let monTex = tTex;
      if (V.telaCelular) { const c = document.createElement('canvas'); c.width = 640; c.height = 448; const x = c.getContext('2d');
        x.fillStyle = '#eef1f4'; x.fillRect(0, 0, 640, 448); x.fillStyle = '#1A4A52'; x.fillRect(0, 0, 640, 40);
        for (let r = 0; r < 12; r++) for (let q = 0; q < 5; q++) { x.fillStyle = r % 2 ? '#dfe5ea' : '#f8fafb'; x.fillRect(20 + q * 122, 60 + r * 30, 118, 26); x.fillStyle = '#9aa5ae'; x.fillRect(28 + q * 122, 70 + r * 30, 30 + ((r * 7 + q * 13) % 60), 6); }
        monTex = new THREE.CanvasTexture(c); monTex.colorSpace = THREE.SRGBColorSpace; }
      const faceM = new THREE.MeshBasicMaterial({ map: monTex, toneMapped: false }); faceM.color.setScalar(0.8);
      face = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.448), faceM); face.position.set(0, 0.42, 0.0185); mon.add(face);
      box2(0.46, 0.018, 0.15, new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.6 }), 0.95, 0.79, 0.42).rotation.y = -0.15;
      const caneca = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), new THREE.MeshStandardMaterial({ color: 0x9C452A, roughness: 0.4 })); caneca.position.set(0.45, 0.83, 0.38); caneca.castShadow = true; loja.add(caneca);
      [[0xF2E8D8, 0.0], [0xDCD6E2, 0.012]].forEach(([c, dy], i) => box2(0.21, 0.01, 0.29, new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }), 0.68 + i * 0.05, 0.79 + dy, 0.2).rotation.y = 0.3 * (i ? -1 : 1));
      const vidro = bottle(1, 0xE6AEB9, goldM, 0.7); vidro.position.set(0.32, 0.785, 0.22); loja.add(vidro);   // o perfume da Bia na mesa
      // luz de teto do escritorio
      const painel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.5), new THREE.MeshBasicMaterial({ color: 0xfff6e8, toneMapped: false })); painel.position.set(0.3, 4.48, 0.2); loja.add(painel);
      bon.pend = [new THREE.PointLight(0xfff2e0, 1.6, 6, 1.6)]; bon.pend[0].position.set(0.3, 3.9, 0.5); scene.add(bon.pend[0]);
      bon.monL = new THREE.PointLight(0x9cc8ff, 0.6, 2.2, 2); bon.monL.position.set(1.2, 1.2, 0.5); scene.add(bon.monL);
    }
    cine.screen = face;

    // --- planos de camera desta cena ---
    set.updateMatrixWorld(true); loja.updateMatrixWorld(true);
    const S2 = new THREE.Vector3(); face.getWorldPosition(S2); const n2 = new THREE.Vector3(0, 0, 1).applyQuaternion(face.getWorldQuaternion(new THREE.Quaternion()));
    const at2 = (k, dy) => S2.clone().addScaledVector(n2, k).add(new THREE.Vector3(0, dy, 0)).toArray();
    const H_ = [bon.hx, 1.7, bon.hz], A_ = [bon.ax, 1.72, bon.az];
    // ajuste 14/11: planos fechados recuam ate mostrar cabeca + tronco (nada de so o casco da cabeca)
    const longe = (p, q, min) => { const d = p.map((v, i) => v - q[i]), L = Math.hypot(...d), k = Math.max(1, min / L); return q.map((v, i) => v + d[i] * k); };
    Object.assign(SHOTS, {
      EST: { p: [0.7, 2.45, 7.4], q: [0.2, 1.65, -1.2], d: [-0.35, -0.2, -1.7], ease: true, fov: 50 },
      W2: { p: [0.2, 2.0, 5.7], q: [0.15, 1.62, -0.6], d: [0, 0, -0.5], fov: 42 },
      // 14/11 (regra da Osiany): close de frente, sem a cabeca do outro boneco cortada na borda
      CH: { p: [-0.2, 1.9, 3.4], q: [bon.hx, 1.55, bon.hz], d: [0, 0, -0.3] },
      CV: { p: [0.6, 1.9, 3.0], q: [bon.ax, 1.6, bon.az], d: [0, 0, -0.3] },
      LOWH: { p: longe([0.15, 0.95, 3.0], [bon.hx, 1.8, bon.hz], 3.7), q: [bon.hx, 1.8, bon.hz], d: [0.1, 0.05, -0.1] },
      LOWV: { p: longe([-0.25, 1.0, 2.5], [bon.ax, 1.88, bon.az], 3.7), q: [bon.ax, 1.88, bon.az], d: [0.1, 0.05, -0.1] },
      // plano de costas: mostra o CORPO de quem esta de costas + a outra pessoa de frente (nunca so o casco)
      OTS: { p: [-2.5, 2.35, 4.4], q: [0.25, 1.4, -0.3], d: [0.12, 0, -0.25], fov: 38 },
      OTSV: { p: [2.9, 2.4, 3.9], q: [0.1, 1.35, -0.15], d: [-0.12, 0, -0.2], fov: 48 },
      ANDA: { p: [0.5, 2.5, 7.4], q: [0.45, 1.55, -1.0], d: [0, 0, -0.4], fov: 50 },   // os dois inteiros mesmo com o Valdir la na parede
      PLACA: { p: [1.6, 2.2, 2.6], q: [1.45, 1.85, -1.6], d: [0, 0, -0.25], fov: 44 },   // o Valdir de corpo inteiro na parede + o Rafa olhando
      MOUTH: { p: [-0.3, 1.76, 2.45], q: [bon.hx, 1.66, bon.hz], d: [0, 0, -0.12] },
      MOUTHV: { p: [0.62, 1.8, 1.7], q: [bon.ax, 1.68, bon.az], d: [0, 0, -0.12] },
      CAMH: { p: [bon.hx + 0.05, 2.0, 4.5], q: [bon.hx, 2.02, bon.hz], d: [0, 0, -0.55] },
      CAMA: { p: [bon.ax - 0.1, 2.05, 4.1], q: [bon.ax, 2.0, bon.az], d: [0, 0, -0.5] },
      SCR: { fov: CENA === 'loja' ? 46 : undefined, p: at2(CENA === 'loja' ? 2.4 : 1.8, CENA === 'loja' ? 0.3 : 0.0), q: CENA === 'loja' ? [S2.x, S2.y + 0.1, S2.z] : S2.toArray(), d: n2.clone().multiplyScalar(-0.15).toArray(), scr: true },
      SCRE: { p: at2(CENA === 'loja' ? 3.9 : 1.9, 0.05), q: S2.toArray(), d: n2.clone().multiplyScalar(-0.7).toArray(), scr: true, ease: true },
      ORB: { orbit: [0.1, 1.7, -0.05, 3.7, 0.55, -0.25, 1.95], q: [0.1, 1.65, -0.05] },
      // tela/placa (exemplos): plano aberto com os dois bonecos embaixo e o exemplo em cima, sem tampar ninguem
      ...(V.placa && !V.placaSeq && !V.telaCelular ? { SCR: { p: [0.9, 2.3, 5.6], q: [0.7, 2.2, -1.0], d: [0, 0, -0.3], fov: 46, scr: true }, SCRE: { p: [0.9, 2.3, 5.6], q: [0.7, 2.2, -1.0], d: [0, 0, -0.5], fov: 46, scr: true } } : {}),
      ...(V.telaCelular ? { SCR: { p: [0.2, 2.25, 6.0], q: [0.1, 2.15, -0.6], d: [0, 0, -0.3], fov: 44, scr: true }, SCRE: { p: [0.2, 2.25, 6.0], q: [0.1, 2.15, -0.6], d: [0, 0, -0.5], fov: 44, scr: true } } : {}),
      ORB2: { orbit: [0.1, 1.7, -0.05, 3.3, -0.4, 0.45, 2.15], q: [0.1, 1.7, -0.05] },
      REV: { p: [0.3, 1.85, 6.2], q: [0.1, 1.7, -0.8], d: [-0.15, 0.1, -1.7], ease: true, fov: 44 },
    });
    if (bon.praca) Object.assign(SHOTS, bon.pracaShots);
    if (bon.quarto) Object.assign(SHOTS, bon.quartoShots);
  }

  function bonAcoes(P, who, t) {
    let fr = 0, cel = 0, celA = 0, cx = 0;
    for (const ac of (V.acoes || [])) {
      const [a, b, k, q = 'h'] = ac; if (q !== who) continue;
      const w = win(t, a, b, 0.25); if (w < 0.001) continue;
      if (k === 'cheira') { P.aRx += (-2.4 - P.aRx) * w; P.aRz += (-0.55 - P.aRz) * w; P.hp += 0.12 * w; P.eye -= 0.8 * w; P.mouth += 0.3 * w; fr = Math.max(fr, w); }
      if (k === 'segura') { P.aRx += (-1.0 - P.aRx) * w; P.aRz += (-0.15 - P.aRz) * w; fr = Math.max(fr, w); }
      if (k === 'bracos') { P.aLx -= 0.85 * w; P.aLz += 0.6 * w; P.aRx -= 0.85 * w; P.aRz -= 0.6 * w; P.browT -= 0.12 * w; P.mouth -= 0.35 * w; }
      if (k === 'apontaPlaca') { P.aRz += 1.35 * w; P.aRx -= 0.5 * w; P.hy += 0.45 * w; }
      if (k === 'celular') { P.aLx += (-2.85 - P.aLx) * w; P.aLz += (-0.16 - P.aLz) * w; P.hr -= 0.12 * w; cel = Math.max(cel, w); }
      if (k === 'olhaCamera') { P.yaw += (0.05 - P.yaw) * w; P.hy *= 1 - w; P.hp *= 1 - w; }
      if (k === 'sorriso') { P.mouth += 0.9 * w; P.hp -= 0.05 * w; P.browT += 0.08 * w; }
      if (k === 'debocha') { P.mouth += 0.7 * w; P.hr += 0.1 * w; P.eye -= 0.25 * w; P.browT -= 0.1 * w; }
      if (k === 'inclina') { P.lean += 0.12 * w; P.hp += 0.06 * w; }
      if (k === 'pula') P.hop += 0.08 * w * Math.abs(Math.sin(t * 8));
      if (k === 'comemora') { P.aLz -= 2.4 * w; P.aRz += 2.3 * w; P.hop += 0.09 * w * Math.abs(Math.sin(t * 9)); P.mouth += 0.5 * w; }
      if (k === 'pensa') { P.aLx -= 2.3 * w; P.aLz += 0.35 * w; P.hr += 0.08 * w; }
      if (k === 'mostraCelular') { P.aRx += (-1.55 - P.aRx) * w; P.aRz += (-0.3 - P.aRz) * w; P.hp += 0.1 * w; celA = Math.max(celA, w); }
      if (k === 'escaneia') { P.aLx += (-1.45 - P.aLx) * w; P.aLz += (0.25 - P.aLz) * w; P.aRx += (-1.2 - P.aRx) * w; P.aRz += (-0.25 - P.aRz) * w; P.hp += 0.15 * w; cel = Math.max(cel, w); cx = Math.max(cx, w); }
      if (k === 'mostraCaixa') { P.aRx += (-1.5 - P.aRx) * w; P.aRz += (-0.3 - P.aRz) * w; cx = Math.max(cx, w); }
      if (k === 'mostraFrasco') { P.aRx += (-1.25 - P.aRx) * w; P.aRz += (-0.45 - P.aRz) * w; P.hp += 0.1 * w; fr = Math.max(fr, w); }
      if (k === 'aponta') { P.aLx += (-2.3 - P.aLx) * w; P.aLz += (-0.12 - P.aLz) * w; }
      if (k === 'prende') { P.aLx += (-2.6 - P.aLx) * w; P.aRx += (-2.5 - P.aRx) * w; P.aLz += (0.12 - P.aLz) * w; P.aRz += (-0.12 - P.aRz) * w; P.hp -= 0.15 * w; }
      if (k === 'entrega') { P.aRx += (-1.35 - P.aRx) * w; P.aRz += (-0.08 - P.aRz) * w; }
      if (k === 'bebe') { P.aLx += (-2.25 - P.aLx) * w; P.aLz += (0.55 - P.aLz) * w; P.hp -= 0.12 * w; }
      if (k === 'gaveta') { P.aRx += (-0.85 - P.aRx) * w; P.aRz += (-0.1 - P.aRz) * w; P.lean += 0.22 * w; P.hp += 0.04 * w; }
      if (k === 'arranca') { P.aRz += (2.3 - P.aRz) * w; P.aRx += (-0.6 - P.aRx) * w; P.hy += 0.5 * w; P.hp -= 0.2 * w; }
    }
    return { fr, cel, celA, cx };
  }
  const _tS = new THREE.Vector3(), _tN = new THREE.Vector3(), _tU = new THREE.Vector3(), _tQ = new THREE.Quaternion();
  function bonTela(shot, t) {
    let m = bon.celA.visible ? bon.celAscr : bon.cel.visible && bon.celScr ? bon.celScr : null;
    if (!m) { bon.celA.visible = true; m = bon.celAscr; }
    hero.g.updateMatrixWorld(true); bon.val.g.updateMatrixWorld(true);
    m.getWorldPosition(_tS); m.getWorldQuaternion(_tQ);
    _tN.set(0, 0, 1).applyQuaternion(_tQ); _tU.set(0, 1, 0).applyQuaternion(_tQ);
    const fov = 33, hh = Math.tan(fov * Math.PI / 360) * 1080 / 1920, dist = (0.1 / 0.9) / hh;   // a tela ocupa ~90% da largura
    camera.fov = fov; camera.near = dist - 0.006; camera.updateProjectionMatrix();   // corta o que fica entre a camera e a tela (mao, cabeca)
    if (cine.bokeh) cine.bokeh.uniforms.nearClip.value = camera.near;
    camera.position.copy(_tS).addScaledVector(_tN, dist);
    camera.position.x += Math.sin(t * 0.7) * 0.004; camera.position.y += Math.sin(t * 0.53 + 1.3) * 0.003;   // leve camera na mao
    camera.up.copy(_tU); camera.lookAt(_tS);
    shot.focus = dist;
  }
  function frameBonecos(t, env, shot) {
    const P = actor('h', t), A = actor('a', t);
    P.x = bon.hx; P.z = bon.hz; P.yaw = 0.5; A.x = bon.ax; A.z = bon.az; A.yaw = -0.5;
    if (bon.praca || bon.mover) bon.pracaPre(P, A, t);
    const ph = bonAcoes(P, 'h', t), pa = bonAcoes(A, 'a', t);
    const PR = V.props || {};
    const inW = l => (l || []).some(([a, b]) => t >= a && t < b);
    bon.frasco.visible = ph.fr > 0.05 || inW(PR.frasco);
    bon.cel.visible = ph.cel > 0.25 || inW(PR.celular);
    bon.celA.visible = pa.celA > 0.25 || inW(PR.celularA);
    bon.caixa.visible = ph.cx > 0.25 || inW(PR.caixa);
    if (bon.caixa.visible) bon.frasco.visible = false;
    // boca: durante TODA a fala ela fica abrindo e fechando (volume da voz + vai-e-vem de silabas), nunca parada
    const mouthOf = (who, Q, ph) => { if (!talking(who, t)) return;
      const sil = 0.5 + 0.5 * Math.sin(t * 17 + ph) * Math.sin(t * 6.1 + ph * 2.3);
      Q.open = Math.max(Q.open, clamp(0.3 + 0.7 * env + 0.3 * sil, 0.3, 1)); };
    mouthOf('h', P, 0.4); mouthOf('a', A, 2.1);
    // o segundo personagem anda (V.anda = [[inicio, fim, 'parede'|'casa'], ...])
    const casa = new THREE.Vector3(bon.ax, 0, bon.az), spot = new THREE.Vector3(1.38, 0, -1.42), lado = new THREE.Vector3(0.82, 0, -1.25);   // lado: passo pro lado pra admirar a placa (sai do close)
    let ondeA = casa.clone(), movendo = 0, rumo = null, naParede = false;
    for (const [a, b, alvo] of (V.anda || [])) {
      const de = ondeA.clone(), para = alvo === 'parede' ? spot : alvo === 'lado' ? lado : casa;
      if (t >= b) { ondeA = para.clone(); naParede = alvo === 'parede'; if (alvo === 'lado') { A.yaw = 0.35; } continue; }
      if (t >= a) { const k = smooth(a, b, t); ondeA = de.clone().lerp(para, k); movendo = 1; rumo = Math.atan2(para.x - de.x, para.z - de.z); naParede = false; }
      break;
    }
    A.x = ondeA.x; A.z = ondeA.z;
    if (movendo) { A.yaw = rumo; A.hy = 0; A.hop += 0.06 * Math.abs(Math.sin(t * 13)); }
    else if (naParede) { A.yaw = Math.PI * 0.92; A.hy *= 0.3; }
    // placa: V.placaSeq = { aparece (surge na mao), pega (tira da parede), joga (joga fora), pendura }
    const S = V.placaSeq; let placaMao = 0, bracosCima = 0;
    if (S && bon.placa) {
      const hp = new THREE.Vector3(A.x + Math.sin(A.yaw) * 0.5, 1.52 + A.hop, A.z + Math.cos(A.yaw) * 0.5), W = bon.placaCasa;
      let pos = W.clone(), ry = 0, sc = 1, vis = true, sw0 = null;
      if (S.aparece != null && t < S.aparece && (S.pega == null || S.aparece < S.pega)) vis = false;
      else if (S.pega != null && t < S.pega) sw0 = -10;
      else if (S.pega != null && t < S.pega + 0.4) { const k = smooth(S.pega, S.pega + 0.4, t); pos = W.clone().lerp(hp, k); ry = (A.yaw - 2 * Math.PI * Math.round(A.yaw / (2 * Math.PI))) * k; bracosCima = 1 - k; placaMao = k; }
      else if (S.joga != null && t >= S.joga && t < (S.aparece ?? 1e9)) { const k = clamp((t - S.joga) / 0.6); pos = hp.clone().lerp(new THREE.Vector3(hp.x + 1.0, 0.15, hp.z - 0.2), k); pos.y += 0.7 * Math.sin(Math.PI * k); ry = A.yaw + 7 * k; vis = k < 1; }
      else if (t < S.pendura - 0.35) { pos = hp; ry = A.yaw; placaMao = 1; if (S.aparece != null && t >= S.aparece) sc = back(clamp((t - S.aparece) / 0.35)); }
      else if (t < S.pendura + 0.45) { const k = smooth(S.pendura, S.pendura + 0.45, t); pos = hp.clone().lerp(W, k); const r0 = A.yaw; ry = r0 + (Math.round(r0 / (2 * Math.PI)) * 2 * Math.PI - r0) * k; bracosCima = 1; placaMao = 1 - k; }
      else sw0 = S.pendura + 0.45;
      bon.placa.visible = vis; bon.placa.position.copy(pos); bon.placa.rotation.y = ry; bon.placa.scale.setScalar(Math.max(0.001, sc));
      const dt = sw0 == null ? 0 : Math.max(0, t - sw0); bon.placaPiv.rotation.z = sw0 == null ? 0 : (V.placaTorta ?? -0.13) + 0.22 * Math.exp(-dt * 2.2) * Math.sin(dt * 7.5);
      if (placaMao > 0.01) { const w = placaMao; A.aLx += (-1.3 - A.aLx) * w; A.aRx += (-1.3 - A.aRx) * w; A.aLz += (0.28 - A.aLz) * w; A.aRz += (-0.28 - A.aRz) * w; }
      if (bracosCima > 0.01) { const w = bracosCima; A.aLx += (-2.6 - A.aLx) * w; A.aRx += (-2.6 - A.aRx) * w; }
    }
    if (bon.praca || bon.mover) bon.pracaPose(P, A, t);
    poseKid(hero, P, t, 0.3); poseKid(bon.val, A, t, 1.9);
    if (bon.praca || bon.mover) bon.pracaPos2(P, A, t);
    hero.g.visible = true; bon.val.g.visible = true; bot.g.visible = false;
    const pl = V.placa || {};
    if (!bon.placa || V.placaSeq) {}
    else if (pl.t0 != null) {
      const k = clamp((t - pl.t0) / 0.45); bon.placa.visible = t >= pl.t0; let sc_ = back(k);
      if (pl.troca != null) sc_ = t < pl.troca ? sc_ * (1 - smooth(pl.troca - 0.45, pl.troca - 0.02, t)) : back(clamp((t - pl.troca) / 0.45));
      bon.placa.scale.setScalar(Math.max(0.001, sc_));
      const dt = Math.max(0, t - (pl.troca != null && t >= pl.troca ? pl.troca : pl.t0)); bon.placaPiv.rotation.z = (pl.torta ?? -0.12) + 0.22 * Math.exp(-dt * 2.2) * Math.sin(dt * 7.5);
    } else bon.placa.visible = true;
  }

  function frameBlender(t, env, shot) {
    const P = actor('h', t); P.x = -0.4; P.z = 0.3;
    for (const [a, b, k] of (V.acoes || [])) {
      const w = win(t, a, b, 0.2); if (w < 0.001) continue;
      if (k === 'acena') { P.aRz += 2.35 * w; P.aRx -= 0.3 * w; P.hy += 0.25 * w; P.mouth += 0.6 * w; P.hop += 0.04 * w * Math.abs(Math.sin(t * 9)); }
      if (k === 'orgulho') { P.hp -= 0.12 * w; P.mouth += 0.3 * w; }
      if (k === 'olhaClaude') { P.hy += 0.4 * w; P.mouth += 0.4 * w; }
      if (k === 'olhaCamera') { P.hy -= 0.2 * w; }
      if (k === 'pula') P.hop += 0.08 * w * Math.abs(Math.sin(t * 8));
      if (k === 'comemora') { P.aLz -= 2.4 * w; P.aRz += 2.3 * w; P.hop += 0.09 * w * Math.abs(Math.sin(t * 9)); P.mouth += 0.5 * w; }
      if (k === 'triste') { P.hp += 0.3 * w; P.mouth -= 1.5 * w; P.browT += 0.22 * w; P.lean += 0.1 * w; }
      if (k === 'pensa') { P.aLx -= 2.3 * w; P.aLz += 0.35 * w; P.hr += 0.08 * w; }
    }
    if (talking('h', t) && env > 0.1) P.open = Math.max(P.open, Math.min(1, 0.08 + env * 1.15));
    poseKid(hero, P, t, 0.3);
    friend.g.visible = false;
    const CL = V.claude || {};
    const shy = winMax(t, CL.timido), laugh = winMax(t, CL.risada, 0.15), jump = winMax(t, CL.pula, 0.15);
    let spin = 0; for (const g of (CL.giros || [])) spin += smooth(g, g + 0.8, t) * Math.PI * 2;
    botAt(t, env, 0.55, 2.0 + 0.06 * laugh * Math.abs(Math.sin(t * 22)) + 0.12 * jump * Math.abs(Math.sin(t * 9)), -0.1, botLook(t) * 0.8 + spin - 0.35 * shy, 0.28 * shy + 0.05);
    if (shy > 0.01) { bot.eyeL.scale.y *= 1 - 0.75 * shy; bot.eyeR.scale.y *= 1 - 0.75 * shy; }
    halo.material.opacity *= 0.45;
    hero.g.visible = bot.g.visible = !shot.scr;
  }

  function cineLights(t, env, shot) {
    const ug = t >= V.ugly[0] && t < V.ugly[1];
    let flick = 1; for (const a of ((V.textos || {}).apagao || [])) if (t > a - 0.26 && t < a + 0.34) flick *= t < a ? 0.12 + 0.1 * Math.sin(t * 90) : smooth(a, a + 0.14, t);   // luzes piscam
    cine.oldLights.forEach(l => (l.intensity = 0));
    const ang = cine.sub * 2.39996, rr = Math.sqrt((cine.sub + 0.5) / cine.NS) * 0.03;          // sol "de area": sombras suaves
    tmpV.copy(cine.sunDir); tmpV.y += Math.cos(ang) * rr; tmpV.z += Math.sin(ang) * rr; tmpV.normalize();
    cine.sun.position.copy(cine.sunT).addScaledVector(tmpV, -14);
    cine.sun.intensity = ug ? 0 : 9 * flick;
    cine.hemi.intensity = ug ? 0 : 0.06 * (0.4 + 0.6 * flick);
    cine.bounce.intensity = ug ? 0 : 1.2 * flick;
    cine.rimL.intensity = ug ? 0 : 0.6 * flick; cine.winL.intensity = ug ? 0 : 2.2 * flick;
    cine.lamp.intensity = ug ? 0 : 2.5 * flick; cine.bulbM.color.setHex(0xffe0b0).multiplyScalar(ug ? 0.3 : 1.6 * flick);
    cine.scrL.intensity = ug ? 0 : 1.0;
    cine.uglyHemi.visible = ug;
    cine.shafts.visible = cine.dust.visible = !ug;
    cine.shafts.children.forEach((m, i) => (m.material.opacity = cine.shaftOp * flick * 0.85));
    const dp = cine.dust.geometry.attributes.position; cine.dustSeed.forEach((pp, i) => dp.setXYZ(i, pp.x + 0.06 * Math.sin(t * 0.3 + i), pp.y + 0.03 * Math.sin(t * 0.23 + i * 1.7), pp.z + 0.06 * Math.cos(t * 0.27 + i * 0.7))); dp.needsUpdate = true;
    scene.overrideMaterial = ug ? cine.ugly : null; cine.gtao.enabled = cine.bokeh.enabled = !ug;
    scene.fog = ug ? null : cine.fog; scene.background = ug ? cine.uglyBg : cine.bg;
    halo.visible = !ug && !shot.scr; bot.rings.forEach(r => (r.visible = !ug));
    if (ug) bot.inner.intensity = 0;
    cine.bokeh.uniforms.focus.value = shot.focus;
    cine.bokeh.uniforms.aperture.value = shot.name === 'MOUTH' ? 0.005 : shot.name === 'EST' || shot.name.startsWith('ORB') || shot.name === 'W2' || shot.name === 'REV' ? 0.0013 : shot.scr ? 0.0022 : 0.003;
    bloom.strength = ug ? 0 : 0.32; bloom.threshold = 0.8;   // luz fixa (nao pulsa com a voz)
  }

  const TX = V.textos || {};
  if (CINE) {
    const tt = ovl('ttl'); tt.firstElementChild.textContent = TX.titulo ? TX.titulo.texto : '';
    const cm = ovl('cmts'); cm.innerHTML = '';
    if (TX.gancho) { ovl('gancho').children[0].innerHTML = TX.gancho.linhas[0] || ''; ovl('gancho').children[1].innerHTML = TX.gancho.linhas[1] || ''; ovl('gancho').children[1].style.display = TX.gancho.linhas[1] ? '' : 'none'; }
    if (TX.selo) ovl('selo').textContent = TX.selo.texto;
    if (TX.fim) { ovl('fimtxt').children[0].innerHTML = TX.fim.linhas[0] || ''; ovl('fimtxt').children[1].innerHTML = TX.fim.linhas[1] || ''; }
    ((TX.comentarios || {}).itens || []).forEach((c, i) => { const d = document.createElement('div'); d.textContent = c; d.dataset.r = String([-4, 3, 2, -3, -2, 4][i % 6]);
      d.style.top = (330 + i * 175) + 'px'; d.style[i % 2 ? 'right' : 'left'] = (60 + (i * 37) % 60) + 'px'; cm.appendChild(d); });
  }
  function cineOverlays(t) {
    const ti = TX.titulo;
    if (ti) { ovl('ttl').style.opacity = smooth(ti.t0, ti.t0 + 0.3, t) * (1 - smooth(ti.t1 - 0.3, ti.t1, t)); ovl('ttl').style.transform = `scale(${1.08 - 0.08 * smooth(ti.t0, ti.t1, t)})`; ovl('ttl').classList.toggle('x', ti.riscar != null && t > ti.riscar); }
    else ovl('ttl').style.opacity = 0;
    const co = TX.comentarios;
    if (co) { ovl('cmts').style.opacity = smooth(co.t0, co.t0 + 0.25, t) * (1 - smooth(co.t1 - 0.3, co.t1, t));
      [...ovl('cmts').children].forEach((c, i) => { const k = smooth(co.t0 + 0.05 + i * 0.32, co.t0 + 0.3 + i * 0.32, t); c.style.opacity = k; c.style.transform = `translateY(${(1 - k) * 40}px) rotate(${c.dataset.r}deg)`; }); }
    else ovl('cmts').style.opacity = 0;
    let tag = null; for (const e of (TX.etiquetas || [])) if (t >= e[0] && t < e[1]) tag = e;
    ovl('tag').style.opacity = tag ? Math.min(1, (t - tag[0]) / 0.18) * (1 - smooth(tag[1] - 0.35, tag[1], t)) : 0;
    if (tag) { ovl('tag').textContent = tag[2]; ovl('tag').className = tag[3] === 'ruim' ? 'bad' : 'good'; }
    let fl = 0; for (const f of (TX.flashes || [])) if (t >= f) fl = Math.max(fl, 1 - smooth(f, f + 0.38, t));
    ovl('flash').style.opacity = fl;
    // serie de bonecos: gancho fixo no comeco, selo da parte e texto final
    const gs = TX.gancho; if (gs) { const k = 1 - smooth(gs.t1 - 0.35, gs.t1, t); ovl('gancho').style.opacity = t < gs.t1 ? k : 0; }
    const se = TX.selo; if (se) ovl('selo').style.opacity = t >= (se.t0 || 0) && t < (se.t1 || DUR) ? 1 : 0;
    const fi = TX.fim; if (fi) { const k = smooth(fi.t0, fi.t0 + 0.35, t); ovl('fimtxt').style.opacity = k; ovl('fimtxt').style.transform = `translateY(${(1 - k) * 40}px)`; }
  }

  const fadeEl = document.getElementById('fade'), discEl = document.getElementById('disc');
  function stepScene(t) {
    const env = envAt(t), shot = cam(t);
    const work = PLANO ? (framePlano(t, env, shot), 0) : BLENDER ? ((BON ? frameBonecos : frameBlender)(t, env, shot), 0) : frameFesta(t, env, shot);
    if (BON && V.telaCelular && shot.scr) bonTela(shot, t);
    drawTelao(t); if (!CINE) drawMinis(t);
    // luzes: neon pulsando no tempo da musica (100 bpm)
    const beat = 0.78 + 0.22 * Math.exp(-((t % 0.6) * 5)), dim = 1 - 0.65 * work;
    lightL.intensity = 6 * beat * dim; lightR.intensity = 5 * beat * dim; lightT.intensity = (2.6 + 0.4 * Math.sin(t * 2.3)) * (1 - 0.3 * work);
    neonL.color.setHex(0xff3fa4).multiplyScalar(beat * dim); neonR.color.setHex(0x4fd8ff).multiplyScalar(beat * dim); ledM.color.setHex(0x9a6cff).multiplyScalar((0.7 + 0.3 * Math.sin(t * 1.4)) * dim);
    fans.forEach((f, i) => (f.rotation.z = t * (4 + i)));
    const car = shot.name === 'CAR';
    key.color.setHex(0xe8e0ff); key.intensity = car ? 0.9 : 0.55 * dim; key.position.set(car ? CARX - 3.5 : -3.5, 5.5, 6.5); key.target.position.set(car ? CARX : 0, 1.2, 0);
    spot.position.set(car ? CARX : 0.2, 6.5, 4.6); spot.target.position.set(car ? CARX : 0, 1.3, 0); spot.intensity = car ? 30 : 15 * dim; spot.angle = car ? 0.5 : 0.4;
    panelLight.intensity = 0; edgeLight.intensity = car ? 3.5 : 0; edgeLight.position.set(car ? CARX : 0, 0.25, 1.9);
    rim.intensity = car ? 3 : 1.2; rim2.intensity = car ? 1.9 : 0.8;
    cityMats.forEach(m => m.color.setScalar(1.0));
    bloom.strength = 0.42 + 0.06 * env;
    if (CINE) cineLights(t, env, shot);
    if (BON && bon.praca) bon.pracaLuz(t, shot);
    if (BON && bon.quarto) bon.quartoLuz(t, shot);
    if (BON) { halo.visible = false; cine.lamp.intensity = 0; if (shot.scr) cine.bokeh.uniforms.aperture.value = 0.0007;
      if (V.telaCelular && shot.scr) { cine.shafts.visible = cine.dust.visible = false; bloom.strength = 0; } }   // nada de raio de sol lavando a tela do celular
    return { shot, car };
  }
  function cineRender(t) {
    const NS = cine.NS;
    const bounds = CUTS.map(c => c[0]).concat(V.ugly).sort((a, b) => a - b);      // o motion blur nao atravessa cortes
    let a = 0, b = DUR + 1; for (const x of bounds) { if (x <= t) a = x; else { b = x; break; } }
    if (!cine.envDone) {           // iluminacao global aproximada: captura o quarto iluminado e usa como luz ambiente e reflexos
      stepScene(3.0); const vis = [hero.g.visible, bot.g.visible, halo.visible]; hero.g.visible = bot.g.visible = halo.visible = false; if (BON) bon.val.g.visible = false; cine.shafts.visible = cine.dust.visible = false;
      cine.cubeCam.update(renderer, scene);
      scene.environment = new THREE.PMREMGenerator(renderer).fromCubemap(cine.cubeRT.texture).texture; scene.environmentIntensity = 0.6;
      [hero.g.visible, bot.g.visible, halo.visible] = vis; if (BON) { bon.val.g.visible = true; bot.g.visible = halo.visible = false; } cine.envDone = true;
    }
    renderer.setRenderTarget(cine.acc); renderer.setClearColor(0x000000, 1); renderer.clear();
    let st;
    for (let s = 0; s < NS; s++) {
      const ts = clamp(t + ((s + 0.5) / NS - 0.5) * cine.shutter, a, b - 1e-4);
      cine.sub = s; st = stepScene(ts);
      camera.setViewOffset(1080, 1920, ((s * 7) % NS + 0.5) / NS - 0.5, ((s * 3) % NS + 0.5) / NS - 0.5, 1080, 1920);
      composer.render();
      camera.clearViewOffset();
      cine.accQ.material.uniforms.tDiffuse.value = composer.readBuffer.texture; cine.accQ.material.uniforms.w.value = 1 / NS;
      renderer.setRenderTarget(cine.acc); renderer.autoClear = false; cine.accQ.render(renderer); renderer.autoClear = true;
    }
    renderer.setRenderTarget(null);
    const u = cine.gradeQ.material.uniforms; u.tDiffuse.value = cine.acc.texture; u.time.value = t; u.amount.value = t >= V.ugly[0] && t < V.ugly[1] ? 0 : 1;
    cine.gradeQ.render(renderer);
    return st;
  }
  window.renderFrame = (t) => {
    let st;
    if (CINE) { st = cineRender(t); cineOverlays(t); }
    else { st = stepScene(t); composer.render(); }   // 14/11: o celular grande no topo saiu (info = corte pra tela dentro do 3D)
    fadeEl.style.opacity = Math.max(BON ? 0 : 1 - smooth(0, 0.3, t), smooth(DUR - (BON ? 0.5 : 0.9), DUR - 0.1, t));
    discEl.style.opacity = st.car ? 1 : 0;
    let html = '', who = 'h';
    for (const ln of LN) if (t >= ln[0] && t < ln[1] + 0.1) { html = ln[3]; who = ln[2]; }
    subEl.className = who === 'h' ? '' : who;
    if (subEl.dataset.h !== html) { subEl.innerHTML = html; subEl.dataset.h = html; }
    return true;
  };
}
