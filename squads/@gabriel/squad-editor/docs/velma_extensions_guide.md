# Velma — Guia de Extensões (GSAP + Motion Studio + Three.js)

Referência completa das 3 extensões VS Code para motion design em vídeos HTML→MP4.

---

> **Atualização (Dafne v3):** este guia nasceu na versão antiga da Dafne (gravação de tela). Hoje o render é quadro a quadro, então:
> ignore `document.title = 'READY'`, `window._animStartPerf` e qualquer menção a "CDP screencast" (não fazem mal, mas não são mais necessários);
> prefira `window.render(t)` ou timelines GSAP; a cópia local do GSAP é usada automaticamente.
> **Fontes:** use as da ficha da marca (a Dafne injeta `--fonte-*`), não Google Fonts. Motion Studio e Three.js via CDN precisam de internet no render.

## SETUP — EXTENSÕES VS CODE (CAMINHO 1 APENAS)

Estas extensões são **exclusivas do Caminho 1** (animação motion). O Caminho 2 (edição de vídeo gravado) não depende de nenhuma delas.

### O que instalar e por quê

| Extensão | ID no VS Code | Obrigatória? | Função |
|---|---|---|---|
| **GSAP Snippets** | `hridoy.gsap-snippets` | Recomendada | Autocomplete para `gsap.to`, `gsap.timeline`, easings |
| **Motion Studio** | extensão Motion | Opcional | Preview visual de animações spring/bounce em tempo real |
| **Three.JS Snippets** | `aerokaido.threejs-snippets` | Opcional | Snippets para cenas 3D (só se o projeto usar Three.js) |

> **Sem as extensões o código funciona igual** — elas são apenas atalhos de produtividade para escrever mais rápido. A Dafne renderiza o HTML independente de ter ou não as extensões instaladas.

### Como instalar (VS Code)

1. Abrir VS Code
2. `Ctrl+Shift+X` → painel de Extensões
3. Pesquisar pelo nome e clicar em **Install**

Ou via terminal:
```bash
code --install-extension hridoy.gsap-snippets
code --install-extension aerokaido.threejs-snippets
```

Motion Studio só está disponível pelo marketplace do VS Code (não tem ID de linha de comando).

### Se o usuário não tiver as extensões

O código gerado pela Velma **não depende das extensões** para funcionar. A diferença é apenas na experiência de escrita:
- Sem GSAP Snippets → digita o código manualmente (sem autocomplete)
- Sem Motion Studio → não tem preview visual das animações spring
- Sem Three.JS Snippets → digita os objetos Three.js manualmente

---

## QUANDO USAR CADA UMA

| Situação | Ferramenta |
|---|---|
| Timelines sequenciais, transições de cena, stagger de listas | **GSAP** |
| Spring/bounce físico num elemento específico | **Motion** |
| Background 3D (partículas, formas flutuantes, shaders) | **Three.js** |
| Loops contínuos (float, pulse, rotate) | **GSAP** (yoyo) ou **Motion** (keyframe array) |
| Animação de texto letra-a-letra | **GSAP** (TextPlugin) |
| SVG path drawing | **GSAP** (DrawSVGPlugin) |
| Overlay de transição (circle reveal, curtain, slide) | **GSAP** sempre |

**Regra geral:** GSAP é o motor principal. Motion complementa com spring real. Three.js substitui o canvas 2D de partículas por cenas 3D.

---

## 1. GSAP 3.12 — Extensão `hridoy.gsap-snippets`

### Setup (já validado)

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<!-- Plugins opcionais -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/TextPlugin.min.js"></script>
```

Plugins carregados via `<script>` se auto-registram — sem `gsap.registerPlugin()` manual.

### Snippets da extensão

| Snippet | Gera |
|---|---|
| `gto` | `gsap.to(target, { duration, vars })` |
| `gfrom` | `gsap.from(target, { duration, vars })` |
| `gfromTo` | `gsap.fromTo(target, {from}, {to})` |
| `gset` | `gsap.set(target, { vars })` |
| `gtl` | `const tl = gsap.timeline()` |
| `gstagger` | `stagger: 0.1` |
| `gkill` | `gsap.killTweensOf(target)` |

### Easings para motion design de vídeo

| Situação | Easing |
|---|---|
| Entrada padrão | `expo.out` |
| Bounce leve (pop in) | `back.out(1.7)` |
| Bounce forte | `back.out(2.6)` |
| Elástico dramático | `elastic.out(1, 0.5)` |
| Circle/curtain reveal | `power3.inOut` |
| Loop suave (float/pulse) | `sine.inOut` |
| Saída de cena | `power2.in` |

### Padrões obrigatórios com Daphne

```js
// 1. Sempre gsap.set() ANTES de showScene()
gsap.set(["#titulo", "#sub", ".card"], { opacity: 0 });
showScene("s1");
gsap.fromTo("#titulo", { opacity:0, y:40 }, { opacity:1, y:0, duration:0.6, ease:"expo.out" });

