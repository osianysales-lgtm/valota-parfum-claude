# Velma — GSAP Motion Guide

Guia de referência para Velma criar animações HTML usando GSAP em vez de CSS keyframes puros.

> **Ver também:** `velma_extensions_guide.md` — guia unificado das 3 extensões (GSAP + Motion Studio + Three.js) com templates completos e quando usar cada uma.

---

> **Atualização (Dafne v3):** este guia nasceu na versão antiga da Dafne (gravação de tela). Hoje o render é quadro a quadro, então:
> ignore `document.title = 'READY'`, `window._animStartPerf` e qualquer menção a "CDP screencast" (não fazem mal, mas não são mais necessários);
> prefira `window.render(t)` ou timelines GSAP; a cópia local do GSAP é usada automaticamente.
> **Fontes:** use as da ficha da marca (a Dafne injeta `--fonte-*`), não Google Fonts. Motion Studio e Three.js via CDN precisam de internet no render.

## 1. Setup obrigatório no `<head>`

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<!-- Opcional — para animações de texto letra por letra -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/TextPlugin.min.js"></script>
```

Remover completamente o bloco `@keyframes` do CSS. GSAP controla tudo via JS.

---

## 2. Estado inicial dos elementos no CSS

Em vez de `opacity:0; transform:translateY(20px)` inline no CSS, deixar os elementos no estado **neutro** e usar `gsap.set()` antes de animar:

```css
/* CSS — apenas layout, sem estado de animação */
.titulo { font-size: 72px; font-weight: 900; color: #fff; }
```

```js
// JS — setar estado inicial antes de rodar
gsap.set('.titulo', { opacity: 0, y: 40 });
```

---

## 3. Substituição direta: `fire()` → GSAP

### Antes (CSS keyframes)
```js
fire(el, 'slideUp', 500, 'cubic-bezier(0.34,1.2,0.64,1)');
```

### Depois (GSAP)
```js
gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' });
```

---

## 4. GSAP Snippets — referência rápida

Estes snippets são ativados no VS Code com a extensão **GSAP Snippets**:

| Snippet | Resultado |
|---|---|
| `gto` | `gsap.to(target, { duration, vars })` |
| `gfrom` | `gsap.from(target, { duration, vars })` |
| `gfromTo` | `gsap.fromTo(target, {from}, {to})` |
| `gset` | `gsap.set(target, { vars })` |
| `gtl` | `const tl = gsap.timeline()` |
| `gstagger` | `stagger: 0.1` dentro de um `.to()` |
| `gkill` | `gsap.killTweensOf(target)` |

---

## 5. Easings GSAP (substitutos dos cubic-bezier)

| Antigo (CSS) | GSAP equivalente |
|---|---|
| `cubic-bezier(0.34,1.56,0.64,1)` — spring forte | `back.out(2.5)` |
| `cubic-bezier(0.34,1.3,0.64,1)` — spring médio | `back.out(1.7)` |
| `cubic-bezier(0.34,1.2,0.64,1)` — spring suave | `back.out(1.2)` |
| `cubic-bezier(0.76,0,0.24,1)` — circle reveal | `power3.inOut` |
| `ease` | `power1.out` |
| `ease-in` | `power2.in` |
| `ease-out` | `power2.out` |
| `linear` | `none` |

**Outros easings úteis para motion design:**
- `elastic.out(1, 0.5)` — elástico dramático
- `expo.out` — desaceleração forte
- `circ.out` — circular
- `bounce.out` — quica
- `power4.out` — aceleração intensa

---

## 6. Padrões de animação por tipo de elemento

### Elemento entrando (pop/scale)
```js
gsap.fromTo(el, 
  { scale: 0, opacity: 0 }, 
  { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
);
```

### Elemento entrando (slide de baixo)
```js
gsap.fromTo(el, 
  { y: 40, opacity: 0 }, 
  { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }
);
```

### Linha crescendo (width 0 → N)
```js
gsap.to(el, { width: 220, duration: 0.5, ease: 'expo.out' });
```

### Stagger — lista de elementos com delay entre eles
```js
gsap.fromTo('.card', 
  { y: 30, opacity: 0 }, 
  { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out', stagger: 0.08 }
);
```

### Circle reveal (transição de cena)
```js
gsap.to('#overlay', { 
  clipPath: 'circle(1200px at 50% 50%)', 
  duration: 0.7, 
  ease: 'power3.inOut' 
});
```

### Fade out de cena
```js
gsap.to('#scene', { opacity: 0, scale: 0.975, duration: 0.3, ease: 'power2.in' });
```

---

## 7. Sequenciamento com Timeline (substitui await/wait)

### Antes (await)
```js
fire(el1, 'slideUp', 500, 'ease');
await wait(500);
fire(el2, 'fadeIn', 400, 'ease');
await wait(400);
fire(el3, 'scaleIn', 600, 'ease');
```

### Depois (GSAP Timeline)
```js
const tl = gsap.timeline();
tl.to(el1, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' })
  .to(el2, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '+=0')
  .to(el3, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, '+=0');
```

**Posição na timeline:**
- `'+=0'` — logo após o anterior terminar
- `'-=0.2'` — 200ms antes do anterior terminar (overlap)
- `'<'` — no mesmo instante que o anterior começou
- `'<0.1'` — 100ms depois que o anterior começou

---

## 8. Animações contínuas (loop)

### Pulso
```js
gsap.to(el, { scale: 1.06, duration: 0.8, ease: 'power1.inOut', yoyo: true, repeat: -1 });
```

### Float (subir e descer)
```js
gsap.to(el, { y: -12, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
```

### Rotação contínua
```js
gsap.to(el, { rotation: 360, duration: 4, ease: 'none', repeat: -1 });
```

### Blink
```js
gsap.to(el, { opacity: 0, duration: 0.5, ease: 'power2.inOut', yoyo: true, repeat: -1 });
```

---

## 9. Padrão de cena completo

Estrutura recomendada para cada cena no `run()`:

```js
async function showScene2() {
  // 1. Setar estado inicial de todos os elementos da cena
  gsap.set(['#s2-title', '#s2-sub', '#s2-badge'], { opacity: 0, y: 30 });

  // 2. Ativar cena (opacity:1 da .scene)
  showScene('s2');

  // 3. Animar com timeline
  const tl = gsap.timeline();
  tl.to('#s2-title', { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' })
    .to('#s2-badge', { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.1')
    .to('#s2-sub', { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1');

  // 4. Aguardar a cena terminar
  await wait(2800);
}
```

---

## 10. Motion Studio (motion.dev) — física de mola e animate()

Motion Studio é uma biblioteca separada do GSAP com física de mola **real** (não simulada). Usar para elementos que precisam de bounce/spring genuíno.

### Setup no `<head>` (junto com GSAP)
```html
<script src="https://cdn.jsdelivr.net/npm/motion@11.15.0/dist/motion.js"></script>
```

### Destructure no script
```js
const { animate: motAnimate, spring, stagger: motStagger } = Motion;
```

### API — `motAnimate(element, keyframes, options)`
```js
// Spring físico — elemento entra com mola real
motAnimate(el,
  { opacity: [0, 1], y: [60, 0] },
  {
    duration: 0.7,
    delay: 0.3,
    easing: spring({ stiffness: 220, damping: 18, mass: 0.9 })
  }
);

// Loop yoyo via keyframes (0→-10→0)
motAnimate(el,
  { y: [0, -10, 0] },
  { duration: 1.4, repeat: Infinity, easing: 'ease-in-out', delay: 0.9 }
);
```

### Parâmetros do spring() — motion.dev vanilla (NÃO Framer Motion)
```js
// motion.dev usa visualDuration + bounce, não stiffness/damping/mass
motAnimate(el, { opacity: [0, 1] }, { easing: spring() })           // default
motAnimate(el, { opacity: [0, 1] }, { easing: spring({ visualDuration: 0.5, bounce: 0.35 }) })
```
| Parâmetro | Significado | Default |
|---|---|---|
| `visualDuration` | duração percebida (segundos) | 0.8 |
| `bounce` | springiness 0→sem bounce, 1→muito bounce | 0.25 |

**ATENÇÃO:** `stiffness`, `damping`, `mass` são parâmetros do Framer Motion (React), NÃO do motion.dev vanilla. Usá-los no CDN de motion@11 causa erro e termina o `run()`.

**Alternativa segura e validada:** usar cubic-bezier como easing (suportado pelo WAAPI):
```js
motAnimate(el,
  { opacity: [0, 1], transform: ["translateY(60px)", "translateY(0px)"] },
  { duration: 0.7, delay: 0.5, easing: [0.34, 1.56, 0.64, 1] }  // back-out effect
);
```

### Quando usar Motion vs GSAP
| Situação | Usar |
|---|---|
| Spring/bounce físico real | Motion `spring()` |
| Timeline sequencial (uma após outra) | GSAP `.timeline()` |
| Circle reveal, curtain, overlay | GSAP (clip-path + transformOrigin) |
| Stagger com delay calculado | Ambos funcionam |
| Loop contínuo (yoyo) | Motion (array keyframes `[a,b,a]`) ou GSAP `yoyo:true` |

---

## 11. Regras obrigatórias para compatibilidade com Daphne

1. **Nunca usar `will-change: transform`** em excesso — consome memória no CDP screencast
2. **Não misturar** CSS `@keyframes` com GSAP no mesmo elemento — escolher um ou outro
3. **`gsap.set()`** antes do `showScene()`, não depois — garante que o estado inicial está correto antes da cena aparecer
4. **`window._animStartPerf`** deve ser setado ANTES de qualquer GSAP call:
   ```js
   window._animStartPerf = performance.now();
   ```
5. Para sincronizar com o audio map do Scooby, a fórmula de timing não muda:
   ```
   t (segundos para Scooby) = (ms_desde_início_do_run - 50) / 1000
   ```

---

## 12. Template mínimo de HTML com GSAP

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { width:1080px; height:1920px; overflow:hidden; font-family:'Inter',sans-serif; }
    .scene { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; pointer-events:none; }
    .scene.active { opacity:1; pointer-events:auto; }
  </style>
</head>
<body>

  <div id="s1" class="scene">
    <h1 id="s1-title">TÍTULO</h1>
  </div>

  <script>
    window._animStartPerf = performance.now();
    const wait = ms => new Promise(r => setTimeout(r, ms));

    function showScene(id) {
      document.querySelectorAll('.scene').forEach(s => { s.classList.remove('active'); gsap.killTweensOf(s); });
      const s = document.getElementById(id);
      if (s) s.classList.add('active');
    }

    async function run() {
      await wait(50); // audio offset

      /* S1 */
      gsap.set('#s1-title', { opacity: 0, y: 40 });
      showScene('s1');
      gsap.to('#s1-title', { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' });
      await wait(2500);

      document.title = 'READY';
    }
    run();
  </script>
</body>
</html>
```