// 2. Sempre killTweensOf() antes de set() em overlays
gsap.killTweensOf("#ov-circle");
gsap.set("#ov-circle", { clipPath:"circle(0px at 50% 50%)" });

// 3. await wait() sempre = duração_ms + ~20ms buffer
gsap.to("#ov", { duration:0.5, ... });
await wait(520); // 500ms + 20ms

// 4. document.title = 'READY' como ÚLTIMA linha do run() — DENTRO da função
async function run() {
  // ... toda a animação ...
  document.title = 'READY';
}
```

### Animações contínuas (loops)

```js
// Float
gsap.to(el, { y:-12, duration:1.4, ease:"sine.inOut", yoyo:true, repeat:-1 });

// Pulse
gsap.to(el, { scale:1.06, duration:0.8, ease:"sine.inOut", yoyo:true, repeat:-1 });

// Glow text
gsap.to(el, { textShadow:"0 0 60px rgba(20,255,0,0.6)", duration:1.1, ease:"sine.inOut", yoyo:true, repeat:-1 });

// Rotação
gsap.to(el, { rotation:360, duration:4, ease:"none", repeat:-1 });
```

### TextPlugin — texto animado

```js
// Typewriter (caractere a caractere)
gsap.to("#texto", { duration:2, text:"NOME DA SUA EMPRESA", ease:"none" });

// Scramble manual (sem plugin extra)
const msg = "EMPRESA";
gsap.to({ v:0 }, {
  v: msg.length, duration:1.5,
  onUpdate() {
    document.querySelector("#texto").textContent = msg.slice(0, Math.round(this.targets()[0].v));
  }
});
```

---

## 2. MOTION STUDIO — Extensão `motion.motion-vscode-extension`

### O que a extensão oferece

- **Transition Editor**: editor visual de curvas de easing em tempo real
- **Bezier Curve Editor**: ajuste gráfico de cubic bezier com preview
- **AI Context**: acesso automático à documentação da API para o Claude/Copilot
- **380+ exemplos** navegáveis em examples.motion.dev (copiar-colar direto)

### Setup

```html
<script src="https://cdn.jsdelivr.net/npm/motion@11.15.0/dist/motion.js"></script>
```

```js
// Destructure no início do script — spring e stagger são opcionais
const { animate: motAnimate, stagger: motStagger } = Motion;
```

### API principal — `motAnimate()`

```js
// Sintaxe
motAnimate(element, keyframes, options)

// Exemplo: fade + slide com cubic-bezier
motAnimate(el,
  { opacity: [0, 1], transform: ["translateY(60px)", "translateY(0px)"] },
  { duration: 0.7, delay: 0.3, easing: [0.34, 1.56, 0.64, 1] }
);

// Exemplo: loop yoyo via keyframe array [a, b, a]
motAnimate(el,
  { transform: ["translateY(0px)", "translateY(-10px)", "translateY(0px)"] },
  { duration: 1.4, repeat: Infinity, easing: "ease-in-out", delay: 0.5 }
);
```

### spring() — uso CORRETO para motion.dev vanilla

```js
// ⚠️ ATENÇÃO: motion.dev usa visualDuration + bounce
// NÃO usar stiffness/damping/mass (esses são do Framer Motion React)
const { animate: motAnimate, spring } = Motion;

motAnimate(el,
  { opacity: [0, 1], transform: ["scale(0.5)", "scale(1)"] },
  { easing: spring({ visualDuration: 0.6, bounce: 0.4 }) }
);
```

| Parâmetro | Descrição | Exemplos |
|---|---|---|
| `visualDuration` | duração percebida (segundos) | 0.4 (rápido) / 0.8 (natural) |
| `bounce` | springiness (0→sem bounce, 1→muito) | 0.25 (suave) / 0.5 (bouncy) |

**Regra de ouro:** Quando `spring()` causar erro no Puppeteer, usar cubic-bezier `[0.34, 1.56, 0.64, 1]` como fallback seguro.

### stagger() com Motion

```js
const { animate: motAnimate, stagger: motStagger } = Motion;

const cards = document.querySelectorAll(".card");
cards.forEach((el, i) => {
  motAnimate(el,
    { opacity: [0, 1], transform: ["translateY(40px)", "translateY(0px)"] },
    { duration: 0.6, delay: 0.3 + i * 0.12, easing: [0.34, 1.56, 0.64, 1] }
  );
});

// Ou usando stagger() nativo:
motAnimate(".card",
  { opacity: [0, 1], y: [40, 0] },
  { duration: 0.6, delay: motStagger(0.12, { start: 0.3 }) }
);
```

### Quando Motion brilha vs GSAP

| Motion | GSAP |
|---|---|
| Spring físico com `visualDuration + bounce` | Timelines multi-step encadeados |
| Loop yoyo simples com keyframe array | `killTweensOf()` + reset de overlay |
| Fade/slide de elemento único | Transições de cena (circle, curtain, slide) |
| Integração com Bezier Editor da extensão | Stagger com `from: "center"` |

---

## 3. THREE.JS — Extensão `aerokaido.three-js-snippets`

### Setup — importmap (recomendado)

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
  }
}
</script>
<script type="module">
  import * as THREE from 'three';
  // seu código aqui
</script>
```

### Snippets da extensão

| Snippet | Gera |
|---|---|
| `tinit` | Cena THREE completa: Scene + Camera + Renderer + animate loop |
| `tbi` | Basic init: scene + camera + renderer (sem loop) |
| `tcam` | Seletor de tipo de Camera |
| `tgeo` | Seletor de Geometry |
| `tmat` | Seletor de Material |
| `tlig` | Seletor de Light |
| `tmesh` | Seletor de Object/Mesh |
| `ttexture` | Carregamento de Texture |
| `tren` | Seletor de Renderer |
| `tloader` | Seletor de Loader |
| `tresize` | Resize automático do canvas |

### Estrutura mínima para vídeo (portrait 1080×1920)

```js
// SEMPRE dentro de <script type="module">
import * as THREE from 'three';

window._animStartPerf = performance.now(); // obrigatório para Daphne

const W = 1080, H = 1920;

const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(W, H);
renderer.setPixelRatio(1); // fixo em 1 para Puppeteer
document.body.appendChild(renderer.domElement);

// Posicionar canvas como background
renderer.domElement.style.cssText = "position:absolute;inset:0;z-index:0;";

// Loop — usar setAnimationLoop (mais compatível com headless)
renderer.setAnimationLoop((time) => {
  // time em ms desde início
  // atualizar cena
  renderer.render(scene, camera);
});
```

### Backgrounds 3D — receitas prontas

#### Particle Field 3D (substitui canvas 2D)

```js
import * as THREE from 'three';

function createParticleField(scene, count = 3000, color = 0x14FF00) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color,
    size: 0.04,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}

// No loop:
renderer.setAnimationLoop((time) => {
  points.rotation.y = time * 0.00005;
  points.rotation.x = time * 0.00003;
  renderer.render(scene, camera);
});
```

#### Floating Geometric Shapes

```js
function createFloatingShapes(scene, count = 8) {
  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(0.4, 0),
    new THREE.OctahedronGeometry(0.5),
    new THREE.TorusGeometry(0.4, 0.15, 8, 16),
  ];

  for (let i = 0; i < count; i++) {
    const geo = geos[i % geos.length];
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(i / count, 0.7, 0.5),
      emissive: new THREE.Color(0x14FF00),
      emissiveIntensity: 0.15,
      wireframe: i % 3 === 0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 4
    );
    shapes.push({ mesh, speed: 0.3 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2 });
    scene.add(mesh);
  }
  return shapes;
}

// No loop:
renderer.setAnimationLoop((time) => {
  const t = time * 0.001;
  shapes.forEach(({ mesh, speed, phase }) => {
    mesh.position.y += Math.sin(t * speed + phase) * 0.002;
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.008;
  });
  renderer.render(scene, camera);
});
```

### Combinando Three.js (background) + HTML 2D (texto/cards)

```html
<style>
  body { margin:0; overflow:hidden; background:#0A0A0A; }

  /* Canvas Three.js fica atrás */
  canvas { position:absolute; inset:0; z-index:0; }

  /* Cenas HTML ficam na frente */
  .scene {
    position:absolute; inset:0; z-index:10;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    opacity:0; pointer-events:none;
  }
  .scene.active { opacity:1; }
</style>

<!-- Canvas Three.js inserido pelo JS via renderer.domElement -->

<!-- Cenas HTML normais -->
<div id="s1" class="scene">
  <div id="s1-titulo">{{EMPRESA}}</div>
</div>
```

```js
// Three.js roda em background contínuo
// GSAP anima os elementos HTML em primeiro plano
// Os dois são independentes e não interferem
renderer.setAnimationLoop((time) => {
  points.rotation.y = time * 0.00005;
  renderer.render(scene, camera);
});

// run() controla as cenas HTML normalmente
async function run() {
  await wait(50);
  gsap.set("#s1-titulo", { opacity:0, y:40 });
  showScene("s1");
  gsap.to("#s1-titulo", { opacity:1, y:0, duration:0.6, ease:"expo.out" });
  await wait(2500);
  document.title = 'READY';
}
run();
```

### Compatibilidade com Daphne

| Item | Status | Nota |
|---|---|---|
| WebGL em headless Chrome | ✅ Funciona | Chrome moderno tem WebGL por padrão |
| requestAnimationFrame | ✅ Funciona | A Dafne v3 controla o relógio e avança quadro a quadro |
| `renderer.setAnimationLoop()` | ✅ Recomendado | Mais robusto que rAF em headless |
| ES Modules + importmap | ✅ Chrome headless suporta | Usar `<script type="module">` |
| ShaderMaterial customizado | ⚠️ Pode falhar sem GPU | Testar; fallback para MeshStandardMaterial |
| `alpha: true` no renderer | ✅ Necessário | Para o fundo HTML aparecer atrás |

**Se Three.js não renderizar** (WebGL sem GPU no modo headless): teste antes com `daphne.js --quadros` e, se falhar, use a alternativa sem WebGL.

### Luzes recomendadas para motion design

```js
// Setup de iluminação básico para formas 3D
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 5);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0x14FF00, 1.5, 20);
pointLight.position.set(0, 0, 4);
scene.add(pointLight);
```

---

## 4. TEMPLATE COMPLETO — Three.js Background + GSAP + Motion

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/motion@11.15.0/dist/motion.js"></script>
  <script type="importmap">
    { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js" } }
  </script>
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { width:1080px; height:1920px; overflow:hidden; font-family:'Inter',sans-serif; background:#0A0A0A; }
    #three-canvas { position:absolute; inset:0; z-index:0; }
    .scene {
      position:absolute; inset:0; z-index:10;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      opacity:0; pointer-events:none;
    }
    .scene.active { opacity:1; pointer-events:auto; }
    /* overlays de transição */
    #ov-circle { position:fixed; inset:0; z-index:100; background:#14FF00; clip-path:circle(0px at 50% 50%); pointer-events:none; }
  </style>
</head>
<body>
  <div id="ov-circle"></div>
  <div id="s1" class="scene">
    <h1 id="s1-titulo" style="font-size:120px;font-weight:900;color:#fff;">MARCA</h1>
  </div>

  <script type="module">
    import * as THREE from 'three';

    window._animStartPerf = performance.now();
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const { animate: motAnimate } = Motion;

    // ── Three.js background ─────────────────────────
    const W = 1080, H = 1920;
    const scene3 = new THREE.Scene();
    const cam3   = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    cam3.position.z = 6;

    const ren3 = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    ren3.setSize(W, H);
    ren3.setPixelRatio(1);
    ren3.domElement.id = 'three-canvas';
    document.body.prepend(ren3.domElement);

    // Particle field
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      pos[i*3]   = (Math.random()-0.5)*16;
      pos[i*3+1] = (Math.random()-0.5)*28;
      pos[i*3+2] = (Math.random()-0.5)*8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color:0x14FF00, size:0.03, transparent:true, opacity:0.5 }));
    scene3.add(pts);

    ren3.setAnimationLoop((time) => {
      pts.rotation.y = time * 0.00005;
      ren3.render(scene3, cam3);
    });

    // ── GSAP + Motion HTML animations ──────────────
    function showScene(id) {
      document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }

    async function run() {
      gsap.set("#s1-titulo", { opacity:0, scale:0.6 });
      showScene("s1");

      // GSAP timeline para s1
      gsap.timeline()
        .to("#s1-titulo", { opacity:1, scale:1, duration:0.7, ease:"back.out(2.4)" });

      await wait(2500);
      document.title = 'READY';
    }
    run();
  </script>
</body>
</html>
```

---

## 5. REGRAS OBRIGATÓRIAS — as 3 extensões juntas

1. **`window._animStartPerf`** deve ser a PRIMEIRA linha do script (antes de qualquer biblioteca)
2. **Three.js** usa `<script type="module">` — o restante do código (GSAP, Motion, run()) deve ser colocado DENTRO desse mesmo module ou após
3. **Ordem de z-index:** Three.js canvas `z-index:0` → cenas HTML `z-index:10` → overlays de transição `z-index:100`
4. **`renderer.setPixelRatio(1)`** obrigatório — evita frames duplicados no Daphne
5. **`alpha:true`** no WebGLRenderer para o fundo HTML aparecer através do canvas 3D
6. **Motion spring():** usar `visualDuration + bounce` — nunca `stiffness/damping/mass` no CDN vanilla
7. **`document.title = 'READY'`** sempre dentro de `run()` como última linha
8. Não misturar CSS `@keyframes` com GSAP no mesmo elemento

---

*Criado em jun/2026 — Velma motion design squad*
